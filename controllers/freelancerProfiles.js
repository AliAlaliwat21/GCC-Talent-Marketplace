const FreelancerProfile = require('../models/freelancerProfile')
const User = require('../models/user')

const index = async (req, res) => {
    const profiles = await FreelancerProfile.find()
    res.json(profiles)
}

const show = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        if (!profile) {
            return res.status(404).json({message: "Freelancer profile not found"})
        }

        const user = await User.findById(profile.user)
        
        if (!user) {return res.status(404).json({message: "User not found"})
        }
    
        res.status(200).json({profile: profile,
            user: {
                username: user.username,
                avatarUrl: user.avatarUrl,
                country: user.country,
                city: user.city,
                ratingAvg: user.ratingAvg,
                ratingCount: user.ratingCount
            }
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const create = async (req, res) => {
    try {
        if (req.user.role !== "freelancer") {
            return res.status(403).json({message: "Only freelancers can create freelancer profiles"})
        }
        
        const existingProfile = await FreelancerProfile.findOne({user: req.user._id})
        
        if (existingProfile) {
            return res.status(409).json({message: "You already have a freelancer profile"})
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
        res.status(400).json({message: error.message})
    }
}

const update = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({message: "Freelancer profile not found"})
        }
        if (profile.user.toString() !== req.user._id.toString()) { 
            return res.status(403).json({message: "You cannot update this profile!"})
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
        if (req.body.headline !== undefined) {
            profile.headline = req.body.headline
        }
        if (req.body.bio !== undefined) {
            profile.bio = req.body.bio
        }
        if (req.body.skills !== undefined) {
            profile.skills = req.body.skills
        }
        if (req.body.hourlyRate !== undefined) {
            profile.hourlyRate = req.body.hourlyRate
        }
        if (req.body.languages !== undefined) {
            profile.languages = req.body.languages
        }
        if (req.body.availability !== undefined) {
            profile.availability = req.body.availability
        }
        await user.save()
        await profile.save()

        res.status(200).json(profile)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const createPortfolioItem = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({message: 'Freelancer profile not found'})
        }

        if (profile.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'You cannot update this profile'})
        }

        profile.portfolio.push({
            title: req.body.title,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            link: req.body.link
        })

        await profile.save()
        
        res.status(201).json(profile)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updatePortfolioItem = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({message: 'Freelancer profile not found'})
        }

        if (profile.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'You cannot update this profile'})
        }
        
        const portfolioItem = profile.portfolio.find((item) => {
        return item._id.toString() === req.params.portfolioId
    })

        if (!portfolioItem) {
            return res.status(404).json({message: 'Portfolio item not found'})
        }
        if (req.body.title !== undefined) {
            portfolioItem.title = req.body.title
        }
        if (req.body.description !== undefined) {
            portfolioItem.description = req.body.description
        }
        if (req.body.imageUrl !== undefined) {
            portfolioItem.imageUrl = req.body.imageUrl
        }
        if (req.body.link !== undefined) {
            portfolioItem.link = req.body.link
        }

        await profile.save()
        
        res.status(200).json(profile)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const deletePortfolioItem = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({message: 'Freelancer profile not found'})
        }

        if (profile.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'You cannot update this profile'})
        }

        const portfolioItem = profile.portfolio.find((item) => {
            return item._id.toString() === req.params.portfolioId
        })

        if (!portfolioItem) {
            return res.status(404).json({message: 'Portfolio item not found'})
        }

        profile.portfolio = profile.portfolio.filter((item) => {
            return item._id.toString() !== req.params.portfolioId
        })

        await profile.save()
        
        res.status(200).json({message: 'Portfolio item deleted successfully'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
const deleteProfile = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({message: 'Freelancer profile not found'})
        }
        
        if (profile.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'You cannot delete this profile'})
        }
        
        await FreelancerProfile.findByIdAndDelete(req.params.id)
        
        res.status(200).json({message: 'Freelancer profile deleted successfully'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    index,
    show,
    create,
    update,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    deleteProfile
}