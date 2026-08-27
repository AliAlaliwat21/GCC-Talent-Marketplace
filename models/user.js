const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['client', 'freelancer', 'admin']
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    },
    ratingAvg: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0,
        min: 0
    },
    wallet: {
        available: {
            type: Number,
            default: 0,
            min: 0
        },
        pending: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    verificationCodeExpire: {
        type: Date
    },
    verificationAttempts: {
        type: Number,
        default:0
    },
    verificationLockTime: {
        type: Date
    },
    avatarUrl: {
    type: String,
    default: ''
    },
    notificationPrefs: {
    email: {
        type: Boolean,
        default: true
         },
    inApp: {
        type: Boolean,
        default: true
        }
    },
    refreshTokenHash: {
        type: String,
        default: null
    },
    country: {
    type: String,
    enum: [
        'Bahrain',
        'Kuwait',
        'Oman',
        'Qatar',
        'Saudi Arabia',
        'United Arab Emirates'
    ],
},
    city: {
        type: String,
        trim: true,
    },

}, {timestamps: true})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.password
        delete returnedObject.refreshTokenHash
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User