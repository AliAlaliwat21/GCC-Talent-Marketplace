const FreelancerProfile = require('../models/freelancerProfile')

const index = async (req, res) => {
    const profiles = await FreelancerProfile.find()
    res.json(profiles)
}

const show = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({ message: 'Freelancer profile not found'})
        }
        
        res.status(200).json(profile)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    index,
    show
}