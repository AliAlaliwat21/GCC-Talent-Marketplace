require("./setup")

const request = require("supertest")
const bcrypt = require("bcrypt")
const {app} = require("../server")
const Category = require("../models/category")
const Skill = require("../models/skill")
const User = require("../models/user")
const ClientProfile = require("../models/clientProfile")
const FreelancerProfile = require("../models/freelancerProfile")
const Contract = require("../models/contract")
const Proposal = require("../models/proposal")
const Transaction = require("../models/transaction")

const register = async (username, role) => {
    const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
            username: username,
            email: `${username}@test.com`,
            password: "Password123!",
            role: role
        })

    return {
        token: response.body.accessToken,
        cookie: response.headers["set-cookie"],
        response: response
    }
}

const createMasterData = async () => {
    const category = await Category.create({
        name: "Web Development",
        slug: "web-development"
    })

    const skill = await Skill.create({
        name: "JavaScript",
        slug: "javascript",
        category: category._id
    })

    return {
        category: category,
        skill: skill
    }
}

const createOpenJob = async (token, category, skill) => {
    return request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Build a gaming community website",
            description: "Create a responsive gaming community website for GCC players.",
            category: category._id.toString(),
            skills: [skill._id.toString()],
            budgetType: "fixed",
            budgetMin: 500,
            budgetMax: 800,
            experienceLevel: "intermediate",
            duration: "Three weeks",
            status: "open"
        })
}

const saveFreelancerProfile = async (token, skill) => {
    return request(app)
        .put("/api/v1/freelancers/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
            headline: "JavaScript Marketplace Developer",
            bio: "I build reliable marketplace websites for clients across the GCC.",
            skills: [skill._id.toString()],
            hourlyRate: 25,
            languages: [
                {
                    name: "English",
                    level: "Fluent"
                }
            ],
            availability: "full_time",
            country: "Bahrain",
            city: "Manama"
        })
}

const saveClientProfile = async (token) => {
    return request(app)
        .put("/api/v1/clients/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
            isCompany: true,
            companyName: "Pixel Majlis",
            description: "A GCC gaming community looking for creative freelancers.",
            website: "https://pixelmajlis.example.com",
            country: "Bahrain",
            city: "Manama"
        })
}

describe("authentication API", () => {
    test("registers, logs in, refreshes and logs out", async () => {
        const agent = request.agent(app)

        const registration = await agent
            .post("/api/v1/auth/register")
            .send({
                username: "authclient",
                email: "authclient@test.com",
                password: "Password123!",
                role: "client"
            })

        expect(registration.status).toBe(201)
        expect(registration.body.accessToken).toBeDefined()

        const login = await agent
            .post("/api/v1/auth/login")
            .send({
                email: "authclient@test.com",
                password: "Password123!"
            })

        expect(login.status).toBe(200)

        const refresh = await agent.post("/api/v1/auth/refresh")
        expect(refresh.status).toBe(200)
        expect(refresh.body.accessToken).toBeDefined()

        const logout = await agent.post("/api/v1/auth/logout")
        expect(logout.status).toBe(200)
    })
})

describe("jobs API", () => {
    test("creates, lists and protects a draft job", async () => {
        const client = await register("jobclient", "client")
        const masterData = await createMasterData()

        const openJob = await createOpenJob(
            client.token,
            masterData.category,
            masterData.skill
        )

        expect(openJob.status).toBe(201)
        expect(openJob.body.status).toBe("open")

        const list = await request(app).get("/api/v1/jobs")
        expect(list.status).toBe(200)
        expect(list.body.jobs).toHaveLength(1)

        const draft = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                title: "Draft gaming website",
                description: "This draft should only be visible to its owner.",
                category: masterData.category._id.toString(),
                skills: [masterData.skill._id.toString()],
                budgetType: "fixed",
                status: "draft"
            })

        const guestView = await request(app).get(`/api/v1/jobs/${draft.body._id}`)
        expect(guestView.status).toBe(404)

        const ownerView = await request(app)
            .get(`/api/v1/jobs/${draft.body._id}`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(ownerView.status).toBe(200)
    })
})

