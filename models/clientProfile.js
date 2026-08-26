const mongoose = require('mongoose')

const clientProfileSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    isCompany: {
        type: Boolean,
        default: false,
    },

    companyName: {
        type: String,
        trim: true,
    },

    description: {
        type: String,
        trim: true,
    },

    website: {
        type: String,
        trim: true,
    },

    jobsPosted: {
        type: Number,
        default: 0,
    },

    completedContracts: {
        type: Number,
        default: 0,
    },

    totalSpent: {
        type: Number,
        default: 0,
    },

    hireRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    currency: {
        type: String,
        default: 'USD',
    },

}, { timestamps: true })


const ClientProfile = mongoose.model(
    'ClientProfile',
    clientProfileSchema
)

module.exports = ClientProfile