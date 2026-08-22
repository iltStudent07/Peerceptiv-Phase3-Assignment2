import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'

async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError('Authentication required', 401))
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId)
    

        if (!user) {
            return next(new AppError('User not found', 401))
        }

        req.user = user
        next()
    }   catch (err) {
        return next(new AppError('Invalid or expired token', 401))
    }
}

export default authenticate