describe("proposals and contracts API", () => {
    test("submits and accepts a proposal to create a contract", async () => {
        const client = await register("proposalclient", "client")
        const freelancer = await register("proposalfreelancer", "freelancer")
        const masterData = await createMasterData()

        const freelancerUser = await User.findOne({email: "proposalfreelancer@test.com"})

        await FreelancerProfile.create({
            user: freelancerUser._id,
            headline: "JavaScript Developer",
            bio: "I build responsive websites for gaming communities.",
            skills: [masterData.skill._id],
            hourlyRate: 20,
            languages: [{name: "English", level: "Fluent"}],
            availability: "full_time"
        })

        const job = await createOpenJob(
            client.token,
            masterData.category,
            masterData.skill
        )

        const proposal = await request(app)
            .post(`/api/v1/jobs/${job.body._id}/proposals`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                coverLetter: "I can complete this website and provide regular updates.",
                amount: 700,
                deliveryDays: 14
            })

        expect(proposal.status).toBe(201)

        const accepted = await request(app)
            .post(`/api/v1/proposals/${proposal.body._id}/accept`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                milestones: [
                    {
                        title: "Complete the website",
                        description: "Build and deliver the complete website.",
                        amount: 700
                    }
                ]
            })

        expect(accepted.status).toBe(200)
        expect(accepted.body.status).toBe("active")
    })
})

