const mongoose = require('mongoose')

const clientProfileSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

}, { timestamps: true })


const ClientProfile = mongoose.model(
    'ClientProfile',
    clientProfileSchema
)

module.exports = ClientProfile