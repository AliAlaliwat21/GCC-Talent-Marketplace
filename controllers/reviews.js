const Review = require('../models/review')
const Contract = require('../models/contract')
const User = require('../models/user')


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
        
        if (contract.status !== "completed" && contract.status !== "cancelled") {
            return res.status(422).json({message: "You can only review a completed or cancelled contract"})
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
    
    const reviewedUser = await User.findById(reviewee)
    
    if (!reviewedUser) {
        return res.status(404).json({message: "Reviewed user not found"})
}

    const review = await Review.create({
            contract: contract._id,
            reviewer: req.user._id,
            reviewee: reviewee,
            rating: req.body.rating,
            comment: req.body.comment
    })
    
    const userReviews = await Review.find({reviewee: reviewee})
    let ratingTotal = 0
    
    for (let i = 0; i < userReviews.length; i++) {
        ratingTotal = ratingTotal + userReviews[i].rating
    }
    reviewedUser.ratingCount = userReviews.length
    reviewedUser.ratingAvg = ratingTotal/userReviews.length
    
    await reviewedUser.save()

    res.status(201).json(review)
}catch (err) {
    res.status(500).json({message:err.message})
    }
}

const updateReview = async(req,res)=>{
    try {
      const review = await Review.findbyId(req.params.id) 
      
      if(!review){
        return res.status(404).json({
            message: 'Review not found'
        })
      }
      if (review.reviwer.toString() !== req.user._id.toString()){
        return res.status(403).json({
            message: 'You cannot update this review'
        })
      }

      review.rating = req.body.rating
      review.comment = req.body.comment

      await review.save()

      res.status(200).json(review)
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
        
    }
}

const deleteReview = async(req,res)=>{
    try {
        const review = await Review.findbyId(req.params.id)

        if(!review){
            return res.status(404).json({
                message: 'Review not found'
            })
        }

        await Review.findByIdAndDelete(req.params.id)

        res.status(200).json({
            message:'review deleted successfully'
        })

    } catch (err) {
        res.status(500).json({
            message:err.message
        })
    }
}
module.exports = {
    index,
    create,
    updateReview,
    deleteReview
}