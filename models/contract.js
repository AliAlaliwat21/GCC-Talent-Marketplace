const mongoose = require('mongoose')

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: [
            'pending',
            'funded',
            'in_progress',
            'delivered',
            'revision_requested',
            'approved',
            'refunded',
            'cancelled'
        ],
        default: 'pending'
    },
    escrowAmount: {
        type: Number,
        default: 0
    },
    deliveries: [{
        message: {
            type: String
        },
        attachments: [{
            url: {
                type: String
            },
            name: {
                type: String
            }
        }],
        submittedAt: {
            type: Date
        },
        response: {
            type: String,
            enum: ['approved', 'revision']
        },
        responseNote: {
            type: String
        },
        respondedAt: {
            type: Date
        }
    }],
    fundedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    approvedAt: {
        type: Date
    }
})

const contractSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: {
            type: String,
            enum: ['job'],
            required: true
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true
        },
        proposal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proposal',
            required: true
        }
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    milestones: [milestoneSchema],
    activity: [{
        type: {
            type: String
        },
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: {
            type: String
        },
        at: {
            type: Date,
            default: Date.now
        }
    }],
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        attachments: [{
            url: {
                type: String
            },
            name: {
                type: String
            }
        }],
        sentAt: {
            type: Date,
            default: Date.now
        }
    }],
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
}, {timestamps: true})

contractSchema.index({client: 1, status: 1, createdAt: -1})
contractSchema.index({freelancer: 1, status: 1, createdAt: -1})

const Contract = mongoose.model('Contract', contractSchema)
module.exports = Contract
