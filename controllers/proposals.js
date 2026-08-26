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

