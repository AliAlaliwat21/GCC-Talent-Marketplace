const Review = require('../models/review')
const Contract = require('../models/contract')


const index = async(req,res)=>{
    try {
        const reviews = await Review.find({
            reviewee: req.params.id
        })
        res.status(200).json(reviews)
    } catch (err) {
         res.status(500).json({ message: err.message })
    }
}


const create = async(req,res)=>{
    try {
        const contract = await Contract.findById(req.params.id)

        if(!contract){
            return res.status(404).json({
                message: 'Contract not found'
            })
        }

        if (
            contract.client.toString() !== req.user._id.toString() &&
            contract.freelancer.toString() !== req.user._id.toString()
        ){
            return res.status(403).json({
                message: 'You cannot review this contract'
            })
        }

        if(contract.status !== 'completed'){
            return res.status(422).json({
                message: 'You can only review a completed contract'
            })
        }

        const existingReview = await Review.findOne({
            contract:  contract._id,
            reviewer: req.user._id
    })
    if(existingReview){
        return res.status(409).json({
            message:'You have already reviewed this contract'
        })
    }

    let reviewee

    if(contract.client.toString() === req.user._id.toString()){
        reviewee = contract.freelancer
    } else{
        reviewee = contract.client
    }

    const review = await Review.create({
            contract: contract._id,
            reviewer: req.user._id,
            reviewee: reviewee,
            rating: req.body.rating,
            comment: req.body.comment
    })

    res.status(201).json(review)
    }catch (err) {
        res.status(500).json({
            message:err.message
        })
    }
}
