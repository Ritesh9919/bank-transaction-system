import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'
import {ApiError} from '../utils/api-error.js'
import {ApiResponse} from '../utils/api-response.js'


export const register = async(req, res, next)=> {
    try {
        const {name, email, password} = req.body;
        const isExist = await User.findOne({email})
        if(isExist) {
            next(new ApiError(422, "User already registered"))
        }
        const user = await User.create({name, email, password})
        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"1d"})
        res.cookie("token", token)
        const loggedInUser = await User.findById(user._id).select("-password")
        return res.status(201).json(new ApiResponse(true, {user:loggedInUser, token}, "User registered successfully"))
    } catch (error) {
        console.error(error)
        next(error)
    }
}