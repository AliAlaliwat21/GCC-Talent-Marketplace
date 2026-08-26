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

}, { timestamps: true })


const ClientProfile = mongoose.model(
    'ClientProfile',
    clientProfileSchema
)

module.exports = ClientProfile