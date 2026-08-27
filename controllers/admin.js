const User = require('../models/user')

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

module.exports = {
    index
}