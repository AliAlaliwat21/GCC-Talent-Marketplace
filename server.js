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
const PORT = process.env.PORT ? process.env.PORT : "3000"

const authCtrl = require('./controllers/auth')
const usersCtrl = require('./controllers/users')
const freelancerProfilesCtrl = require('./controllers/freelancerProfiles')

const verifyToken = require('./middleware/verify-token')

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}. 🥭`)
})

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes go here
// app.get('/auth/sign-token', authCtrl.signToken)
// app.get('/auth/verify-token', authCtrl.verifyToken)
app.post('/api/v1/auth/register', authCtrl.signUp)
app.post('/api/v1/auth/sign-in', authCtrl.signIn)


app.get('/users', verifyToken, usersCtrl.index)
app.get('/users/me', verifyToken, usersCtrl.showMe)
app.patch('/users/me', verifyToken, usersCtrl.updateMe)
app.patch('/users/me/password', verifyToken, usersCtrl.changePassword)
app.get('/freelancers', freelancerProfilesCtrl.index)
app.get('/freelancers/:id', freelancerProfilesCtrl.show)
app.post('/freelancers', verifyToken, freelancerProfilesCtrl.create)
app.patch('/freelancers/:id', verifyToken, freelancerProfilesCtrl.update)
app.post('/freelancers/:id/portfolio', verifyToken, freelancerProfilesCtrl.createPortfolioItem)
app.patch('/freelancers/:id/portfolio/:portfolioId', verifyToken, freelancerProfilesCtrl.updatePortfolioItem)
app.delete('/freelancers/:id/portfolio/:portfolioId', verifyToken, freelancerProfilesCtrl.deletePortfolioItem)

app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}! 😀`)
})
