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

const showJob = async (req, res)=>{
    try {
        const singleJob = await Job.findById(req.params.jobId).populate('client').populate('category').populate('skills')

        if (!singleJob) return res.status(404).json({
            message: 'Job not found!'
        })

        res.status(200).json(singleJob)

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const allJobs = async (req, res) =>{
    try {
        const jobs = await Job.find().populate('client').populate('category').populate('skills')

        res.status(200).json(jobs)

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateJob = async (req, res)=>{
    try {
        const findJob = await Job.findById(req.params.jobId)

        if (!findJob) return res.status(404).json({
            message: 'Job not found!'
        })

        if (!findJob.client.equals(req.user._id)) return res.status(403).json({
            message: 'You are not authorized to take such action!'
        })

        if (findJob.status !== 'open') return res.status(400).json({
            message: 'Job cannot be edited!'
        })

        const jobData = {
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

        const updatedJob = await Job.findByIdAndUpdate(req.params.jobId, jobData, {new: true, runValidators: true})

        res.status(200).json(updatedJob)

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    create,
    showJob,
    allJobs,
    updateJob
}