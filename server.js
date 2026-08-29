const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const dns = require('node:dns')
const cookieParser = require('cookie-parser')
const multer = require('multer')

const PORT = process.env.PORT ? process.env.PORT : '3000'


dns.setServers(['8.8.8.8', '1.1.1.1'])

// Controllers
const authCtrl = require('./controllers/auth')
const usersCtrl = require('./controllers/users')
const freelancerProfilesCtrl = require('./controllers/freelancerProfiles')
const clientProfileCtrl = require('./controllers/clientProfile')
const jobsCtrl = require('./controllers/jobs')
const proposalsCtrl = require('./controllers/proposals')
const contractsCtrl = require('./controllers/contracts')
const reviewsCtrl = require('./controllers/reviews')
const skillsCtrl = require('./controllers/skills')
const categoriesCtrl = require('./controllers/categories')
const uploadsCtrl = require('./controllers/uploads')
const walletCtrl = require('./controllers/wallet')
const adminCtrl = require('./controllers/admin')

const verifyToken = require('./middleware/verify-token')
const upload = multer({
    storage: multer.memoryStorage()
})
mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}. 🥭`)
})
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())

// auth routes

app.post(
    '/api/v1/auth/register',
    authCtrl.signUp
)

app.post(
    '/api/v1/auth/login',
    authCtrl.signIn
)

app.post(
    '/api/v1/auth/refresh',
    authCtrl.refresh
)

app.post(
    '/api/v1/auth/logout',
    authCtrl.logout
)

// user routes

// get all users
app.get(
    '/api/v1/users',
    verifyToken,
    usersCtrl.index
)

// get currently logged-in user
app.get(
    '/api/v1/users/me',
    verifyToken,
    usersCtrl.showMe
)

// update currently logged-in user
app.patch(
    '/api/v1/users/me',
    verifyToken,
    usersCtrl.updateMe
)

// change password
app.patch(
    '/api/v1/users/me/password',
    verifyToken,
    usersCtrl.changePassword
)

// freelancer profile routes

// get all freelancers
app.get(
    '/api/v1/freelancers',
    freelancerProfilesCtrl.index
)

// get freelancer by ID
app.get(
    '/api/v1/freelancers/:userId',
    freelancerProfilesCtrl.show
)

// create freelancer profile
app.post(
    '/api/v1/freelancers',
    verifyToken,
    freelancerProfilesCtrl.create
)

// update freelancer profile
app.patch(
    '/api/v1/freelancers/:id',
    verifyToken,
    freelancerProfilesCtrl.update
)

// delete freelancer profile
app.delete(
    '/api/v1/freelancers/:id',
    verifyToken,
    freelancerProfilesCtrl.deleteProfile
)

// freelancer portfolio routes

// add portfolio item
app.post(
    '/api/v1/freelancers/:id/portfolio',
    verifyToken,
    freelancerProfilesCtrl.createPortfolioItem
)

// update portfolio item
app.patch(
    '/api/v1/freelancers/:id/portfolio/:portfolioId',
    verifyToken,
    freelancerProfilesCtrl.updatePortfolioItem
)

// delete portfolio item
app.delete(
    '/api/v1/freelancers/:id/portfolio/:portfolioId',
    verifyToken,
    freelancerProfilesCtrl.deletePortfolioItem
)

// client profile routes

// get all clients
app.get(
    '/api/v1/clients',
    clientProfileCtrl.index
)

// get logged in client's profile
app.get(
    '/api/v1/clients/me',
    verifyToken,
    clientProfileCtrl.showMe
)

// create client profile
app.post(
    '/api/v1/clients/me',
    verifyToken,
    clientProfileCtrl.create
)

// update client profile
app.patch(
    '/api/v1/clients/me',
    verifyToken,
    clientProfileCtrl.update
)

// delete client profile
app.delete(
    '/api/v1/clients/me',
    verifyToken,
    clientProfileCtrl.deleteProfile
)

// get client by user ID
app.get(
    '/api/v1/clients/:userId',
    clientProfileCtrl.show
)

// JOB ROUTES

// create job
app.post(
    '/api/v1/jobs',
    verifyToken,
    jobsCtrl.create
)

// get logged-in user's jobs
app.get(
    '/api/v1/jobs/mine',
    verifyToken,
    jobsCtrl.myJobs
)

// get all jobs
app.get(
    '/api/v1/jobs',
    jobsCtrl.allJobs
)

// get one job
app.get(
    '/api/v1/jobs/:jobId',
    jobsCtrl.showJob
)

// update job
app.patch(
    '/api/v1/jobs/:jobId',
    verifyToken,
    jobsCtrl.updateJob
)

// publish job
app.patch(
    '/api/v1/jobs/:jobId/publish',
    verifyToken,
    jobsCtrl.publishJob
)

// close job
app.patch(
    '/api/v1/jobs/:jobId/close',
    verifyToken,
    jobsCtrl.closeJob
)

// reopen job
app.patch(
    '/api/v1/jobs/:jobId/reopen',
    verifyToken,
    jobsCtrl.reopenJob
)

// delete draft job
app.delete(
    '/api/v1/jobs/:jobId',
    verifyToken,
    jobsCtrl.deleteDraft
)

// proposal routes

// create proposal for a job
app.post(
    '/api/v1/jobs/:id/proposals',
    verifyToken,
    proposalsCtrl.create
)

// get proposals for a specific job
app.get(
    '/api/v1/jobs/:id/proposals',
    verifyToken,
    proposalsCtrl.jobProposals
)

// get logged-in freelancer's proposals
app.get(
    '/api/v1/proposals/me',
    verifyToken,
    proposalsCtrl.freelancerProposals
)

// update proposal
app.patch(
    '/api/v1/proposals/:id',
    verifyToken,
    proposalsCtrl.update
)

// withdraw proposal
app.patch(
    '/api/v1/proposals/:id/withdraw',
    verifyToken,
    proposalsCtrl.withdraw
)

// shortlist proposal
app.patch(
    '/api/v1/proposals/:id/shortlist',
    verifyToken,
    proposalsCtrl.shortlist
)

// decline proposal
app.patch(
    '/api/v1/proposals/:id/decline',
    verifyToken,
    proposalsCtrl.decline
)

// accept proposal
app.patch(
    '/api/v1/proposals/:id/accept',
    verifyToken,
    proposalsCtrl.accept
)

// contract routes

// get user's contracts
app.get(
    '/api/v1/contracts',
    verifyToken,
    contractsCtrl.index
)

// get one contract
app.get(
    '/api/v1/contracts/:id',
    verifyToken,
    contractsCtrl.show
)

// add milestone
app.post(
    '/api/v1/contracts/:id/milestones',
    verifyToken,
    contractsCtrl.addMilestone
)

// update milestone
app.patch(
    '/api/v1/contracts/:id/milestones/:mid',
    verifyToken,
    contractsCtrl.updateMilestone
)

// fund milestone
app.patch(
    '/api/v1/contracts/:id/milestones/:mid/fund',
    verifyToken,
    contractsCtrl.fundMilestone
)

// deliver milestone
app.patch(
    '/api/v1/contracts/:id/milestones/:mid/deliver',
    verifyToken,
    contractsCtrl.deliverMilestone
)

// approve milestone
app.patch(
    '/api/v1/contracts/:id/milestones/:mid/approve',
    verifyToken,
    contractsCtrl.approveMilestone
)

// request revision
app.patch(
    '/api/v1/contracts/:id/milestones/:mid/revision',
    verifyToken,
    contractsCtrl.requestRevision
)

// cancel contract
app.patch(
    '/api/v1/contracts/:id/cancel',
    verifyToken,
    contractsCtrl.cancelContract
)


// review routes

// get reviews for a user
app.get(
    '/api/v1/users/:id/reviews',
    reviewsCtrl.index
)

// create review for a contract
app.post(
    '/api/v1/contracts/:id/reviews',
    verifyToken,
    reviewsCtrl.create
)

// skill routes

// get all skills
app.get(
    '/api/v1/skills',
    skillsCtrl.index
)

// create skill
app.post(
    '/api/v1/skills',
    verifyToken,
    skillsCtrl.create
)

// update skill
app.patch(
    '/api/v1/skills/:id',
    verifyToken,
    skillsCtrl.update
)

// delete skill
app.delete(
    '/api/v1/skills/:id',
    verifyToken,
    skillsCtrl.deleteSkill
)

// category routes

// get all categories
app.get(
    '/api/v1/categories',
    categoriesCtrl.index
)

// create category
app.post(
    '/api/v1/categories',
    verifyToken,
    categoriesCtrl.create
)

// update category
app.patch(
    '/api/v1/categories/:id',
    verifyToken,
    categoriesCtrl.update
)

// delete category
app.delete(
    '/api/v1/categories/:id',
    verifyToken,
    categoriesCtrl.deleteCategory
)

// wallet routes

// get logged-in user's wallet and transactions
app.get(
    '/api/v1/wallet',
    verifyToken,
    walletCtrl.index
)

// add funds to wallet
app.post(
    '/api/v1/wallet/deposit',
    verifyToken,
    walletCtrl.deposit
)


// Upload image/file
app.post(
    '/api/v1/uploads',
    verifyToken,
    upload.single('file'),
    uploadsCtrl.upload
)

// ADMIN ROUTES

// platform statistics / dashboard
app.get(
    '/api/v1/admin/stats',
    verifyToken,
    adminCtrl.stats
)

// search / list users
app.get(
    '/api/v1/admin/users',
    verifyToken,
    adminCtrl.index
)

// view one user with contracts and transactions
app.get(
    '/api/v1/admin/users/:id',
    verifyToken,
    adminCtrl.show
)

// change user status: active / suspended
app.patch(
    '/api/v1/admin/users/:id/status',
    verifyToken,
    adminCtrl.updateStatus
)

// verify user
app.patch(
    '/api/v1/admin/users/:id/verify',
    verifyToken,
    adminCtrl.verifyUser
)

// delete user
app.delete(
    '/api/v1/admin/users/:id',
    verifyToken,
    adminCtrl.deleteUser
)

// server
app.listen(PORT, () => {
    console.log(`The express app is ready on port ${PORT}! 💀`)
})