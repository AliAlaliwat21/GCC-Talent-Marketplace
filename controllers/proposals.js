const Proposal = require('../models/proposal')
const Job = require('../models/job')
const Contract = require('../models/contract')
const FreelancerProfile = require('../models/freelancerProfile')



const create = async(req,res)=>{
    try {
        if(req.user.role !== 'freelancer'){
            return res.status(403).json({
                message:'Only freelancers can submit proposals'
            })
        }
        const job = await Job.findById(req.params.id)
        
        if(!job){
            return res.status(404).json({
                message:'Job not found'
            })
        }

        if (job.client.toString()=== req.user._id.toString()){
            return res.status(403).json({
                message: 'You cannot submit a proposal to your own job'
            })
        }

        if(job.status !== 'open'){
            return res.status(400).json({
                message:'You can only submit proposals to open jobs'
            })
        }
        const existingProposal = await Proposal.findOne({
            job:job._id,
            freelancer: req.user._id
        })

        if(existingProposal){
            return res.status(409).json({
                message:'You have already submitted a proposal to this job'
            })
        }
        
        const proposal = await Proposal.create({
            job: job._id,
            freelancer: req.user._id,
            coverLetter: req.body.coverLetter,
            amount: req.body.amount,
            deliveryDays: req.body.deliveryDays,
            attachments: req.body.attachments
        })
        
        job.proposalsCount = job.proposalsCount + 1
        await job.save()
        
        res.status(201).json(proposal)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

 const freelancerProposals = async(req,res)=>{
    try {
        const proposals = await Proposal.find({
            freelancer:req.user._id
        }).populate('job')

        res.status(200).json(proposals)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
 }

 const jobProposals = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        
        if (!job) {
            return res.status(404).json({message: "Job not found"})
        }
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You cannot view proposals for this job"})
        }
        const proposals = await Proposal.find({job: job._id}).populate("freelancer", "username avatarUrl ratingAvg ratingCount")
        const proposalsWithProfiles = []

        for (let i = 0; i < proposals.length; i++) {
            const freelancerProfile = await FreelancerProfile.findOne({user: proposals[i].freelancer._id}).populate('skills', 'name')
            
            proposalsWithProfiles.push({
                proposal: proposals[i],
                freelancerProfile: freelancerProfile
            })
        }
        
        res.status(200).json(proposalsWithProfiles)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const update = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id)

        if (!proposal) {
            return res.status(404).json({
                message: 'Proposal not found'
            })
        }

        if (proposal.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You cannot update this proposal'
            })
        }

        if (proposal.status !== 'pending') {
            return res.status(400).json({
                message: 'Only pending proposals can be updated'
            })
        }
        if (req.body.coverLetter !== undefined) {
            proposal.coverLetter = req.body.coverLetter
        }
        if (req.body.amount !== undefined) {
            proposal.amount = req.body.amount
        }
        if (req.body.deliveryDays !== undefined) {
            proposal.deliveryDays = req.body.deliveryDays
        }
        if (req.body.attachments !== undefined) {
            proposal.attachments = req.body.attachments
        }
        
        await proposal.save()
        res.status(200).json(proposal)

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

const withdraw = async(req,res)=>{
    try{
        const proposal = await Proposal.findById(req.params.id)

        if(!proposal){
            return res.status(404).json({
                message: 'Proposal not found'
            })
        }

        if (proposal.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You cannot withdraw this proposal'
            })
        }

        if (proposal.status !== 'pending'){
            return res.status(400).json({
                message: 'Only pending proposals can be withdrawn'
            })
        }
        proposal.status = 'withdrawn'

        await proposal.save()

        res.status(200).json(proposal)
    } catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const shortlist = async(req,res)=>{
    try {
        const proposal = await Proposal.findById(req.params.id)

        if(!proposal){
            return res.status(404).json({
                message: 'Proposal not found'
            })
        }
        const job = await Job.findById(proposal.job)

        if(!job){
            return res.status(404).json({
                message: 'Job not found'
            })
        }

        if (job.client.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message: 'You cannot manage proposals for this job'
            })       
         }

         if (proposal.status !== 'pending'){
            return res.status(400).json({
                message: 'Only pending proposals can be shortlisted'
            })
         }

         proposal.status = 'shortlisted'

         await proposal.save()

         res.status(200).json(proposal)

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
        
    }
}

const decline = async (req, res) => {
    try {

        const proposal = await Proposal.findById(req.params.id)

        if (!proposal) {
            return res.status(404).json({
                message: 'Proposal not found'
            })
        }

        const job = await Job.findById(proposal.job)

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            })
        }

        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You cannot manage proposals for this job'
            })
        }

        if (
            proposal.status !== 'pending' &&
            proposal.status !== 'shortlisted'
        ) {
            return res.status(400).json({
                message: 'This proposal cannot be declined'
            })
        }

        proposal.status = 'declined'

        await proposal.save()

        res.status(200).json(proposal)

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const accept = async (req, res) => {
    try {

        const proposal = await Proposal.findById(req.params.id)

        if (!proposal) {
            return res.status(404).json({
                message: 'Proposal not found'
            })
        }

        const job = await Job.findById(proposal.job)

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            })
        }

        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You cannot accept proposals for this job'
            })
        }

        if (
            proposal.status !== 'pending' &&
            proposal.status !== 'shortlisted'
        ) {
            return res.status(400).json({
                message: 'This proposal cannot be accepted'
            })
        }

        if (!req.body.milestones || req.body.milestones.length === 0) {
            return res.status(400).json({
                message: 'At least one milestone is required'
            })
        }
        
        let milestoneTotal = 0
        
        for (let i = 0; i < req.body.milestones.length; i++) {
            const milestoneAmount = Number(req.body.milestones[i].amount)
            
            if (isNaN(milestoneAmount) || milestoneAmount <= 0) {
                return res.status(400).json({message: "Every milestone amount must be greater than zero"})
            }
            milestoneTotal = milestoneTotal + milestoneAmount
        }
        if (milestoneTotal !== proposal.amount) {
            return res.status(400).json({message: "Milestone total must equal the proposal amount"})
        }
        
        const contract = await Contract.create({

            client: job.client,

            freelancer: proposal.freelancer,

            source: {
                type: 'job',
                job: job._id,
                proposal: proposal._id
            },

            title: job.title,

            totalAmount: proposal.amount,

            milestones: req.body.milestones
        })

        proposal.status = 'accepted'

        await proposal.save()

        job.status = 'in_progress'

        await job.save()

        await Proposal.updateMany(
            {
                job: job._id,
                _id: { $ne: proposal._id },
                status: {
                    $in: ['pending', 'shortlisted']
                }
            },
            {
                status: 'declined'
            }
        )

        res.status(200).json(contract)

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    create,
    freelancerProposals,
    jobProposals,
    update,
    withdraw,
    shortlist,
    decline,
    accept
}