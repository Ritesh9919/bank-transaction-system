import {ApiError} from '../utils/api-error.js'
import {User} from '../models/user.model.js'
import jwt from 'jsonwebtoken'

export const auth = async(req, res, next)=> {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token) {
        next(new ApiError(401, "Unauthorized"))
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password")
        req.user = user;
        next()
    } catch (error) {
        console.error(error)
        next(error)
    }
}