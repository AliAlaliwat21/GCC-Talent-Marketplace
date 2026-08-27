const User = require('../models/user')
const Job = require('../models/job')
const Contract = require('../models/contract')
const Transaction = require('../models/transaction')

const index = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can view users"})
        }
        const filter = {}
        if (req.query.username) {
            filter.username = req.query.username
        }
        if (req.query.email) {
            filter.email = req.query.email
        }
        if (req.query.role) {
            filter.role = req.query.role
        }
        if (req.query.status) {
            filter.status = req.query.status
        }
        
        const users = await User.find(filter)
        
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const show = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can view user details"})
        }
        const user = await User.findById(req.params.id)
        
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        const clientContracts = await Contract.find({client: user._id})
        const freelancerContracts = await Contract.find({freelancer: user._id})
        const transactions = await Transaction.find({user: user._id})
        
        res.status(200).json({
            user: user,
            contracts: {
                asClient: clientContracts,
                asFreelancer: freelancerContracts
            },
            transactions: transactions
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can change account status"})
        }
        if (req.body.status !== "active" && req.body.status !== "suspended") {
            return res.status(400).json({
                message: "Status must be active or suspended"
            })
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id,
            {
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        )
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found"})
        }
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
const stats = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can view platform statistics"})
        }
        const users = await User.find()
        const jobs = await Job.find({status: "open"})
        const contracts = await Contract.find({status: "active"})
        const releaseTransactions = await Transaction.find({type: "escrow_release", status: "completed"})
        const feeTransactions = await Transaction.find({type: "platform_fee", status: "completed"})

        let totalClients = 0
        let totalFreelancers = 0
        let totalAdmins = 0
        let newSignups7Days = 0
        let newSignups30Days = 0

        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        
        for (let i = 0; i < users.length; i++) {
            if (users[i].role === "client") {
                totalClients = totalClients + 1
            }
            if (users[i].role === "freelancer") {
                totalFreelancers = totalFreelancers + 1
            }

            if (users[i].role === "admin") {
                totalAdmins = totalAdmins + 1
            }

            if (users[i].createdAt.getTime() >= sevenDaysAgo) {
                newSignups7Days = newSignups7Days + 1
            }

            if (users[i].createdAt.getTime() >= thirtyDaysAgo) {
                newSignups30Days = newSignups30Days + 1
            }
        }
        
        let gmv = 0
        for (let i = 0; i < releaseTransactions.length; i++) {
            gmv = gmv + releaseTransactions[i].amount
        }

        let platformRevenue = 0
        for (let i = 0; i < feeTransactions.length; i++) {
            platformRevenue = platformRevenue + feeTransactions[i].amount
        }
        res.status(200).json({
            users: {
                clients: totalClients,
                freelancers: totalFreelancers,
                admins: totalAdmins
            },
            newSignups: {
                last7Days: newSignups7Days,
                last30Days: newSignups30Days
            },
            openJobs: jobs.length,
            activeContracts: contracts.length,
            gmv: gmv,
            platformRevenue: platformRevenue
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const verifyUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can verify users"})
        }
        const verifiedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: true
            },
            {
                new: true,
                runValidators: true
            })
            if (!verifiedUser) {
                return res.status(404).json({message: "User not found"})
            }
            
            res.status(200).json({message: "User verified successfully", user: verifiedUser})
        } catch (error) {
            res.status(500).json({message: error.message})
    }
}

const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({message: "Only admins can delete users"})
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        
        if (!deletedUser) {
            return res.status(404).json({message: "User not found"})
        }
        res.status(200).json({message: "User deleted successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    index,
    show,
    updateStatus,
    stats,
    verifyUser,
    deleteUser
}