const ClientProfile = require('../models/clientProfile')
const User = require('../models/user')

const index = async (req, res) => {
    try {
        const profiles = await ClientProfile.find()

        res.status(200).json(profiles)

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const show = async (req, res)=>{
    try{
    const profile = await ClientProfile.findOne({
        user: req.params.userId
    })

    if(!profile) {
        return res.status(404).json({message: 'Client not found'})
    }

  res.status(200).json(profile)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
}

const showMe = async(req,res)=>{
    try {
        const profile = await ClientProfile.findOne({
            user: req.user._id
        })

        if(!profile){
            return res.status(404).json({
                message: 'Client profile not found'
            })
        }
        res.status(200).json(profile)
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

const create = async (req, res) => {
    try {
        if (req.user.role !== "client") {
            return res.status(403).json({message: "Only clients can create client profiles"})
        }
        
        const existingProfile = await ClientProfile.findOne({user: req.user._id})
        
        if (existingProfile) {
            return res.status(409).json({message: "You already have a client profile"})
        }
        const user = await User.findById(req.user._id)
        
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        if (req.body.country !== undefined) {
            user.country = req.body.country
        }
        if (req.body.city !== undefined) {
            user.city = req.body.city
        }
        await user.save()
        
        const profile = await ClientProfile.create({
            user: req.user._id,
            isCompany: req.body.isCompany,
            companyName: req.body.companyName,
            description: req.body.description,
            website: req.body.website
        })
        
        res.status(201).json(profile)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const update = async (req, res) => {
    try {
        if (req.user.role !== "client") {
            return res.status(403).json({message: "Only clients can update client profiles"})
        }
        
        const profile = await ClientProfile.findOne({user: req.user._id})
        
        if (!profile) {
            return res.status(404).json({message: "Client profile not found"})
        }
        
        const user = await User.findById(req.user._id)
        
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        if (req.body.isCompany !== undefined) {
            profile.isCompany = req.body.isCompany
        }
        if (req.body.companyName !== undefined) {
            profile.companyName = req.body.companyName
        }
        if (req.body.description !== undefined) {
            profile.description = req.body.description
        }
        if (req.body.website !== undefined) {
            profile.website = req.body.website
        }
        if (req.body.country !== undefined) {
            user.country = req.body.country
        }
        if (req.body.city !== undefined) {
            user.city = req.body.city
        }
        
        await user.save()
        await profile.save()
        
        res.status(200).json(profile)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const deleteProfile = async(req,res)=> {
    try {
        const deletedProfile = await ClientProfile.findOneAndDelete({
            user: req.user._id
        })

        if (!deletedProfile) {
            return res.status(404).json({
                message: 'Client profile not found'
            })
        }

        res.status(200).json({
            message: 'Profile has been deleted'
        })

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    index,
    show,
    showMe,
    create,
    update,
    deleteProfile


}