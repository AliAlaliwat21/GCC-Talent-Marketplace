const User = require('../models/user')

const index = async (req, res) => {
   const users = await User.find()
   res.json(users)
}

const showUser = async (req, res)=>{
    try {
        const user = await User.findById(req.user._id)

        if (!user){
        return res.status(404).json({ message: 'User does not exist'})
        }

        res.status(200).json(user)
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    
}

module.exports = {
    index,
    showUser
}