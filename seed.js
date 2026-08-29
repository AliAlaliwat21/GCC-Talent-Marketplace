require('dotenv').config()

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Category = require('./models/category')
const Skill = require('./models/skill')
const User = require('./models/user')
const ClientProfile = require('./models/clientProfile')

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
                name: 'Gaming Poster Design',
                slug: 'gaming-poster-design',
                category: graphicDesign._id
            },
            {
                name: 'Story Writing',
                slug: 'story-writing',
                category: writingTranslation._id
            },
            {
                name: 'Arabic Translation',
                slug: 'arabic-translation',
                category: writingTranslation._id
            }
        ])

        console.log("Categories and skills created")

        const adminPassword = bcrypt.hashSync('Admin123!', 10)

        const admin = await User.create({
            username: 'admin',
            email: 'admin@gcctalent.com',
            password: adminPassword,
            role: 'admin',
            status: 'active',
            isVerified: true,
            country: 'Bahrain',
            city: 'Manama'
        })

        console.log(`Admin created: ${admin.email}`)

        const clientPassword = bcrypt.hashSync('Player123!', 10)

        const clientData = [
            {
                username: "pixelmajlis",
                email: "pixelmajlis@gcctalent.com",
                companyName: "Pixel Majlis",
                description: "A gaming community that organizes tournaments and online events",
                website: "https://pixelmajlis.example.com",
                country: "Bahrain",
                city: "Manama"
            },
            {
                username: "pearlarcade",
                email: "pearlarcade@gcctalent.com",
                companyName: "Pearl Arcade",
                description: "A local arcade looking for creative websites and gaming posters",
                website: "https://pearlarcade.example.com",
                country: "Bahrain",
                city: "Muharraq"
            },
            {
                username: "manaforge",
                email: "manaforge@gcctalent.com",
                companyName: "Mana Forge Studio",
                description: "A small gaming studio creating fantasy games and digital stories",
                website: "https://manaforge.example.com",
                country: 'Saudi Arabia',
                city: 'Riyadh'
            },
            {
                username: "desertquest",
                email: "desertquest@gcctalent.com",
                companyName: "Desert Quest Games",
                description: "A game company creating adventure games inspired by the Gulf",
                website: "https://desertquest.example.com",
                country: "United Arab Emirates",
                city: "Dubai"
            },
            {
                username: "moonlightmanga",
                email: "moonlightmanga@gcctalent.com",
                companyName: "Moonlight Manga House",
                description: "A manga community publishing stories and translated content",
                website: "https://moonlightmanga.example.com",
                country: "Qatar",
                city: "Doha"
            },
            {
                username: "controllercorner",
                email: "controllercorner@gcctalent.com",
                companyName: "Controller Corner",
                description: "A gaming shop selling consoles, games and accessories",
                website: "https://controllercorner.example.com",
                country: "Kuwait",
                city: "Kuwait City"
            },
            {
                username: "muscatgamehub",
                email: "muscatgamehub@gcctalent.com",
                companyName: "Muscat Game Hub",
                description: "A social gaming space for tournaments and community events",
                website: "https://muscatgamehub.example.com",
                country: "Oman",
                city: "Muscat"
            },
            {
                username: "chibicanvas",
                email: "chibicanvas@gcctalent.com",
                companyName: "Chibi Canvas Studio",
                description: "A creative studio making anime-style posters and gaming artwork",
                website: "https://chibicanvas.example.com",
                country: "Bahrain",
                city: "Riffa"
            },
            {
                username: "storymodemedia",
                email: "storymodemedia@gcctalent.com",
                companyName: "Story Mode Media",
                description: "A media company producing gaming stories and online content",
                website: "https://storymodemedia.example.com",
                country: "Saudi Arabia",
                city: "Jeddah"
            },
            {
                username: "finalbossevents",
                email: "finalbossevents@gcctalent.com",
                companyName: "Final Boss Events",
                description: "An events company organizing gaming competitions and conventions",
                website: "https://finalbossevents.example.com",
                country: "United Arab Emirates",
                city: "Abu Dhabi"
            }
        ]

        const clients = []

        for (let i = 0; i < clientData.length; i++) {
            const data = clientData[i]

            const client = await User.create({
                username: data.username,
                email: data.email,
                password: clientPassword,
                role: 'client',
                status: 'active',
                isVerified: true,
                country: data.country,
                city: data.city
            })

            await ClientProfile.create({
                user: client._id,
                isCompany: true,
                companyName: data.companyName,
                description: data.description,
                website: data.website
            })

            clients.push(client)
        }

        console.log(`${clients.length} clients created`)
    } catch (error) {
        console.log(error.message)
    } finally {
        await mongoose.disconnect()
    }
}

seedDatabase()