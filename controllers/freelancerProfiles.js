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
        res.status(400).json({message: error.message})
    }
}

const update = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({message: 'Freelancer profile not found'})
        }
        
        if (profile.user.toString() !== req.user._id.toString()) { return res.status(401).json({ message: 'You cannot update this profile'})
        }
    
    const updatedProfile = await FreelancerProfile.findByIdAndUpdate(
        req.params.id,
        {
            headline: req.body.headline,
            bio: req.body.bio,
            skills: req.body.skills,
            hourlyRate: req.body.hourlyRate,
            languages: req.body.languages,
            availability: req.body.availability
        }, { new: true }
    )
    
    res.status(200).json(updatedProfile)
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
            return res.status(401).json({message: 'You cannot update this profile'})
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
            return res.status(401).json({message: 'You cannot update this profile'})
        }
        
        const portfolioItem = profile.portfolio.find((item) => {
        return item._id.toString() === req.params.portfolioId
    })

        if (!portfolioItem) {
            return res.status(404).json({message: 'Portfolio item not found'})
        }
        portfolioItem.title = req.body.title
        portfolioItem.description = req.body.description
        portfolioItem.imageUrl = req.body.imageUrl
        portfolioItem.link = req.body.link

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
            return res.status(401).json({message: 'You cannot update this profile'})
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

module.exports = {
    index,
    show,
    create,
    update,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem
}