describe("wallet and escrow API", () => {
    test("funds, delivers and approves a milestone without double deposits", async () => {
        const client = await register("walletclient", "client")
        const freelancer = await register("walletfreelancer", "freelancer")
        const masterData = await createMasterData()

        const freelancerUser = await User.findOne({email: "walletfreelancer@test.com"})

        await FreelancerProfile.create({
            user: freelancerUser._id,
            headline: "Web Developer",
            bio: "I create responsive websites and deliver milestones on time.",
            skills: [masterData.skill._id],
            hourlyRate: 25,
            languages: [{name: "English", level: "Fluent"}],
            availability: "full_time"
        })

        const job = await createOpenJob(
            client.token,
            masterData.category,
            masterData.skill
        )

        const proposal = await request(app)
            .post(`/api/v1/jobs/${job.body._id}/proposals`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                coverLetter: "I can complete this project with clear milestone delivery.",
                amount: 700,
                deliveryDays: 14
            })

        const accepted = await request(app)
            .post(`/api/v1/proposals/${proposal.body._id}/accept`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                milestones: [{title: "Website", amount: 700}]
            })

        const contract = await Contract.findById(accepted.body._id)
        const milestoneId = contract.milestones[0]._id

        const depositBody = {
            amount: 1000,
            card: {
                number: "4242424242424242",
                exp: "12/30",
                cvc: "123"
            }
        }

        const firstDeposit = await request(app)
            .post("/api/v1/wallet/deposit")
            .set("Authorization", `Bearer ${client.token}`)
            .set("Idempotency-Key", "wallet-test-deposit")
            .send(depositBody)

        const repeatedDeposit = await request(app)
            .post("/api/v1/wallet/deposit")
            .set("Authorization", `Bearer ${client.token}`)
            .set("Idempotency-Key", "wallet-test-deposit")
            .send(depositBody)

        expect(firstDeposit.status).toBe(200)
        expect(repeatedDeposit.status).toBe(200)
        expect(repeatedDeposit.body.wallet.available).toBe(1000)

        const funded = await request(app)
            .post(`/api/v1/contracts/${contract._id}/milestones/${milestoneId}/fund`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(funded.status).toBe(200)

        const delivered = await request(app)
            .post(`/api/v1/contracts/${contract._id}/milestones/${milestoneId}/deliver`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({message: "The completed website is ready for review."})

        expect(delivered.status).toBe(200)

        const approved = await request(app)
            .post(`/api/v1/contracts/${contract._id}/milestones/${milestoneId}/approve`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(approved.status).toBe(200)
        expect(approved.body.status).toBe("completed")

        const transactions = await Transaction.find({contract: contract._id})
        expect(transactions).toHaveLength(3)
    })
})

describe("profile and account APIs", () => {
    test("manages freelancer, portfolio, client and account details", async () => {
        const masterData = await createMasterData()
        const freelancer = await register("profilefreelancer", "freelancer")
        const freelancerUser = await User.findOne({username: "profilefreelancer"})

        const createdProfile = await saveFreelancerProfile(freelancer.token, masterData.skill)

        expect(createdProfile.status).toBe(201)

        const profileId = createdProfile.body._id

        const updatedProfile = await request(app)
            .patch(`/api/v1/freelancers/${profileId}`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                headline: "Senior JavaScript Marketplace Developer",
                hourlyRate: 30,
                city: "Riffa"
            })

        expect(updatedProfile.status).toBe(200)
        expect(updatedProfile.body.hourlyRate).toBe(30)

        const addedPortfolio = await request(app)
            .post(`/api/v1/freelancers/${profileId}/portfolio`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                title: "Gaming Community Website",
                description: "A responsive community website for GCC players.",
                link: "https://portfolio.example.com/gaming-community"
            })

        expect(addedPortfolio.status).toBe(201)

        const portfolioId = addedPortfolio.body.portfolio[0]._id

        const updatedPortfolio = await request(app)
            .patch(`/api/v1/freelancers/${profileId}/portfolio/${portfolioId}`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({title: "Updated Gaming Community Website"})

        expect(updatedPortfolio.status).toBe(200)
        expect(updatedPortfolio.body.portfolio[0].title).toBe("Updated Gaming Community Website")

        const publicProfile = await request(app)
            .get(`/api/v1/freelancers/${freelancerUser._id}`)

        expect(publicProfile.status).toBe(200)
        expect(publicProfile.body.user.username).toBe("profilefreelancer")

        const searchProfiles = await request(app)
            .get(`/api/v1/freelancers?q=javascript&skill=${masterData.skill._id}&country=Bahrain&limit=500`)

        expect(searchProfiles.status).toBe(200)
        expect(searchProfiles.body.profiles).toHaveLength(1)
        expect(searchProfiles.body.limit).toBe(50)

        const accountUpdate = await request(app)
            .patch("/api/v1/users/me")
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                avatarUrl: "https://images.example.com/avatar.png",
                notificationPrefs: {
                    email: true,
                    inApp: true
                }
            })

        expect(accountUpdate.status).toBe(200)

        const currentUser = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", `Bearer ${freelancer.token}`)

        expect(currentUser.status).toBe(200)
        expect(currentUser.body.password).toBeUndefined()

        const passwordChange = await request(app)
            .patch("/api/v1/users/me/password")
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                currentPassword: "Password123!",
                newPassword: "NewPassword123!"
            })

        expect(passwordChange.status).toBe(200)

        const deletedPortfolio = await request(app)
            .delete(`/api/v1/freelancers/${profileId}/portfolio/${portfolioId}`)
            .set("Authorization", `Bearer ${freelancer.token}`)

        expect(deletedPortfolio.status).toBe(200)

        const client = await register("profileclient", "client")
        const clientUser = await User.findOne({username: "profileclient"})
        const createdClientProfile = await saveClientProfile(client.token)

        expect(createdClientProfile.status).toBe(201)

        const currentClientProfile = await request(app)
            .get("/api/v1/clients/me")
            .set("Authorization", `Bearer ${client.token}`)

        expect(currentClientProfile.status).toBe(200)

        const updatedClientProfile = await request(app)
            .patch("/api/v1/clients/me")
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                description: "An updated GCC gaming community company description.",
                city: "Muharraq"
            })

        expect(updatedClientProfile.status).toBe(200)

        const publicClientProfile = await request(app)
            .get(`/api/v1/clients/${clientUser._id}`)

        expect(publicClientProfile.status).toBe(200)
        expect(publicClientProfile.body.hiringSummary.jobsPosted).toBe(0)

        const clientProfiles = await request(app).get("/api/v1/clients?limit=500")

        expect(clientProfiles.status).toBe(200)
        expect(clientProfiles.body.limit).toBe(50)

        const noUpload = await request(app)
            .post("/api/v1/uploads")
            .set("Authorization", `Bearer ${client.token}`)

        expect(noUpload.status).toBe(400)

        const deletedClientProfile = await request(app)
            .delete("/api/v1/clients/me")
            .set("Authorization", `Bearer ${client.token}`)

        expect(deletedClientProfile.status).toBe(200)

        const deletedFreelancerProfile = await request(app)
            .delete(`/api/v1/freelancers/${profileId}`)
            .set("Authorization", `Bearer ${freelancer.token}`)

        expect(deletedFreelancerProfile.status).toBe(200)
    })
})

