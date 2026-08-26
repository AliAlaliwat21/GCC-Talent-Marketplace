const bcrypt = require('bcrypt')
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
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            username: req.body.username,
            avatarUrl: req.body.avatarUrl,
            notificationPrefs: req.body.notificationPrefs,
            country: req.body.country,
            city: req.body.city
        }, {new: true, runValidators: true})

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


const changePassword = async(req,res)=>{
    try{
        const currentPassword = req.body.currentPassword
        const newPassword = req.body.newPassword
        

        if (!currentPassword || !newPassword){
            return res.status(400).json({
                message: 'Current password and new password are required'
            })
        }

        if (newPassword.length < 8){
            return res.status(400).json({
                message:"Password must be atleast 8 characters long"
            })
        }
        const user = await User.findById(req.user._id)

        if (!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const passwordMatches = bcrypt.compareSync(
            currentPassword, 
            user.password
        )
        if (!passwordMatches) {
            return res.status(401).json({
                message : 'Current password is incorrect'
            })
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10)

        user.password = hashedPassword
        await user.save()

        res.status(200).json({
            message:'Password changed successfully'
        })
    } catch(error){
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    index,
    showMe,
    updateMe,
    changePassword
}