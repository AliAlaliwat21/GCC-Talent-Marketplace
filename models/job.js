const mongoose = require('mongoose')
const jobSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
    }],
    budgetType: {
        type: String,
        enum: ['fixed', 'hourly'],
        required: true,
    },
    budgetMin: {
        type: Number,
        min: 0,
    },
    budgetMax: {
        type: Number,
        min: 0,
    },
    experienceLevel: {
        type: String,
        enum: ['entry', 'intermediate', 'expert'],
    },
    duration: {
        type: String,
        trim: true,
    },
    deadline: {
        type: Date,
    },
    attachments: [{
        url: {
            type: String,
        },
        name: {
            type: String,
        },
        size: {
            type: Number,
        },
    }],
    status: {
        type: String,
        enum: ['draft', 'open', 'in_progress', 'completed', 'closed'],
        default: 'draft',
    },
    proposalsCount: {
        type: Number,
        default: 0,
    },
}, {timestamps: true})

jobSchema.index({status: 1, createdAt: -1})
jobSchema.index({category: 1, status: 1, createdAt: -1})
jobSchema.index({skills: 1, status: 1})
jobSchema.index({title: "text", description: "text"})

const Job = mongoose.model('Job', jobSchema)

module.exports = Job
