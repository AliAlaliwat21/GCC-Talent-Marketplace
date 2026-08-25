const mongoose = require('mongoose')

const freelancerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    headline: {
        type: String,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
    },
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    },],
    hourlyRate: {
        type: Number,
        required: true,
        min: 0
    },
    languages: [{
        name: {
            type: String,
            required: true,
    },
    level: {
        type: String
    },
},
],
    availability: {
        type: String,
        enum: ["full_time", "part_time", "unavailable"],
        required: true,
    },
    portfolio: [{
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
    },
    imageUrl: {
        type: String,
    },
    link: {
        type: String,
    },
  },
],

currency: {
    type: String,
    default: 'USD',
},

completedContracts: {
    type: Number
},

totalEarned: {
    type: Number
}, 
}, { timestamps: true })

const FreelancerProfile = mongoose.model('FreelancerProfile', freelancerProfileSchema)

module.exports = FreelancerProfile
