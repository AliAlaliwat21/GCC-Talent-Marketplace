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
        const jobFilter = {}

        if (req.query.budgetType) jobFilter.budgetType = req.query.budgetType

        if (req.query.experienceLevel) jobFilter.experienceLevel = req.query.experienceLevel

        if (req.query.category) jobFilter.category = req.query.category

        if (req.query.skills) {
            const skillIds = req.query.skills.split(',')

            jobFilter.skills = {
                $in: skillIds
            }
        }

        if (req.query.budgetMin){
            jobFilter.budgetMax = {
                $gte: Number(req.query.budgetMin)
            }
        }

        if (req.query.budgetMax){
            jobFilter.budgetMin = {
                $lte: Number(req.query.budgetMax)
            }
        }

        if (req.query.search){
            jobFilter.$or = [
                {
                    title: {
                        $regex: req.query.search,
                        $options: 'i'
                    }
                },

                {
                    description:{
                        $regex: req.query.search,
                        $options: 'i'
                    }
                }
            ]
        }

        if (req.query.daysAgo){
            const pastDate = new Date()

            pastDate.setDate(
                pastDate.getDate() - Number(req.query.daysAgo)
            )

            jobFilter.createdAt = {
                $gte: pastDate
            }
        }

        let sortOption = {}

        if (req.query.sort){
            if (req.query.sort === 'newest'){
                sortOption.createdAt = -1
            }

            if (req.query.sort === 'oldest'){
                sortOption.createdAt = 1
            }
        }

        const jobs = await Job.find(jobFilter).sort(sortOption).populate('client').populate('category').populate('skills')

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

const closeJob = async (req, res)=>{
    try {
        const findJob = await Job.findById(req.params.jobId)

        if (!findJob) return res.status(404).json({
            message: 'Job not found!'
        })

        if (!findJob.client.equals(req.user._id)) return res.status(403).json({
            message: 'You are not authorized to take such action!'
        })

        if (findJob.status !== 'open') {
             return res.status(422).json({
            message: 'Job cannot be closed!'
        })
        } 
            
        findJob.status = 'closed'
            await findJob.save()

        res.status(200).json({
            message: 'Job has been closed.'
        })

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const reopenJob = async (req, res)=>{
    try {
        const findJob = await Job.findById(req.params.jobId)

        if (!findJob) return res.status(404).json({
            message: 'Job not found!'
        })

        if (!findJob.client.equals(req.user._id)) return res.status(403).json({
            message: 'You are not authorized to take such action!'
        })

        if (findJob.status !== 'closed') {
             return res.status(422).json({
            message: 'Job must be closed!'
        })
        } 
            
        findJob.status = 'open'
        await findJob.save()

        res.status(200).json({
            message: 'Job has been re-opened.'
        })

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const deleteDraft = async (req, res)=>{
    try {
        const findJob = await Job.findById(req.params.jobId)

        if (!findJob) return res.status(404).json({
            message: 'Job not found!'
        })

        if (!findJob.client.equals(req.user._id)) return res.status(403).json({
            message: 'You are not authorized to take such action!'
        })

        if (findJob.status !== 'draft' ) return res.status(422).json({
            message: 'Job must be a draft to be deleted!'
        })

        await findJob.deleteOne()

        res.status(200).json({
            message: 'Job has been deleted successfully.'
        })

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const myJobs = async (req, res)=>{
    try {
        if (req.user.role !== 'client'){
            return res.status(403).json({
                message: 'Only clients can view their own jobs!'
            })
        }

        const jobs = await Job.find({client: req.user._id}).populate('category').populate('skills')

        res.status(200).json(jobs)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


module.exports = {
    create,
    showJob,
    allJobs,
    updateJob,
    closeJob,
    reopenJob,
    deleteDraft,
    myJobs
}