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

        res.status(201).json(proposal)
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
        
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

        proposal.coverLetter = req.body.coverLetter
        proposal.amount = req.body.amount
        proposal.deliveryDays = req.body.deliveryDays
        proposal.attachments = req.body.attachments

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
        const proposal = await Proposal.findbyId(req.params.id)

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