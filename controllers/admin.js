const User = require('../models/user')
const { update } = require('./skills')

const index = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can view users"})
        }
        const filter = {}
        if (req.query.username) {
            filter.username = req.query.username
        }
        if (req.query.email) {
            filter.email = req.query.email
        }
        if (req.query.role) {
            filter.role = req.query.role
        }
        if (req.query.status) {
            filter.status = req.query.status
        }
        
        const users = await User.find(filter)
        
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can change account status"})
        }
        if (req.body.status !== "active" && req.body.status !== "suspended") {
            return res.status(400).json({
                message: "Status must be active or suspended"
            })
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id,
            {
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        )
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found"})
        }
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
module.exports = {
    index,
    updateStatus,
}