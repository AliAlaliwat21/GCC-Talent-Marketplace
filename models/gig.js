const mongoose = require("mongoose")

const gigSchema = new mongoose.Schema({
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    coverImage: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryDays: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ["active", "paused", "deleted"],
        default: "active"
    }
}, {timestamps: true})

gigSchema.index({status: 1, category: 1, createdAt: -1})
gigSchema.index({freelancer: 1, status: 1})
gigSchema.index({title: "text", description: "text", tags: "text"})

const Gig = mongoose.model("Gig", gigSchema)

module.exports = Gig
