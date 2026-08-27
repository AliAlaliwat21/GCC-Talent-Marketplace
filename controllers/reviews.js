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
    }catch (err) {
        res.status(500).json({
            message:err.message
        })
    }
}