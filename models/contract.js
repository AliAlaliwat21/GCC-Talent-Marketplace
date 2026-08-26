const mongoose = require('mongoose')


const milestoneSchema = new mongoose.Schema({

    title:{
        type: String,
        required:true,
        trim:true

    },
    description:{
        type:String,
        trim:true
    },
    amount:{
        type: Number,
        required:true,
        min: 0
    },
    dueDate:{
        type: Date
    },
    status:{
        type: String,
        num:[
            'pending',
            'funded',
            'in_progress',
            'delivered',
            'revision_requested',
            'approved',
            'disputed',
            'refunded',
            'split',
            'cancelled'
        ],
        default: 'pending'
    },
    escrowAmount:{
        type: Number,
        default:0
    },

    deliveries: [{
        message:{
            type: String
        },
        attachments:{
            url:String,
            name: String
        },
        SubmittedAt:{
            type:Date
        },
        response:{
            type: String,
            enum: ['approved', 'revision']
        },
        responseNote:{
            type:String
        },
        respondedAt:{
            type:Date
        } 
    }],
    fundedAt:{
        type:Date
    },
    deliveredAt:{
        type:Date
    },
    approvedAt:{
        type:Date
    }

})

const contractSchema = new mongoose.Schema({

    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    freelancer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    source:{

        type:{
            type:String,
            enum:['job', 'gig'],
            required:true
        },
        job:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Job'
        },
        Proposal:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Proposal"
        },

        gig:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Gig"
        },
    },
        totalAmount:{
            type:Number,
            required:true,
            min:0
        },
        currency:{
            type:String,
            default:'USD'
        },
        Status:{
            type:String,
            enum:['active', 'completed', 'cancelled'],
            default:'active'
        },
        milestones:[milestoneSchema],

        activity:[{
            type:{
                type:String
            },
            by:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            message:{
                type:String
            },

            at:{
                type:Date,
                default: Date.now
            }
        }],
        startedAt:{
            type:Date,
            default: Date.now
        },
        completedAt:{
            type:Date
        }
    },{timestamps: true })

    const Contract = mongoose.model('Contract', contractSchema)

    module.exports = Contract



