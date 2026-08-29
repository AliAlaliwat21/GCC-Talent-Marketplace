const jwt = require('jsonwebtoken')
const User = require('../models/user')

const verifyToken = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({message: "Token required"})
        }
        
        const token = req.headers.authorization.split(' ')[1]
        const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET
        const decoded = jwt.verify(token, accessSecret)
        const user = await User.findById(decoded.payload._id)

        if (!user) {
            return res.status(401).json({message: "User not found"})
        }
        if (user.status === "suspended") {
            return res.status(403).json({message: "Your account is suspended"})
        }
        req.user = {
            username: user.username,
            _id: user._id,
            email: user.email,
            role: user.role,
            status: user.status
        }
        
        next()
    } catch (_error) {
        res.status(401).json({message: "Invalid token"})
    }
}

module.exports = verifyToken
