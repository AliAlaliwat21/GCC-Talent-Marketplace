const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
}, {timestamps: true})

const Skill = mongoose.model('Skill', skillSchema)

module.exports = Skill