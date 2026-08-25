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

const create = async (req, res) => {
    try {
        const profile = await FreelancerProfile.create({
            user: req.user._id,
            headline: req.body.headline,
            bio: req.body.bio,
            skills: req.body.skills,
            hourlyRate: req.body.hourlyRate,
            languages: req.body.languages,
            availability: req.body.availability
        })

        res.status(201).json(profile)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

module.exports = {
    index,
    show,
    create
}