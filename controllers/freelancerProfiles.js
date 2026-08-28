const FreelancerProfile = require('../models/freelancerProfile')
const User = require('../models/user')
const Review = require('../models/review')

const index = async (req, res) => {
    try {
        let sort = {createdAt: -1}
        
        if (req.query.sort === "rate_low") {
            sort = {hourlyRate: 1}
        }
        if (req.query.sort === "rate_high") {
            sort = {hourlyRate: -1}
        }
        
        const profiles = await FreelancerProfile.find().sort(sort).populate("user", "username avatarUrl country city ratingAvg ratingCount").populate("skills", "name category")
        const filteredProfiles = []
        
        for (let i = 0; i < profiles.length; i++) {
            let includeProfile = true
            
            if (req.query.q) {
                const keyword = req.query.q.toLowerCase()
                let keywordMatch = false
                
                if (profiles[i].headline && profiles[i].headline.toLowerCase().includes(keyword)) {
                    keywordMatch = true
                }
                if (profiles[i].bio && profiles[i].bio.toLowerCase().includes(keyword)) {
                    keywordMatch = true
                }
                if (profiles[i].user && profiles[i].user.username.toLowerCase().includes(keyword)) {
                    keywordMatch = true
                }
                if (!keywordMatch) {
                    includeProfile = false
                }
            }
            if (req.query.skill) {
                let skillMatch = false
                
                for (let j = 0; j < profiles[i].skills.length; j++) {
                    if (profiles[i].skills[j]._id.toString() === req.query.skill || profiles[i].skills[j].name.toLowerCase() === req.query.skill.toLowerCase()) {
                        skillMatch = true
                    }
                }
                if (!skillMatch) {
                    includeProfile = false
                }
            }
            
            if (req.query.category) {
                let categoryMatch = false
                
                for (let j = 0; j < profiles[i].skills.length; j++) {
                    if (profiles[i].skills[j].category.toString() === req.query.category) {
                        categoryMatch = true
                    }
                }
                if (!categoryMatch) {
                    includeProfile = false
                }
            }
            if (req.query.minRate && profiles[i].hourlyRate < Number(req.query.minRate)) 
                {
                    includeProfile = false
                }
                if (req.query.maxRate && profiles[i].hourlyRate > Number(req.query.maxRate)) {
                    includeProfile = false
                }
                if (req.query.minRating && profiles[i].user.ratingAvg < Number(req.query.minRating)) {
                    includeProfile = false
                }
                if (req.query.country && profiles[i].user.country !== req.query.country) {
                    includeProfile = false
                }
                if (req.query.city && profiles[i].user.city !== req.query.city) {
                    includeProfile = false
                }
                if (req.query.availability && profiles[i].availability !== req.query.availability) {
                    includeProfile = false
                }
                if (includeProfile) {
                    filteredProfiles.push(profiles[i])
            }
        }
        
        let page = Number(req.query.page)
        let limit = Number(req.query.limit)
        
        if (isNaN(page) || page < 1) {
            page = 1
        }
        if (isNaN(limit) || limit < 1) {
            limit = 10
        }

        const start = (page - 1) * limit
        const paginatedProfiles = []

        for (let i = start; i < start + limit && i < filteredProfiles.length; i++) {
            paginatedProfiles.push(filteredProfiles[i])
        }
        res.status(200).json({
            profiles: paginatedProfiles,
            page: page,
            limit: limit,
            totalProfiles: filteredProfiles.length
        })
    
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const show = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findById(req.params.id)
        
        if (!profile) {
            return res.status(404).json({message: "Freelancer profile not found"})
        }

        const user = await User.findById(profile.user)
        
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }

        const reviews = await Review.find({reviewee: user._id})
        
        res.status(200).json({
            profile: profile,
            user: {
                username: user.username,
                avatarUrl: user.avatarUrl,
                country: user.country,
                city: user.city,
                ratingAvg: user.ratingAvg,
                ratingCount: user.ratingCount
            },
            reviews: reviews
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