const User = require('../models/user')

const index = async (req, res) => {
   const users = await User.find()
   res.json(users)
}

const showMe = async (req, res)=>{
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

const updateMe = async (req, res)=>{
    try {
        const updatedUser = User.findByIdAndUpdate(req.user._id, {name: req.body.name,
             avatar: req.body.avatarUrl, 
             notificationPrefs: req.body.notificationPrefs}, {new: true})

        if (!updatedUser){
            return res.status(400).json({message: 'User not found'})
        }

        res.status(200).json(updatedUser)
    } catch (error) {
         res.status(500).json({
            message: error.message
            })
    }
}

module.exports = {
    index,
    showMe,
    updateMe
}