describe("job lifecycle API", () => {
    test("updates, publishes, closes, reopens and deletes owned jobs", async () => {
        const masterData = await createMasterData()
        const client = await register("jobowner", "client")

        const draft = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                title: "Build a game guide website",
                description: "Create a responsive website for game guides and walkthroughs.",
                category: masterData.category._id.toString(),
                skills: [masterData.skill._id.toString()],
                budgetType: "fixed",
                budgetMin: 300,
                budgetMax: 500,
                status: "draft"
            })

        expect(draft.status).toBe(201)

        const hiddenFromGuest = await request(app).get(`/api/v1/jobs/${draft.body._id}`)
        const visibleToOwner = await request(app)
            .get(`/api/v1/jobs/${draft.body._id}`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(hiddenFromGuest.status).toBe(404)
        expect(visibleToOwner.status).toBe(200)

        const updated = await request(app)
            .patch(`/api/v1/jobs/${draft.body._id}`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                title: "Build an updated game guide website",
                budgetMin: 350,
                budgetMax: 550
            })

        expect(updated.status).toBe(200)

        const published = await request(app)
            .patch(`/api/v1/jobs/${draft.body._id}/publish`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(published.status).toBe(200)

        const browsed = await request(app)
            .get(`/api/v1/jobs?search=updated&category=${masterData.category._id}&skills=${masterData.skill._id}&budgetMin=300&budgetMax=600&daysAgo=1&sort=budget_high&page=-2&limit=500`)

        expect(browsed.status).toBe(200)
        expect(browsed.body.page).toBe(1)
        expect(browsed.body.limit).toBe(50)
        expect(browsed.body.jobs).toHaveLength(1)

        const closed = await request(app)
            .post(`/api/v1/jobs/${draft.body._id}/close`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(closed.status).toBe(200)

        const reopened = await request(app)
            .post(`/api/v1/jobs/${draft.body._id}/reopen`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(reopened.status).toBe(200)

        const myJobs = await request(app)
            .get("/api/v1/jobs/mine?status=open&limit=500")
            .set("Authorization", `Bearer ${client.token}`)

        expect(myJobs.status).toBe(200)
        expect(myJobs.body.counts.open).toBe(1)
        expect(myJobs.body.limit).toBe(50)

        const disposableDraft = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                title: "Disposable draft job",
                description: "This draft exists only to verify the delete endpoint.",
                category: masterData.category._id.toString(),
                skills: [masterData.skill._id.toString()],
                budgetType: "fixed",
                budgetMin: 100,
                budgetMax: 150,
                status: "draft"
            })

        const deleted = await request(app)
            .delete(`/api/v1/jobs/${disposableDraft.body._id}`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(deleted.status).toBe(200)
    })
})

