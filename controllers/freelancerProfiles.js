const FreelancerProfile = require('../models/freelancerProfile')
const User = require('../models/user')
const Review = require('../models/review')
const getPagination = require("../utils/pagination")

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
        
        const pagination = getPagination(req.query)
        const page = pagination.page
        const limit = pagination.limit

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
        const profile = await FreelancerProfile.findOne({
            user: req.params.userId
        }).populate("skills", "name slug category")
        
        if (!profile) {
            return res.status(404).json({message: "Freelancer profile not found"})
        }

        const user = await User.findById(profile.user)
        
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }

        const pagination = getPagination(req.query)

        const reviews = await Review.find({reviewee: user._id})
            .sort({createdAt: -1})
            .skip(pagination.skip)
            .limit(pagination.limit)

        const totalReviews = await Review.countDocuments({reviewee: user._id})

        res.status(200).json({
            profile: profile,
            user: {
                username: user.username,
                avatarUrl: user.avatarUrl,
                country: user.country,
                city: user.city,
                ratingAvg: user.ratingAvg,
                ratingCount: user.ratingCount,
                isVerified: user.isVerified
            },
            reviews: reviews,
            reviewPagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: totalReviews,
                totalPages: Math.ceil(totalReviews / pagination.limit)
            }
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const upsertMe = async (req, res) => {
    try {
        if (req.user.role !== "freelancer") {
            return res.status(403).json({message: "Only freelancers can manage freelancer profiles"})
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

        let profile = await FreelancerProfile.findOne({user: req.user._id})
        let status = 200

        if (!profile) {
            profile = new FreelancerProfile({
                user: req.user._id
            })
            status = 201
        }

        profile.headline = req.body.headline
        profile.bio = req.body.bio
        profile.skills = req.body.skills
        profile.hourlyRate = req.body.hourlyRate
        profile.languages = req.body.languages
        profile.availability = req.body.availability

        await profile.save()

        res.status(status).json(profile)
    } catch (error) {
        res.status(400).json({message: error.message})
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
module.exports = {
    index,
    show,
    upsertMe,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem
}
