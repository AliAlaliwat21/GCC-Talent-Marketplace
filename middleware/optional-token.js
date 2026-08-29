const jwt = require("jsonwebtoken")
const User = require("../models/user")

const optionalToken = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return next()
        }

        const token = req.headers.authorization.split(" ")[1]
        const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET
        const decoded = jwt.verify(token, accessSecret)
        const user = await User.findById(decoded.payload._id)

        if (user && user.status !== "suspended") {
            req.user = {
                username: user.username,
                _id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            }
        }

        next()
    } catch (_error) {
        next()
    }
}

module.exports = optionalToken
