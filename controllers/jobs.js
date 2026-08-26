const Job = require('../models/job')

const create = async (req, res)=>{
    try {
        if (req.user.role !== 'client') return res.status(403).json({message: 'You do not have permission to perform this action.'})

        const jobData = {
            client: req.user._id,
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            skills: req.body.skills,
            budgetType: req.body.budgetType,
            budgetMin: req.body.budgetMin,
            budgetMax: req.body.budgetMax,
            experienceLevel: req.body.experienceLevel,
            duration: req.body.duration,
            deadline: req.body.deadline,
            attachments: req.body.attachments
        }

        const createdJob = await Job.create(jobData)

        res.status(201).json(createdJob)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    create,
}