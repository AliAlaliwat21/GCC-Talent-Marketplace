const ClientProfile = require('../models/clientProfile')

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
        const existingProfile = await ClientProfile.findOne({
            user: req.user._id
        })

        if (existingProfile) {
            return res.status(400).json({
                message: 'Client profile already exists'
            })
        }

        const profile = await ClientProfile.create({
            user: req.user._id,
            isCompany: req.body.isCompany,
            companyName: req.body.companyName,
            description: req.body.description,
            website: req.body.website
        })

        res.status(201).json(profile)

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const update = async(req,res)=>{
    try {
        const updatedProfile = await ClientProfile.findOneAndUpdate(
            {
                user: req.user._id
            },
            {
                isCompany: req.body.isCompany,
                companyName: req.body.companyName,
                description: req.body.description,
                website: req.body.website
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedProfile) {
            return res.status(404).json({
                message: 'Client profile not found'
            })
        }

        res.status(200).json(updatedProfile)

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
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