require('dotenv').config()

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('./models/user')
const Category = require('./models/category')
const Skill = require('./models/skill')
const ClientProfile = require('./models/clientProfile')
const FreelancerProfile = require('./models/freelancerProfile')
const Job = require('./models/job')
const Proposal = require('./models/proposal')
const Contract = require('./models/contract')
const Review = require('./models/review')
const Transaction = require('./models/transaction')

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        
        console.log("Connected to database")
    } catch (error) {
        console.log(error.message)
    } finally {
        await mongoose.disconnect()
    }
}

seedDatabase()