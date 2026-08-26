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
    


})