const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const dns = require("node:dns");
// DNS workaround for MongoDB Atlas.
// Remove these two lines if your regular DNS works correctly.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT ? process.env.PORT : "3000"

const authCtrl = require('./controllers/auth')
const usersCtrl = require('./controllers/users')
const freelancerProfilesCtrl = require('./controllers/freelancerProfiles')
const clientProfileCtrl = require('./controllers/clientProfile')

const verifyToken = require('./middleware/verify-token')

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}. 🥭`)
})

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())



// Routes go here
// app.get('/auth/sign-token', authCtrl.signToken)
// app.get('/auth/verify-token', authCtrl.verifyToken)

//auth routes
app.post('/api/v1/auth/register', authCtrl.signUp)
app.post('/api/v1/auth/sign-in', authCtrl.signIn)
app.post('/api/v1/auth/refresh', authCtrl.refresh)
app.post('/api/v1/auth/logout', authCtrl.logout)

//user routes
app.get('/api/v1/users', verifyToken, usersCtrl.index)
app.get('/api/v1/users/me', verifyToken, usersCtrl.showMe)
app.patch('/api/v1/users/me', verifyToken, usersCtrl.updateMe)
app.patch('/api/v1/users/me/password', verifyToken, usersCtrl.changePassword)


// freelancer profile routes
app.get('/api/v1/freelancers', freelancerProfilesCtrl.index)
app.get('/api/v1/freelancers/:id', freelancerProfilesCtrl.show)
app.post('/api/v1/freelancers', verifyToken, freelancerProfilesCtrl.create)
app.patch('/api/v1/freelancers/:id', verifyToken, freelancerProfilesCtrl.update)
app.delete('/api/v1/freelancers/:id', verifyToken, freelancerProfilesCtrl.deleteProfile)


// freelancer portfolio routes
app.post('/api/v1/freelancers/:id/portfolio', verifyToken, freelancerProfilesCtrl.createPortfolioItem)
app.patch('/api/v1/freelancers/:id/portfolio/:portfolioId', verifyToken, freelancerProfilesCtrl.updatePortfolioItem)
app.delete('/api/v1/freelancers/:id/portfolio/:portfolioId', verifyToken, freelancerProfilesCtrl.deletePortfolioItem)

//client profile routes
app.get('/api/v1/clients/me',clientProfileCtrl.index)
app.get('/api/v1/clients/me', verifyToken, clientProfileCtrl.update)
app.post('/api/v1/clients/me', verifyToken, clientProfileCtrl.create)
app.patch('/api/v1/clients/me', verifyToken, clientProfileCtrl.update)
app.delete('/api/v1/clients/me', verifyToken, clientProfileCtrl.deleteProfile)
app.get('/api/v1/clients/:userId', verifyToken, clientProfileCtrl.show)


//server
app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}! 💀`)
})
