import {Account} from '../models/account.model.js'
import { ApiError } from '../utils/api-error.js'
import {ApiResponse} from '../utils/api-response.js'


export const createAccount = async(req, res, next)=> {
    try {
        const user = req.user;
        const account = await Account.create({user:user._id})
        return res.status(201).json(new ApiError(true, {account}, "Account created successfully"))
    } catch (error) {
        console.error(error)
        next(error)
    }
}