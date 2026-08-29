require('dotenv').config()

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Category = require('./models/category')
const Skill = require('./models/skill')
const User = require('./models/user')
const ClientProfile = require('./models/clientProfile')
const FreelancerProfile = require('./models/freelancerProfile')
const Job = require("./models/job")
const Proposal = require("./models/proposal")
const Contract = require("./models/contract")

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
        
        const skills = await Skill.insertMany([
            
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
        
        const freelancerPassword = bcrypt.hashSync("Freelancer123!", 10)
        
        const freelancerData = [
            {
                username: "shadowcoder",
                headline: "JavaScript Developer",
                hourlyRate: 20,
                country: "Bahrain",
                city: "Manama",
                skillOne: 0,
                skillTwo: 2
            },
            {
                username: "pixelmage",
                headline: "Front-End Developer",
                hourlyRate: 18,
                country: "Bahrain",
                city: "Riffa",
                skillOne: 0,
                skillTwo: 1
            },
            {
                username: "websamurai",
                headline: "JavaScript Web Developer",
                hourlyRate: 25,
                country: "Saudi Arabia",
                city: "Riyadh",
                skillOne: 1,
                skillTwo: 2
            },
            {
                username: "codehunter",
                headline: "Website Developer",
                hourlyRate: 30,
                country: "United Arab Emirates",
                city: "Dubai",
                skillOne: 0,
                skillTwo: 2
            },
            {
                username: "manaweb",
                headline: "Front-End Website Developer",
                hourlyRate: 22,
                country: "Qatar",
                city: "Doha",
                skillOne: 0,
                skillTwo: 1
            },
            {
                username: "arcadedev",
                headline: "JavaScript Developer",
                hourlyRate: 24,
                country: "Kuwait",
                city: "Kuwait City",
                skillOne: 1,
                skillTwo: 2
            },
            {
                username: "questcoder",
                headline: "Web Application Developer",
                hourlyRate: 21,
                country: "Oman",
                city: "Muscat",
                skillOne: 0,
                skillTwo: 2
            },
            {
                username: "respawnweb",
                headline: "Responsive Website Developer",
                hourlyRate: 28,
                country: "United Arab Emirates",
                city: "Abu Dhabi",
                skillOne: 0,
                skillTwo: 1
            },
            {
                username: "nightpixel",
                headline: "Front-End Developer",
                hourlyRate: 26,
                country: "Saudi Arabia",
                city: "Jeddah",
                skillOne: 1,
                skillTwo: 2
            },
            {
                username: "dragonbyte",
                headline: "JavaScript Website Developer",
                hourlyRate: 23,
                country: "Bahrain",
                city: "Muharraq",
                skillOne: 0,
                skillTwo: 2
            },
            {
                username: "logohero",
                headline: "Logo Designer",
                hourlyRate: 17,
                country: "Bahrain",
                city: "Manama",
                skillOne: 3,
                skillTwo: 4
            },
            {
                username: "posterknight",
                headline: "Gaming Poster Designer",
                hourlyRate: 19,
                country: "Saudi Arabia",
                city: "Dammam",
                skillOne: 3,
                skillTwo: 4
            },
            {
                username: "canvasninja",
                headline: "Graphic Designer",
                hourlyRate: 22,
                country: "United Arab Emirates",
                city: "Dubai",
                skillOne: 3,
                skillTwo: 4
            },
            {
                username: "pixelartist",
                headline: "Gaming Graphic Designer",
                hourlyRate: 21,
                country: "Qatar",
                city: "Doha",
                skillOne: 3,
                skillTwo: 4
            },
            {
                username: "guilddesigner",
                headline: "Logo and Poster Designer",
                hourlyRate: 20,
                country: "Kuwait",
                city: "Kuwait City",
                skillOne: 3,
                skillTwo: 4
            },
            {
                username: "storyscribe",
                headline: "Story Writer",
                hourlyRate: 16,
                country: "Oman",
                city: "Muscat",
                skillOne: 5,
                skillTwo: 6
            },
            {
                username: "moonwriter",
                headline: "Gaming Content Writer",
                hourlyRate: 18,
                country: "Bahrain",
                city: "Manama",
                skillOne: 5,
                skillTwo: 6
            },
            {
                username: "questwriter",
                headline: "Creative Story Writer",
                hourlyRate: 20,
                country: "Saudi Arabia",
                city: "Riyadh",
                skillOne: 5,
                skillTwo: 6
            },
            {
                username: "arabicscribe",
                headline: "Arabic Writer and Translator",
                hourlyRate: 24,
                country: "United Arab Emirates",
                city: "Sharjah",
                skillOne: 5,
                skillTwo: 6
            },
            {
                username: "lorekeeper",
                headline: "Story and Content Writer",
                hourlyRate: 19,
                country: "Qatar",
                city: "Doha",
                skillOne: 5,
                skillTwo: 6
            }
        ]

        const freelancers = []
        
        for (let i = 0; i < freelancerData.length; i++) {
            const data = freelancerData[i]

            const freelancer = await User.create({
                username: data.username,
                email: `${data.username}@gcctalent.com`,
                password: freelancerPassword,
                role: "freelancer",
                status: "active",
                isVerified: true,
                country: data.country,
                city: data.city
            })

            await FreelancerProfile.create({
                user: freelancer._id,
                headline: data.headline,
                bio: `I provide ${data.headline.toLowerCase()} services for clients across the GCC.`,
                skills: [
                    skills[data.skillOne]._id,
                    skills[data.skillTwo]._id
                ],
                hourlyRate: data.hourlyRate,
                languages: [
                    {
                        name: "Arabic",
                        level: "Fluent"
                    },
                    {
                        name: "English",
                        level: "Fluent"
                    }
                ],
                availability: "full_time"
            })

            freelancers.push(freelancer)
        }

        console.log(`${freelancers.length} freelancers created`)
        console.log(`${clients.length} clients created`)
        
        
        const jobDeadline = new Date()
        jobDeadline.setDate(jobDeadline.getDate() + 30)

        const jobs = await Job.insertMany([
            {
                client: clients[0]._id,
                title: "Build a gaming community website",
                description: "Create a responsive website where players can view events and join gaming tournaments.",
                category: webDevelopment._id,
                skills: [
                    skills[0]._id,
                    skills[1]._id,
                    skills[2]._id
                ],
                budgetType: "fixed",
                budgetMin: 700,
                budgetMax: 1000,
                experienceLevel: "intermediate",
                duration: "One month",
                deadline: jobDeadline,
                status: "open"
            },
            {
                client: clients[1]._id,
                title: "Create a website for an arcade",
                description: "Build a simple website showing arcade games, opening hours and event information.",
                category: webDevelopment._id,
                skills: [
                    skills[0]._id,
                    skills[1]._id
                ],
                budgetType: "fixed",
                budgetMin: 500,
                budgetMax: 800,
                experienceLevel: "entry",
                duration: "Three weeks",
                deadline: jobDeadline,
                status: "open"
            },
            {
                client: clients[2]._id,
                title: "Develop a fantasy game landing page",
                description: "Create a landing page introducing a new fantasy game with characters and screenshots.",
                category: webDevelopment._id,
                skills: [
                    skills[0]._id,
                    skills[1]._id,
                    skills[2]._id
                ],
                budgetType: "fixed",
                budgetMin: 800,
                budgetMax: 1200,
                experienceLevel: "intermediate",
                duration: "One month",
                deadline: jobDeadline,
                status: "open"
            },
            {
                client: clients[3]._id,
                title: "Design a logo for an adventure game",
                description: "Create a simple fantasy-style logo for a new adventure game.",
                category: graphicDesign._id,
                skills: [
                    skills[3]._id
                ],
                budgetType: "fixed",
                budgetMin: 150,
                budgetMax: 300,
                experienceLevel: "entry",
                duration: "One week",
                deadline: jobDeadline,
                status: "open"
            },
            {
                client: clients[4]._id,
                title: "Write short stories for a manga website",
                description: "Write original short fantasy stories that can be published on a manga community website.",
                category: writingTranslation._id,
                skills: [
                    skills[5]._id
                ],
                budgetType: "fixed",
                budgetMin: 300,
                budgetMax: 500,
                experienceLevel: "intermediate",
                duration: "Two weeks",
                deadline: jobDeadline,
                status: "open"
            },
            {
                client: clients[5]._id,
                title: "Design posters for a gaming tournament",
                description: "Create promotional posters for an upcoming local gaming tournament.",
                category: graphicDesign._id,
                skills: [
                    skills[4]._id
                ],
                budgetType: "fixed",
                budgetMin: 200,
                budgetMax: 400,
                experienceLevel: "intermediate",
                duration: "Two weeks",
                deadline: jobDeadline,
                status: "open"
            },
            {
                client: clients[6]._id,
                title: "Build a tournament registration page",
                description: "Create a registration page for players joining local gaming competitions.",
                category: webDevelopment._id,
                skills: [
                    skills[0]._id,
                    skills[1]._id,
                    skills[2]._id
                ],
                budgetType: "hourly",
                budgetMin: 15,
                budgetMax: 25,
                experienceLevel: "intermediate",
                duration: "Three weeks",
                deadline: jobDeadline,
                status: "draft"
            },
            {
                client: clients[7]._id,
                title: "Create artwork for an anime event",
                description: "Design promotional artwork for a local anime and gaming event.",
                category: graphicDesign._id,
                skills: [
                    skills[3]._id,
                    skills[4]._id
                ],
                budgetType: "fixed",
                budgetMin: 250,
                budgetMax: 450,
                experienceLevel: "intermediate",
                duration: "Two weeks",
                deadline: jobDeadline,
                status: "closed"
            },
            {
                client: clients[8]._id,
                title: "Develop a website for gaming articles",
                description: "Build a responsive website where gaming news and articles can be published.",
                category: webDevelopment._id,
                skills: [
                    skills[0]._id,
                    skills[1]._id,
                    skills[2]._id
                ],
                budgetType: "fixed",
                budgetMin: 900,
                budgetMax: 1300,
                experienceLevel: "expert",
                duration: "Six weeks",
                deadline: jobDeadline,
                status: "in_progress"
            },
            {
                client: clients[9]._id,
                title: "Translate gaming website content into Arabic",
                description: "Translate website pages and gaming content from English into Arabic.",
                category: writingTranslation._id,
                skills: [
                    skills[6]._id
                ],
                budgetType: "fixed",
                budgetMin: 350,
                budgetMax: 600,
                experienceLevel: "intermediate",
                duration: "Three weeks",
                deadline: jobDeadline,
                status: "completed"
            }
        ])
        console.log(`${jobs.length} jobs created`)
        
        const proposals = []
        
        const firstProposal = await Proposal.create({
            job: jobs[0]._id,
            freelancer: freelancers[0]._id,
            coverLetter: "I can build this gaming community website using HTML, CSS and JavaScript.",
            amount: 900,
            deliveryDays: 20,
            status: "pending"
        })

        proposals.push(firstProposal)

        const secondProposal = await Proposal.create({
            job: jobs[1]._id,
            freelancer: freelancers[1]._id,
            coverLetter: "I can create a responsive arcade website with a clean design.",
            amount: 650,
            deliveryDays: 15,
            status: "shortlisted"
        })

        proposals.push(secondProposal)

        const acceptedProposal = await Proposal.create({
            job: jobs[8]._id,
            freelancer: freelancers[2]._id,
            coverLetter: "I can develop the gaming articles website and complete every required page.",
            amount: 1100,
            deliveryDays: 25,
            status: "accepted"
        })

        proposals.push(acceptedProposal)

        const completedProposal = await Proposal.create({
            job: jobs[9]._id,
            freelancer: freelancers[18]._id,
            coverLetter: "I can translate the website content into clear and natural Arabic.",
            amount: 500,
            deliveryDays: 10,
            status: "accepted"
        })

        proposals.push(completedProposal)

        jobs[0].proposalsCount = 1
        jobs[1].proposalsCount = 1
        jobs[8].proposalsCount = 1
        jobs[9].proposalsCount = 1

        await jobs[0].save()
        await jobs[1].save()
        await jobs[8].save()
        await jobs[9].save()
        
        console.log(`${proposals.length} proposals created`)
        
        const activeContract = await Contract.create({
            client: clients[8]._id,
            freelancer: freelancers[2]._id,
            source: {
                type: "job",
                job: jobs[8]._id,
                proposal: acceptedProposal._id
            },
            title: "Gaming articles website contract",
            totalAmount: 1100,
            currency: "USD",
            status: "active",
            milestones: [
                {
                    title: "Create the website structure",
                    description: "Build the main website pages and navigation.",
                    amount: 400,
                    status: "approved",
                    approvedAt: new Date()
                },
                {
                    title: "Create the article pages",
                    description: "Build and style the gaming article pages.",
                    amount: 700,
                    status: "in_progress",
                    escrowAmount: 700,
                    fundedAt: new Date()
                }
            ]
        })

        const completedContract = await Contract.create({
            client: clients[9]._id,
            freelancer: freelancers[18]._id,
            source: {
                type: "job",
                job: jobs[9]._id,
                proposal: completedProposal._id
            },
            title: "Arabic website translation contract",
            totalAmount: 500,
            currency: "USD",
            status: "completed",
            milestones: [
                {
                    title: "Translate website content",
                    description: "Translate all website pages into Arabic.",
                    amount: 500,
                    status: "approved",
                    approvedAt: new Date()
                }
            ],
            completedAt: new Date()
        })

        const contracts = [
            activeContract,
            completedContract
        ]

        console.log(`${contracts.length} contracts created`)

    } catch (error) {
        console.log(error.message)
    } finally {
        await mongoose.disconnect()
    }
}

seedDatabase()