import {Transaction} from '../models/transaction.model.js'
import {Ledger} from '../models/ledger.model.js'
import {Account} from '../models/account.model.js'
import {sendTransactionEmail} from '../services/email.service.js'
import { ApiError } from '../utils/api-error.js'
import {ApiResponse} from '../utils/api-response.js'
import mongoose from 'mongoose'

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

export const createTransaction = async(req, res, next)=> {

    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        next(new ApiError(400, "FromAccount, toAccount, amount and idempotencyKey are required"))
    }

    const fromUserAccount = await Account.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await Account.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        next(new ApiError(400, "Invalid fromAccount or toAccount"))
    }

    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists = await Transaction.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json(new ApiResponse(true, {transaction:isTransactionAlreadyExists}, "Transaction already processed"))

        }

        if (isTransactionAlreadyExists.status === "PENDING") {
          return res.status(200).json(new ApiResponse(true, {}, "Transaction is still processing"))
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            next(new ApiError(500, "Transaction processing failed, please retry"))
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
            next(new ApiError(500, "Transaction was reversed, please retry"))
        }
    }

    /**
     * 3. Check account status
     */

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        next(new ApiError(400, "Both fromAccount and toAccount must be ACTIVE to process transaction"))
    }

    /**
     * 4. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        next(new ApiError(400, `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`))
    }

    let transaction;
    try {


        /**
         * 5. Create transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await Transaction.create([ {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ]

        const debitLedgerEntry = await Ledger.create([ {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

        const creditLedgerEntry = await Ledger.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        await Transaction.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )


        await session.commitTransaction()
        session.endSession()
    } catch (error) {
           console.log(error)
           next(error)

    }
    /**
     * 10. Send email notification
     */
    await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
    return res.status(201).json(new ApiResponse(true, {transaction}, "Transaction completed successfully"))

}

export const createInitialFundsTransaction = async(req, res, next)=> {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        next(new ApiError(400, "toAccount, amount and idempotencyKey are required"))
    }

    const toUserAccount = await Account.findOne({
        _id: toAccount,
    })
    

    if (!toUserAccount) {
        next(new ApiError(400, "Invalid account"))
    }

    const fromUserAccount = await Account.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        next(new ApiError(400, "System user account not found"))
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new Transaction({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await Ledger.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await Ledger.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json(new ApiResponse(true, {transaction}, "Initial funds transaction completed successfully"))



}


