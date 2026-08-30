const ClientProfile = require('../models/clientProfile')
const User = require('../models/user')
const Job = require("../models/job")
const Contract = require("../models/contract")
const Review = require("../models/review")
const getPagination = require("../utils/pagination")

const show = async (req, res)=>{
    try{
    const profile = await ClientProfile.findOne({
        user: req.params.userId
    })

    if(!profile) {
        return res.status(404).json({message: 'Client not found'})
    }

    const user = await User.findById(req.params.userId)

    if (!user) {
        return res.status(404).json({message: "User not found"})
    }

    const clientJobs = await Job.find({client: user._id})
    const clientContracts = await Contract.find({client: user._id})
    const pagination = getPagination(req.query)
    const reviews = await Review.find({reviewee: user._id})
        .sort({createdAt: -1})
        .skip(pagination.skip)
        .limit(pagination.limit)
    const totalReviews = await Review.countDocuments({reviewee: user._id})

    let jobsPosted = 0
    let completedContracts = 0

    for (let i = 0; i < clientJobs.length; i++) {
        if (clientJobs[i].status !== "draft") {
            jobsPosted = jobsPosted + 1
        }
    }

    for (let i = 0; i < clientContracts.length; i++) {
        if (clientContracts[i].status === "completed") {
            completedContracts = completedContracts + 1
        }
    }

    let hireRate = 0

    if (jobsPosted > 0) {
        hireRate = Math.round((clientContracts.length / jobsPosted) * 100)

        if (hireRate > 100) {
            hireRate = 100
        }
    }

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
        hiringSummary: {
            jobsPosted: jobsPosted,
            contracts: clientContracts.length,
            completedContracts: completedContracts,
            hireRate: hireRate
        },
        reviews: reviews,
        reviewPagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: totalReviews,
            totalPages: Math.ceil(totalReviews / pagination.limit)
        }
    })
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

const upsertMe = async (req, res) => {
    try {
        if (req.user.role !== "client") {
            return res.status(403).json({message: "Only clients can manage client profiles"})
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

        let profile = await ClientProfile.findOne({user: req.user._id})
        let status = 200

        if (!profile) {
            profile = new ClientProfile({
                user: req.user._id
            })
            status = 201
        }

        profile.isCompany = req.body.isCompany
        profile.companyName = req.body.companyName
        profile.description = req.body.description
        profile.website = req.body.website

        await profile.save()

        res.status(status).json(profile)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

module.exports = {
    show,
    showMe,
    upsertMe
}
