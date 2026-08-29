const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/user')

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET
const getAccessExpiry = () => process.env.JWT_ACCESS_EXPIRES || "30m"
const getRefreshExpiry = () => process.env.JWT_REFRESH_EXPIRES || "7d"

const signUp = async (req, res) => {
    try {
        if (
            !req.body.username ||
            !req.body.email ||
            !req.body.password ||
            !req.body.role
            ) {
            return res.status(400).json({
                message: "Username, email, password and role are required"
            })
        }

        if (
            req.body.role !== 'client' && req.body.role !== "freelancer") {
                return res.status(400).json({message: "Role must be client or freelancer"})
            }
        // check if user in database already
        const userInDatabase = await User.findOne({
            username: req.body.username
        })

        const existingEmail = await User.findOne({
            email: req.body.email
        })
        if (userInDatabase) {
            return res.status(409).json({message: "Username already taken"})
        }
        if (existingEmail){
            return res.status(409).json({message: "Email already in use"})
        }
        if (req.body.password.length < 8 ){
            return res.status(400).json({message: "Password must be at least 8 characters"})
        }

        // creates user
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)

        const userData = {
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            role: req.body.role
        }

        const user = await User.create(userData)

        // create the payload
        const payload = { username: user.username, _id: user._id, email: user.email, role: user.role }

        // create the token with payload + secret
        const accessToken = jwt.sign({payload}, getAccessSecret(), {expiresIn: getAccessExpiry()})

        const refreshToken = jwt.sign({payload}, getRefreshSecret(), {expiresIn: getRefreshExpiry()})
        
        const refreshTokenHash = bcrypt.hashSync(refreshToken, 10)

        user.refreshTokenHash = refreshTokenHash
        await user.save()

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(201).json({ accessToken })
    } catch(err) {
        res.status(400).json({message: err.message})
    }
}

const signIn = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        // check if user in database already
        const userInDatabase = await User.findOne({
            email: req.body.email
        })

        if (!userInDatabase) {
            return res.status(404).json({message: 'User does not exist.'})
        }

        // check if the user's password is correct
        const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)

        if (!validPassword) {
            return res.status(401).json({message: 'Login failed. Please try again.'})
        }

        if (userInDatabase.status === 'suspended') {
            return res.status(403).json({
                message: 'Your account has been suspended'
            })
        }

        const payload = { username: userInDatabase.username, _id: userInDatabase._id, email: userInDatabase.email, role: userInDatabase.role}

        const accessToken = jwt.sign({ payload }, getAccessSecret(), {expiresIn: getAccessExpiry()})

        const refreshToken = jwt.sign({payload}, getRefreshSecret(), {expiresIn: getRefreshExpiry()})

        const refreshTokenHash = bcrypt.hashSync(refreshToken, 10)

        userInDatabase.refreshTokenHash = refreshTokenHash
        await userInDatabase.save()

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({ accessToken })

    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

const refresh = async (req, res)=>{
    try {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) return res.status(401).json({message: 'Refresh Token Required.'})

        const decoded = jwt.verify(refreshToken, getRefreshSecret())

        const user = await User.findById(decoded.payload._id)

        if (!user) return res.status(404).json({
            message: 'User not found.'
        })

        if (user.status === 'suspended') {
            return res.status(403).json({
                message: 'Your account has been suspended'
            })
        }

        if (!user.refreshTokenHash) return res.status(401).json({
            message: 'Invalid refresh token.'
        })

        const validRefreshToken = bcrypt.compareSync(refreshToken, user.refreshTokenHash)

        if (!validRefreshToken) return res.status(401).json({
            message: 'Invalid Refresh Token.'
        })

        const payload = { username: user.username, _id: user._id, email: user.email, role: user.role }

        const newAccessToken = jwt.sign({payload}, getAccessSecret(), {expiresIn: getAccessExpiry()})

        const newRefreshToken = jwt.sign({payload}, getRefreshSecret(), {expiresIn: getRefreshExpiry()})

        const newRefreshTokenHash = bcrypt.hashSync(newRefreshToken, 10)

        user.refreshTokenHash = newRefreshTokenHash
        await user.save()

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge:  7 * 24 * 60 * 60 *  1000
        })

        res.status(200).json({
            accessToken: newAccessToken
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

const logout = async (req, res)=>{
    try {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) return res.status(401).json({message: 'Refresh Token Required.'})

        const decoded = jwt.verify(refreshToken, getRefreshSecret())

        const user = await User.findById(decoded.payload._id)

        if (!user) return res.status(404).json({
            message: 'User not found.'
        })

        user.refreshTokenHash = null
        await user.save()

        res.clearCookie('refreshToken',
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            }
        )

        res.status(200).json({message: 'Logged Out Successfully.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}



module.exports = {
    // signToken,
    // verifyToken,
    signUp,
    signIn,
    refresh,
    logout
}

