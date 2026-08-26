const ClientProfile = require('../models/clientProfile')

const index = async (req, res) => {
    const profiles = await ClientProfile.find()
    res.json(profiles)
}

const show = async (req, res)=>{
    try{
    const profile = await ClientProfile.findById(req.params.id)

    if(!profile) {
        return res.status(404).json({message: 'Client not found'})
    }

  res.status(200).json(profile)
    } catch(err) {
        res.status(500).json({message: err.message})
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
module.exports = {
    index,
    show,
    create
}