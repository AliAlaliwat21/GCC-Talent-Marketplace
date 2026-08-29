require('dotenv').config()

const dns = require("node:dns")
dns.setServers(["8.8.8.8", "1.1.1.1"])
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
const Review = require("./models/review")
const Transaction = require("./models/transaction")
const Gig = require("./models/gig")


const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        console.log("Connected to database")

        await Review.deleteMany()
        await Transaction.deleteMany()
        await Gig.deleteMany()
        await Contract.deleteMany()
        await Proposal.deleteMany()
        await Job.deleteMany()
        await FreelancerProfile.deleteMany()
        await ClientProfile.deleteMany()
        await User.deleteMany()
        await Skill.deleteMany()
        await Category.deleteMany()

        console.log("Old demo data deleted")

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

        const mobileDevelopment = await Category.create({
            name: "Mobile Development",
            slug: "mobile-development",
            icon: "mobile",
            isFeatured: true
        })

        const digitalMarketing = await Category.create({
            name: "Digital Marketing",
            slug: "digital-marketing",
            icon: "marketing",
            isFeatured: true
        })

        const videoAnimation = await Category.create({
            name: "Video and Animation",
            slug: "video-animation",
            icon: "video",
            isFeatured: false
        })

        const dataAnalytics = await Category.create({
            name: "Data and Analytics",
            slug: "data-analytics",
            icon: "data",
            isFeatured: false
        })

        const businessSupport = await Category.create({
            name: "Business Support",
            slug: "business-support",
            icon: "business",
            isFeatured: false
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
            },
            {
                name: "Node.js",
                slug: "nodejs",
                category: webDevelopment._id
            },
            {
                name: "React",
                slug: "react",
                category: webDevelopment._id
            },
            {
                name: "Illustration",
                slug: "illustration",
                category: graphicDesign._id
            },
            {
                name: "UI Design",
                slug: "ui-design",
                category: graphicDesign._id
            },
            {
                name: "Brand Design",
                slug: "brand-design",
                category: graphicDesign._id
            },
            {
                name: "Copywriting",
                slug: "copywriting",
                category: writingTranslation._id
            },
            {
                name: "English Translation",
                slug: "english-translation",
                category: writingTranslation._id
            },
            {
                name: "Technical Writing",
                slug: "technical-writing",
                category: writingTranslation._id
            },
            {
                name: "React Native",
                slug: "react-native",
                category: mobileDevelopment._id
            },
            {
                name: "Flutter",
                slug: "flutter",
                category: mobileDevelopment._id
            },
            {
                name: "Android Development",
                slug: "android-development",
                category: mobileDevelopment._id
            },
            {
                name: "iOS Development",
                slug: "ios-development",
                category: mobileDevelopment._id
            },
            {
                name: "Mobile UI Design",
                slug: "mobile-ui-design",
                category: mobileDevelopment._id
            },
            {
                name: "SEO",
                slug: "seo",
                category: digitalMarketing._id
            },
            {
                name: "Social Media Marketing",
                slug: "social-media-marketing",
                category: digitalMarketing._id
            },
            {
                name: "Content Marketing",
                slug: "content-marketing",
                category: digitalMarketing._id
            },
            {
                name: "Email Marketing",
                slug: "email-marketing",
                category: digitalMarketing._id
            },
            {
                name: "Campaign Management",
                slug: "campaign-management",
                category: digitalMarketing._id
            },
            {
                name: "Video Editing",
                slug: "video-editing",
                category: videoAnimation._id
            },
            {
                name: "Motion Graphics",
                slug: "motion-graphics",
                category: videoAnimation._id
            },
            {
                name: "2D Animation",
                slug: "2d-animation",
                category: videoAnimation._id
            },
            {
                name: "Intro Animation",
                slug: "intro-animation",
                category: videoAnimation._id
            },
            {
                name: "Video Production",
                slug: "video-production",
                category: videoAnimation._id
            },
            {
                name: "Data Analysis",
                slug: "data-analysis",
                category: dataAnalytics._id
            },
            {
                name: "Excel",
                slug: "excel",
                category: dataAnalytics._id
            },
            {
                name: "Power BI",
                slug: "power-bi",
                category: dataAnalytics._id
            },
            {
                name: "SQL",
                slug: "sql",
                category: dataAnalytics._id
            },
            {
                name: "Data Visualization",
                slug: "data-visualization",
                category: dataAnalytics._id
            },
            {
                name: "Virtual Assistance",
                slug: "virtual-assistance",
                category: businessSupport._id
            },
            {
                name: "Market Research",
                slug: "market-research",
                category: businessSupport._id
            },
            {
                name: "Project Coordination",
                slug: "project-coordination",
                category: businessSupport._id
            },
            {
                name: "Customer Support",
                slug: "customer-support",
                category: businessSupport._id
            },
            {
                name: "Data Entry",
                slug: "data-entry",
                category: businessSupport._id
            }
        ])

        console.log("Categories and skills created")

        const adminPassword = bcrypt.hashSync('Admin123!', 10)

        const admin = await User.create({
            username: 'admin',
            email: 'admin@gcctalent.test',
            password: adminPassword,
            role: 'admin',
            status: 'active',
            isVerified: true,
            country: 'Bahrain',
            city: 'Manama'
        })

        console.log(`Admin created: ${admin.email}`)

        const clientPassword = bcrypt.hashSync('Password123!', 10)

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
        
        const freelancerPassword = bcrypt.hashSync("Password123!", 10)
        
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

        const gigTitles = [
            "Gaming community website setup",
            "Responsive tournament landing page",
            "Fantasy game logo design",
            "Gaming event poster design",
            "Arabic gaming content translation",
            "Short fantasy story writing",
            "Arcade website redesign",
            "Streamer brand logo",
            "Esports event poster",
            "Game article writing",
            "Manga website translation",
            "Gaming shop landing page",
            "Community banner design",
            "Tournament registration page",
            "Fantasy character poster"
        ]

        const gigs = []

        for (let i = 0; i < gigTitles.length; i++) {
            let gigCategory = webDevelopment

            if (i % 3 === 1) {
                gigCategory = graphicDesign
            }

            if (i % 3 === 2) {
                gigCategory = writingTranslation
            }

            const gig = await Gig.create({
                freelancer: freelancers[i]._id,
                title: gigTitles[i],
                description: `I will complete ${gigTitles[i].toLowerCase()} with clear communication and on-time delivery.`,
                category: gigCategory._id,
                tags: ["gaming", "gcc", "creative"],
                price: 50 + (i * 10),
                deliveryDays: 3 + (i % 7),
                status: "active"
            })

            gigs.push(gig)
        }

        console.log(`${gigs.length} gigs created`)
        
        
        const jobDeadline = new Date()
        jobDeadline.setDate(jobDeadline.getDate() + 30)

        const jobs = await Job.insertMany([
            {
                client: clients[0]._id,
                title: "Build a gaming community website",
                description: "Create a responsive website where players can view events and join gaming tournaments",
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
                description: "Build a simple website showing arcade games, opening hours and event information",
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
                description: "Create a landing page introducing a new fantasy game with characters and screenshots",
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
                description: "Create a simple fantasy-style logo for a new adventure game",
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
                description: "Write original short fantasy stories that can be published on a manga community website",
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
                description: "Create promotional posters for an upcoming local gaming tournament",
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
                description: "Create a registration page for players joining local gaming competitions",
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
                description: "Design promotional artwork for a local anime and gaming event",
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
                description: "Build a responsive website where gaming news and articles can be published",
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
                description: "Translate website pages and gaming content from English into Arabic",
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

        const extraJobTitles = [
            "Build a mobile companion page for a game",
            "Create social media posts for an esports event",
            "Edit a gaming tournament highlights video",
            "Prepare a dashboard for tournament results",
            "Coordinate registrations for a gaming convention",
            "Build a clan recruitment website",
            "Design a retro arcade logo",
            "Write a fantasy quest introduction",
            "Create a mobile game promotional page",
            "Plan a social media campaign for a new game",
            "Animate an intro for a gaming channel",
            "Analyze player survey results",
            "Provide customer support for an online tournament",
            "Create a leaderboard website",
            "Design a poster for a manga convention",
            "Translate fantasy character descriptions",
            "Build a simple gaming news website",
            "Create branding for an esports team",
            "Write articles about classic games",
            "Prepare an event registration spreadsheet"
        ]

        const seedCategories = [
            mobileDevelopment,
            digitalMarketing,
            videoAnimation,
            dataAnalytics,
            businessSupport,
            webDevelopment,
            graphicDesign,
            writingTranslation
        ]

        for (let i = 0; i < extraJobTitles.length; i++) {
            const category = seedCategories[i % seedCategories.length]
            const relatedSkills = []

            for (let j = 0; j < skills.length; j++) {
                if (skills[j].category.toString() === category._id.toString() && relatedSkills.length < 3) {
                    relatedSkills.push(skills[j]._id)
                }
            }

            let status = "open"

            if (i % 6 === 4) {
                status = "draft"
            }

            if (i % 6 === 5) {
                status = "closed"
            }

            const extraJob = await Job.create({
                client: clients[i % clients.length]._id,
                title: extraJobTitles[i],
                description: `${extraJobTitles[i]} for a GCC gaming or creative community with clear deliverables.`,
                category: category._id,
                skills: relatedSkills,
                budgetType: i % 4 === 0 ? "hourly" : "fixed",
                budgetMin: 200 + (i * 25),
                budgetMax: 500 + (i * 40),
                experienceLevel: i % 3 === 0 ? "entry" : "intermediate",
                duration: "Three weeks",
                deadline: jobDeadline,
                status: status
            })

            jobs.push(extraJob)
        }

        console.log(`${jobs.length} jobs created`)
        
        const proposals = []
        
        const firstProposal = await Proposal.create({
            job: jobs[0]._id,
            freelancer: freelancers[0]._id,
            coverLetter: "I can build this gaming community website using HTML, CSS and JavaScript",
            amount: 900,
            deliveryDays: 20,
            status: "pending"
        })

        proposals.push(firstProposal)

        const secondProposal = await Proposal.create({
            job: jobs[1]._id,
            freelancer: freelancers[1]._id,
            coverLetter: "I can create a responsive arcade website with a clean design",
            amount: 650,
            deliveryDays: 15,
            status: "shortlisted"
        })

        proposals.push(secondProposal)

        const acceptedProposal = await Proposal.create({
            job: jobs[8]._id,
            freelancer: freelancers[2]._id,
            coverLetter: "I can develop the gaming articles website and complete every required page",
            amount: 1100,
            deliveryDays: 25,
            status: "accepted"
        })

        proposals.push(acceptedProposal)

        const completedProposal = await Proposal.create({
            job: jobs[9]._id,
            freelancer: freelancers[18]._id,
            coverLetter: "I can translate the website content into clear and natural Arabic",
            amount: 500,
            deliveryDays: 10,
            status: "accepted"
        })

        proposals.push(completedProposal)

        const proposalPairs = new Set()

        for (let i = 0; i < proposals.length; i++) {
            proposalPairs.add(`${proposals[i].job}-${proposals[i].freelancer}`)
        }

        let proposalAttempt = 0

        while (proposals.length < 60 && proposalAttempt < 600) {
            const job = jobs[(proposalAttempt + 2) % jobs.length]
            const freelancer = freelancers[(proposalAttempt + 3) % freelancers.length]
            const pair = `${job._id}-${freelancer._id}`

            if (!proposalPairs.has(pair)) {
                let status = "declined"

                if (job.status === "open") {
                    status = proposalAttempt % 4 === 0 ? "shortlisted" : "pending"
                }

                const proposal = await Proposal.create({
                    job: job._id,
                    freelancer: freelancer._id,
                    coverLetter: `I can complete ${job.title.toLowerCase()} and provide regular progress updates.`,
                    amount: job.budgetMin || 300,
                    deliveryDays: 7 + (proposalAttempt % 20),
                    status: status
                })

                proposals.push(proposal)
                proposalPairs.add(pair)
            }

            proposalAttempt = proposalAttempt + 1
        }

        jobs[0].proposalsCount = 1
        jobs[1].proposalsCount = 1
        jobs[8].proposalsCount = 1
        jobs[9].proposalsCount = 1

        await jobs[0].save()
        await jobs[1].save()
        await jobs[8].save()
        await jobs[9].save()

        for (let i = 0; i < jobs.length; i++) {
            let proposalCount = 0

            for (let j = 0; j < proposals.length; j++) {
                if (proposals[j].job.toString() === jobs[i]._id.toString()) {
                    proposalCount = proposalCount + 1
                }
            }

            jobs[i].proposalsCount = proposalCount
            await jobs[i].save()
        }
        
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
                    description: "Build the main website pages and navigation",
                    amount: 400,
                    status: "approved",
                    approvedAt: new Date()
                },
                {
                    title: "Create the article pages",
                    description: "Build and style the gaming article pages",
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
                    description: "Translate all website pages into Arabic",
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

        const extraContracts = []

        for (let i = 10; i < 19; i++) {
            let contractProposal

            for (let j = 0; j < proposals.length; j++) {
                if (proposals[j].job.toString() === jobs[i]._id.toString()) {
                    contractProposal = proposals[j]
                    break
                }
            }

            if (!contractProposal) {
                contractProposal = await Proposal.create({
                    job: jobs[i]._id,
                    freelancer: freelancers[i % freelancers.length]._id,
                    coverLetter: `I can complete ${jobs[i].title.toLowerCase()} within the agreed schedule.`,
                    amount: jobs[i].budgetMin || 300,
                    deliveryDays: 14,
                    status: "accepted"
                })

                proposals.push(contractProposal)
            }

            contractProposal.status = "accepted"
            await contractProposal.save()

            jobs[i].status = "completed"
            await jobs[i].save()

            const extraContract = await Contract.create({
                client: jobs[i].client,
                freelancer: contractProposal.freelancer,
                source: {
                    type: "job",
                    job: jobs[i]._id,
                    proposal: contractProposal._id
                },
                title: jobs[i].title,
                totalAmount: contractProposal.amount,
                currency: "USD",
                status: "completed",
                milestones: [
                    {
                        title: "Complete the agreed work",
                        description: jobs[i].description,
                        amount: contractProposal.amount,
                        status: "approved",
                        approvedAt: new Date()
                    }
                ],
                activity: [
                    {
                        type: "contract_completed",
                        by: jobs[i].client,
                        message: "Contract completed successfully"
                    }
                ],
                messages: [
                    {
                        sender: jobs[i].client,
                        text: "Thank you. The requirements and deadline are confirmed."
                    }
                ],
                completedAt: new Date()
            })

            contracts.push(extraContract)
            extraContracts.push(extraContract)
        }

        console.log(`${contracts.length} contracts created`)
        
        const clientReview = await Review.create({
            contract: completedContract._id,
            reviewer: clients[9]._id,
            reviewee: freelancers[18]._id,
            rating: 5,
            comment: "The translation was clear and completed on time"
        })

        const freelancerReview = await Review.create({
            contract: completedContract._id,
            reviewer: freelancers[18]._id,
            reviewee: clients[9]._id,
            rating: 4,
            comment: "The client provided clear instructions and responded quickly."
        })

        freelancers[18].ratingAvg = 5
        freelancers[18].ratingCount = 1

        clients[9].ratingAvg = 4
        clients[9].ratingCount = 1

        await freelancers[18].save()
        await clients[9].save()

        const reviews = [
            clientReview,
            freelancerReview
        ]

        for (let i = 0; i < extraContracts.length; i++) {
            const clientSeedReview = await Review.create({
                contract: extraContracts[i]._id,
                reviewer: extraContracts[i].client,
                reviewee: extraContracts[i].freelancer,
                rating: 4 + (i % 2),
                comment: "The freelancer delivered the agreed work and communicated clearly."
            })

            const freelancerSeedReview = await Review.create({
                contract: extraContracts[i]._id,
                reviewer: extraContracts[i].freelancer,
                reviewee: extraContracts[i].client,
                rating: 4 + ((i + 1) % 2),
                comment: "The client shared clear requirements and responded on time."
            })

            reviews.push(clientSeedReview)
            reviews.push(freelancerSeedReview)
        }

        const reviewedUserIds = []

        for (let i = 0; i < reviews.length; i++) {
            const revieweeId = reviews[i].reviewee.toString()

            if (!reviewedUserIds.includes(revieweeId)) {
                reviewedUserIds.push(revieweeId)
            }
        }

        for (let i = 0; i < reviewedUserIds.length; i++) {
            const userReviews = await Review.find({reviewee: reviewedUserIds[i]})
            let totalRating = 0

            for (let j = 0; j < userReviews.length; j++) {
                totalRating = totalRating + userReviews[j].rating
            }

            await User.findByIdAndUpdate(reviewedUserIds[i], {
                ratingAvg: totalRating / userReviews.length,
                ratingCount: userReviews.length
            })
        }

        console.log(`${reviews.length} reviews created`)

    } catch (error) {
        console.log(error.message)
    } finally {
        await mongoose.disconnect()
    }
}

if (require.main === module) {
    seedDatabase()
}

module.exports = seedDatabase