describe("proposal management API", () => {
    test("lists, edits, withdraws, shortlists and declines proposals", async () => {
        const masterData = await createMasterData()
        const client = await register("proposalclient", "client")
        const freelancerOne = await register("proposalone", "freelancer")
        const freelancerTwo = await register("proposaltwo", "freelancer")

        await saveFreelancerProfile(freelancerOne.token, masterData.skill)
        await saveFreelancerProfile(freelancerTwo.token, masterData.skill)

        const jobResponse = await createOpenJob(client.token, masterData.category, masterData.skill)

        const proposalOne = await request(app)
            .post(`/api/v1/jobs/${jobResponse.body._id}/proposals`)
            .set("Authorization", `Bearer ${freelancerOne.token}`)
            .send({
                coverLetter: "I can build this gaming community website reliably.",
                amount: 600,
                deliveryDays: 14
            })

        const proposalTwo = await request(app)
            .post(`/api/v1/jobs/${jobResponse.body._id}/proposals`)
            .set("Authorization", `Bearer ${freelancerTwo.token}`)
            .send({
                coverLetter: "I can create the requested website with responsive pages.",
                amount: 650,
                deliveryDays: 12
            })

        expect(proposalOne.status).toBe(201)
        expect(proposalTwo.status).toBe(201)

        const updated = await request(app)
            .patch(`/api/v1/proposals/${proposalOne.body._id}`)
            .set("Authorization", `Bearer ${freelancerOne.token}`)
            .send({
                coverLetter: "I can build and thoroughly test this gaming community website.",
                amount: 575
            })

        expect(updated.status).toBe(200)
        expect(updated.body.amount).toBe(575)

        const mine = await request(app)
            .get("/api/v1/proposals/mine?limit=500")
            .set("Authorization", `Bearer ${freelancerOne.token}`)

        expect(mine.status).toBe(200)
        expect(mine.body.proposals).toHaveLength(1)
        expect(mine.body.limit).toBe(50)

        const jobProposals = await request(app)
            .get(`/api/v1/jobs/${jobResponse.body._id}/proposals`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(jobProposals.status).toBe(200)
        expect(jobProposals.body.proposals).toHaveLength(2)

        const withdrawn = await request(app)
            .post(`/api/v1/proposals/${proposalOne.body._id}/withdraw`)
            .set("Authorization", `Bearer ${freelancerOne.token}`)

        expect(withdrawn.status).toBe(200)
        expect(withdrawn.body.status).toBe("withdrawn")

        const shortlisted = await request(app)
            .post(`/api/v1/proposals/${proposalTwo.body._id}/shortlist`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(shortlisted.status).toBe(200)
        expect(shortlisted.body.status).toBe("shortlisted")

        const declined = await request(app)
            .post(`/api/v1/proposals/${proposalTwo.body._id}/decline`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(declined.status).toBe(200)
        expect(declined.body.status).toBe("declined")
    })
})

describe("contract workspace and reviews API", () => {
    test("adds and edits milestones, requests revisions, messages, cancels and reviews", async () => {
        const masterData = await createMasterData()
        const client = await register("workspaceclient", "client")
        const freelancer = await register("workspacefreelancer", "freelancer")

        await saveClientProfile(client.token)
        await saveFreelancerProfile(freelancer.token, masterData.skill)

        const jobResponse = await createOpenJob(client.token, masterData.category, masterData.skill)
        const proposalResponse = await request(app)
            .post(`/api/v1/jobs/${jobResponse.body._id}/proposals`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                coverLetter: "I can build the complete gaming marketplace website.",
                amount: 200,
                deliveryDays: 10
            })

        const accepted = await request(app)
            .post(`/api/v1/proposals/${proposalResponse.body._id}/accept`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                milestones: [
                    {
                        title: "Marketplace foundation",
                        description: "Build the main marketplace pages.",
                        amount: 200
                    }
                ]
            })

        expect(accepted.status).toBe(200)

        const contractId = accepted.body._id
        const firstMilestoneId = accepted.body.milestones[0]._id

        const addedMilestone = await request(app)
            .post(`/api/v1/contracts/${contractId}/milestones`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                title: "Final polish",
                description: "Polish the final responsive pages.",
                amount: 100
            })

        expect(addedMilestone.status).toBe(201)

        const secondMilestoneId = addedMilestone.body.milestones[1]._id

        const updatedMilestone = await request(app)
            .patch(`/api/v1/contracts/${contractId}/milestones/${secondMilestoneId}`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                title: "Final responsive polish",
                amount: 120
            })

        expect(updatedMilestone.status).toBe(200)

        const deposit = await request(app)
            .post("/api/v1/wallet/deposit")
            .set("Authorization", `Bearer ${client.token}`)
            .set("Idempotency-Key", "workspace-deposit")
            .send({
                amount: 500,
                card: {
                    number: "4242424242424242",
                    exp: "12/30",
                    cvc: "123"
                }
            })

        expect(deposit.status).toBe(200)

        const funded = await request(app)
            .post(`/api/v1/contracts/${contractId}/milestones/${firstMilestoneId}/fund`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(funded.status).toBe(200)

        const delivered = await request(app)
            .post(`/api/v1/contracts/${contractId}/milestones/${firstMilestoneId}/deliver`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({message: "The first version is ready for review."})

        expect(delivered.status).toBe(200)

        const revision = await request(app)
            .post(`/api/v1/contracts/${contractId}/milestones/${firstMilestoneId}/request-revision`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({note: "Please improve the mobile navigation."})

        expect(revision.status).toBe(200)

        const redelivered = await request(app)
            .post(`/api/v1/contracts/${contractId}/milestones/${firstMilestoneId}/deliver`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({message: "The mobile navigation has been improved."})

        expect(redelivered.status).toBe(200)

        const message = await request(app)
            .post(`/api/v1/contracts/${contractId}/messages`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({text: "Thanks, I will review the new delivery."})

        expect(message.status).toBe(201)

        const workspace = await request(app)
            .get(`/api/v1/contracts/${contractId}`)
            .set("Authorization", `Bearer ${client.token}`)

        expect(workspace.status).toBe(200)
        expect(workspace.body.messages).toHaveLength(1)
        expect(workspace.body.moneySummary.inEscrow).toBe(200)

        const contracts = await request(app)
            .get("/api/v1/contracts?limit=500")
            .set("Authorization", `Bearer ${freelancer.token}`)

        expect(contracts.status).toBe(200)
        expect(contracts.body.contracts).toHaveLength(1)
        expect(contracts.body.limit).toBe(50)

        const cancelled = await request(app)
            .post(`/api/v1/contracts/${contractId}/cancel`)
            .set("Authorization", `Bearer ${freelancer.token}`)

        expect(cancelled.status).toBe(200)
        expect(cancelled.body.status).toBe("cancelled")

        const clientReview = await request(app)
            .post(`/api/v1/contracts/${contractId}/reviews`)
            .set("Authorization", `Bearer ${client.token}`)
            .send({
                rating: 5,
                comment: "Strong communication and responsive work."
            })

        const freelancerReview = await request(app)
            .post(`/api/v1/contracts/${contractId}/reviews`)
            .set("Authorization", `Bearer ${freelancer.token}`)
            .send({
                rating: 4,
                comment: "Clear feedback and a smooth project experience."
            })

        expect(clientReview.status).toBe(201)
        expect(freelancerReview.status).toBe(201)

        const freelancerUser = await User.findOne({username: "workspacefreelancer"})
        const reviews = await request(app)
            .get(`/api/v1/users/${freelancerUser._id}/reviews?limit=500`)

        expect(reviews.status).toBe(200)
        expect(reviews.body.reviews).toHaveLength(1)
        expect(reviews.body.limit).toBe(50)
    })
})

describe("admin, master data and error APIs", () => {
    test("manages users, categories and skills with admin authorization", async () => {
        const password = bcrypt.hashSync("Admin123!", 10)
        await User.create({
            username: "testadmin",
            email: "testadmin@gcctalent.test",
            password: password,
            role: "admin",
            status: "active",
            isVerified: true
        })

        const login = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "testadmin@gcctalent.test",
                password: "Admin123!"
            })

        const adminToken = login.body.accessToken
        const client = await register("adminmanagedclient", "client")
        const clientUser = await User.findOne({username: "adminmanagedclient"})

        const category = await request(app)
            .post("/api/v1/admin/categories")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Game Development",
                slug: "game-development",
                icon: "gamepad",
                isFeatured: true
            })

        expect(category.status).toBe(201)

        const updatedCategory = await request(app)
            .patch(`/api/v1/admin/categories/${category.body._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({name: "Games Development"})

        expect(updatedCategory.status).toBe(200)

        const skill = await request(app)
            .post("/api/v1/admin/skills")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Unity",
                slug: "unity",
                category: category.body._id
            })

        expect(skill.status).toBe(201)

        const updatedSkill = await request(app)
            .patch(`/api/v1/admin/skills/${skill.body._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({name: "Unity Development"})

        expect(updatedSkill.status).toBe(200)

        const categories = await request(app).get("/api/v1/categories")
        const skills = await request(app).get("/api/v1/skills")

        expect(categories.status).toBe(200)
        expect(skills.status).toBe(200)

        const users = await request(app)
            .get("/api/v1/admin/users?role=client&limit=500")
            .set("Authorization", `Bearer ${adminToken}`)

        expect(users.status).toBe(200)
        expect(users.body.users).toHaveLength(1)
        expect(users.body.limit).toBe(50)

        const allUsers = await request(app)
            .get("/api/v1/users?limit=500")
            .set("Authorization", `Bearer ${adminToken}`)

        expect(allUsers.status).toBe(200)

        const userDetails = await request(app)
            .get(`/api/v1/admin/users/${clientUser._id}`)
            .set("Authorization", `Bearer ${adminToken}`)

        expect(userDetails.status).toBe(200)
        expect(userDetails.body.user.password).toBeUndefined()

        const verified = await request(app)
            .patch(`/api/v1/admin/users/${clientUser._id}/verify`)
            .set("Authorization", `Bearer ${adminToken}`)

        expect(verified.status).toBe(200)

        const suspended = await request(app)
            .patch(`/api/v1/admin/users/${clientUser._id}/status`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({status: "suspended"})

        expect(suspended.status).toBe(200)

        const stats = await request(app)
            .get("/api/v1/admin/stats")
            .set("Authorization", `Bearer ${adminToken}`)

        expect(stats.status).toBe(200)
        expect(stats.body.users.admins).toBe(1)

        const forbiddenAdmin = await request(app)
            .get("/api/v1/admin/stats")
            .set("Authorization", `Bearer ${client.token}`)

        expect(forbiddenAdmin.status).toBe(403)

        const invalidId = await request(app)
            .get("/api/v1/admin/users/not-an-id")
            .set("Authorization", `Bearer ${adminToken}`)

        expect(invalidId.status).toBe(400)

        const validationError = await request(app)
            .post("/api/v1/auth/register")
            .send({email: "not-an-email"})

        expect(validationError.status).toBe(400)

        const missingRoute = await request(app).get("/api/v1/missing-route")

        expect(missingRoute.status).toBe(404)
        expect(missingRoute.body.message).toBe("Route not found")

        const deletedSkill = await request(app)
            .delete(`/api/v1/admin/skills/${skill.body._id}`)
            .set("Authorization", `Bearer ${adminToken}`)

        const deletedCategory = await request(app)
            .delete(`/api/v1/admin/categories/${category.body._id}`)
            .set("Authorization", `Bearer ${adminToken}`)

        const deletedUser = await request(app)
            .delete(`/api/v1/admin/users/${clientUser._id}`)
            .set("Authorization", `Bearer ${adminToken}`)

        expect(deletedSkill.status).toBe(200)
        expect(deletedCategory.status).toBe(200)
        expect(deletedUser.status).toBe(200)

        expect(await ClientProfile.countDocuments()).toBe(0)
        expect(await Proposal.countDocuments()).toBe(0)
    })
})
