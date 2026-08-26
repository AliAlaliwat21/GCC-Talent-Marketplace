const mongoose = require('mongoose')

const proposalSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    coverLetter: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    deliveryDays: {
        type: Number,
        required: true,
        min: 1,
    },
    attachments: [{
        url: {
            type: String,
        },
        name: {
            type: String,
        },
    }],
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'accepted', 'declined', 'withdrawn'],
        default: 'pending',
    },

}, {timestamps: true})

const Proposal = mongoose.model('Proposal', proposalSchema)
module.exports = Proposal