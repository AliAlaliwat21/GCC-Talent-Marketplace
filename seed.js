require('dotenv').config()

const mongoose = require('mongoose')

const Category = require('./models/category')
const Skill = require('./models/skill')
const bcrypt = require('bcrypt')
const User = require('./models/user')

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        console.log("Connected to database")

        await Skill.deleteMany()
        await Category.deleteMany()

        const webDevelopment = await Category.create({
            name: 'Web Development',
            slug: 'web-development',
            icon: 'code',
            isFeatured: true
        })

        const graphicDesign = await Category.create({
            name: 'Graphic Design',
            slug: 'graphic-design',
            icon: 'design',
            isFeatured: true
        })

        const writingTranslation = await Category.create({
            name: 'Writing and Translation',
            slug: 'writing-translation',
            icon: 'writing',
            isFeatured: true
        })

        await Skill.insertMany([
            {
                name: 'HTML',
                slug: 'html',
                category: webDevelopment._id
            },
            {
                name: 'CSS',
                slug: 'css',
                category: webDevelopment._id
            },
            {
                name: 'JavaScript',
                slug: 'javascript',
                category: webDevelopment._id
            },
            {
                name: 'Logo Design',
                slug: 'logo-design',
                category: graphicDesign._id
            },
            {
                name: 'Poster Design',
                slug: 'poster-design',
                category: graphicDesign._id
            },
            {
                name: 'Content Writing',
                slug: 'content-writing',
                category: writingTranslation._id
            },
            {
                name: 'Arabic Translation',
                slug: 'arabic-translation',
                category: writingTranslation._id
            }
        ])
        
        const hashedPassword = bcrypt.hashSync('Admin123!', 10)
        
        const admin = await User.create({
            username: 'admin',
            email: 'admin@gcctalent.com',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            isVerified: true,
            country: 'Bahrain',
            city: 'Manama'
        })
        
        console.log(`Admin created: ${admin.email}`)
        console.log("Categories and skills created")
    
    } catch (error) {
        console.log(error.message)
    } finally {
        await mongoose.disconnect()
    }
}

seedDatabase()