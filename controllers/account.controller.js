import {Account} from '../models/account.model.js'
import { ApiError } from '../utils/api-error.js'
import {ApiResponse} from '../utils/api-response.js'


export const createAccount = async(req, res, next)=> {
    try {
        const user = req.user;
        const account = await Account.create({user:user._id})
        return res.status(201).json(new ApiResponse(true, {account}, "Account created successfully"))
    } catch (error) {
        console.error(error)
        next(error)
    }
}

export const getUserAccount = async(req, res, next)=> {
    try {
        const accounts = await Account.find({user:req.user._id})
        return res.status(200).json(new ApiResponse(true, {accounts}, "User accounts fetched successfully"))
    } catch (error) {
        console.error(error)
        next(error)
    }
}

export const getAccountBalance = async(req, res, next)=> {
    try {
        const {accountId} = req.params
        const account = await Account.findOne(
            {
                _id:accountId,
                user:req.user._id
            }
        )
        if(!account) {
            next(new ApiError(404, "Account not found"))
        }
        const balance = await account.getBalance()
        return res.status(200).json(new ApiResponse(true, {accountId:account._id, balance}, "Account balance fetched successfully"))
    } catch (error) {
        console.error(error)
        next(error)
    }
}