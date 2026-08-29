const mongoose = require('mongoose')
const Contract = require('../models/contract')
const User = require('../models/user')
const Transaction = require('../models/transaction')
const FreelancerProfile = require('../models/freelancerProfile')

const index = async (req, res) => {
    try {
        const filter = {}
        
        if (req.user.role === "client") {
            filter.client = req.user._id
        } else if (req.user.role === "freelancer") {
            filter.freelancer = req.user._id
        } else if (req.user.role !== "admin") {
            return res.status(403).json({message: "You cannot view contracts"})
        }
        
        if (req.query.status) {
            filter.status = req.query.status
        }

        const contracts = await Contract.find(filter)
        
        res.status(200).json(contracts)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const show = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
        
        if (!contract) {
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.client.toString() !== req.user._id.toString() && contract.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You cannot view this contract"})
        }
        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const addMilestone = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
        if (!contract) {
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You cannot add a milestone to this contract"})
        }
        if (contract.status !== 'active') {
            return res.status(400).json({message: "Milestones can only be added to active contracts"})
        }
        
        const milestoneAmount = Number(req.body.amount)

        if (!milestoneAmount || milestoneAmount <= 0) {
            return res.status(400).json({message: "Milestone amount must be greater than zero"})
        }
        contract.totalAmount = contract.totalAmount + milestoneAmount

        contract.milestones.push({
            title: req.body.title,
            description: req.body.description,
            amount: milestoneAmount,
            dueDate: req.body.dueDate
        })

        contract.activity.push({
            type: 'milestone_added',
            by: req.user._id,
            message: `Milestone added: ${req.body.title}`
        })

        await contract.save()
        
        res.status(201).json(contract)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateMilestone = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
        if (!contract) {
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You cannot update this milestone"})
        }
        if (contract.status !== "active") {
            return res.status(400).json({message: "Milestones can only be updated on active contracts"})
        }
        
        const milestone = contract.milestones.id(req.params.mid)
        
        if (!milestone) {
            return res.status(404).json({message: "Milestone not found"})
        }

        if (milestone.status !== 'pending') {
            return res.status(400).json({message: "Only unfunded milestones can be updated"})
        }

        if (req.body.title !== undefined) {
            milestone.title = req.body.title
        }

        if (req.body.description !== undefined) {
            milestone.description = req.body.description
        }
        if (req.body.amount !== undefined) {
            const newAmount = Number(req.body.amount)
            
            if (!newAmount || newAmount <= 0) {
                return res.status(400).json({message: "Milestone amount must be greater than zero"})
            }
            contract.totalAmount = contract.totalAmount - milestone.amount + newAmount
            milestone.amount = newAmount
        }

        if (req.body.dueDate !== undefined) {
            milestone.dueDate = req.body.dueDate
        }

        contract.activity.push({
            type: 'milestone_updated',
            by: req.user._id,
            message: `Milestone updated: ${milestone.title}`
        })

        await contract.save()
        
        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const fundMilestone = async (req, res) => {
    const session = await mongoose.startSession()

    try {
        session.startTransaction()
        
        const contract = await Contract.findById(req.params.id).session(session)
        if (!contract) {
            await session.abortTransaction()
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.client.toString() !== req.user._id.toString()) {
            await session.abortTransaction()
            return res.status(403).json({message: "You cannot fund this milestone"})
        }

        const milestone = contract.milestones.id(req.params.mid)

        if (!milestone) {
            await session.abortTransaction()
            return res.status(404).json({message: "Milestone not found"})
        }

        if (milestone.status !== "pending") {
            await session.abortTransaction()
            return res.status(400).json({message: "This milestone cannot be funded"})
        }

        const client = await User.findById(req.user._id).session(session)

        if (client.wallet.available < milestone.amount) {
            await session.abortTransaction()
            return res.status(422).json({message: "Insufficient wallet balance"})
        }

        client.wallet.available = client.wallet.available - milestone.amount
        client.wallet.pending = client.wallet.pending + milestone.amount

        milestone.status = "funded"
        milestone.escrowAmount = milestone.amount
        milestone.fundedAt = new Date()

        contract.activity.push({
            type: "milestone_funded",
            by: req.user._id,
            message: `Milestone funded: ${milestone.title}`
        })

        await Transaction.create([{
            user: client._id,
            type: 'escrow_fund',
            amount: milestone.amount,
            direction: 'debit',
            balanceAfter: client.wallet.available,
            contract: contract._id,
            milestoneId: milestone._id,
            reference: `escrow-fund-${contract._id}-${milestone._id}`,
            status: 'completed'
        }], {session})

        await client.save({session})
        await contract.save({session})
        await session.commitTransaction()

        res.status(200).json(contract)
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction()
        }

        res.status(500).json({message: error.message})
    } finally {
        await session.endSession()
    }
}
const deliverMilestone = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
        
        if (!contract) {
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You cannot deliver this milestone"})
        }
        if (contract.status !== "active") {
            return res.status(400).json({message: "This contract is not active"})
        }

        const milestone = contract.milestones.id(req.params.mid)

        if (!milestone) {
            return res.status(404).json({message: "Milestone not found"})
        }

        if (milestone.status !== "funded" && milestone.status !== "in_progress") {
            return res.status(400).json({message: "This milestone cannot be delivered"})
        }

        let attachments

        if (req.body.attachments) {
            attachments = req.body.attachments
        } else {
            attachments = []
        }

        milestone.deliveries.push({
            message: req.body.message,
            attachments: attachments,
            submittedAt: new Date()
        })
            
        milestone.status = "delivered"
        milestone.deliveredAt = new Date()

        contract.activity.push({
            type: "milestone_delivered",
            by: req.user._id,
            message: `Milestone delivered: ${milestone.title}`
        })

        await contract.save()
        
        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const approveMilestone = async (req, res) => {
    const session = await mongoose.startSession()
    
    try {
        session.startTransaction()

        const contract = await Contract.findById(req.params.id).session(session)

        if (!contract) {
            await session.abortTransaction()
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.client.toString() !== req.user._id.toString()) {
            await session.abortTransaction()
            return res.status(403).json({message: "You cannot approve this milestone"})
        }
        
        const milestone = contract.milestones.id(req.params.mid)
        
        if (!milestone) {
            await session.abortTransaction()
            return res.status(404).json({message: "Milestone not found"})
        }
        if (milestone.status !== "delivered") {
            await session.abortTransaction()
            return res.status(400).json({message: "This milestone cannot be approved"})
        }

        const client = await User.findById(contract.client).session(session)
        const freelancer = await User.findById(contract.freelancer).session(session)
                
        const freelancerProfile = await FreelancerProfile.findOne({user: contract.freelancer}).session(session)
        
        if (!freelancerProfile) {
            await session.abortTransaction()
            return res.status(404).json({message: "Freelancer profile not found"})
        }
        const escrowAmount = milestone.escrowAmount
        const feePercentage = Number(process.env.PLATFORM_FEE_PCT) || 10

        const platformFee = Math.round((escrowAmount * feePercentage / 100) * 100) / 100

        freelancerProfile.totalEarned = Math.round((freelancerProfile.totalEarned + escrowAmount - platformFee)*100)/100
    
        const freelancerBalanceAfterRelease = Math.round((freelancer.wallet.available + escrowAmount) * 100)/100
        const freelancerBalanceAfterFee = Math.round((freelancerBalanceAfterRelease - platformFee) * 100)/100

        if (client.wallet.pending < escrowAmount) {
            await session.abortTransaction()
            return res.status(422).json({message: "Invalid escrow balance"})
        }

        client.wallet.pending = Math.round((client.wallet.pending - escrowAmount) * 100)/100
        freelancer.wallet.available = freelancerBalanceAfterFee

        const latestDelivery = milestone.deliveries[milestone.deliveries.length - 1]

        latestDelivery.response = "approved"
        latestDelivery.respondedAt = new Date()
        milestone.status = "approved"
        milestone.escrowAmount = 0
        milestone.approvedAt = new Date()
        
        contract.activity.push({
            type: "milestone_approved",
            by: req.user._id,
            message: `Milestone approved: ${milestone.title}`
        })

        let allMilestonesApproved = true

        for (let i = 0; i < contract.milestones.length; i++) {
            if (contract.milestones[i].status !== "approved") {
                allMilestonesApproved = false
                break
            }
        }
        
        if (allMilestonesApproved) {
            contract.status = "completed"
            contract.completedAt = new Date()
            freelancerProfile.completedContracts = freelancerProfile.completedContracts + 1
        }

        await Transaction.create([
            {
                user: freelancer._id,
                type: "escrow_release",
                amount: escrowAmount,
                direction: "credit",
                balanceAfter: freelancerBalanceAfterRelease,
                contract: contract._id,
                milestoneId: milestone._id,
                reference: `escrow-release-${contract._id}-${milestone._id}`,
                status: "completed"
            },
            {
                user: freelancer._id,
                type: "platform_fee",
                amount: platformFee,
                direction: "debit",
                balanceAfter: freelancerBalanceAfterFee,
                contract: contract._id,
                milestoneId: milestone._id,
                reference: `platform-fee-${contract._id}-${milestone._id}`,
                status: "completed"
            }
        ], {session})

        await client.save({session})
        await freelancer.save({session})
        await freelancerProfile.save({session})
        await contract.save({session})
        await session.commitTransaction()
        
        res.status(200).json(contract)
    } catch (error) {
        
        if (session.inTransaction()) {
            await session.abortTransaction()
        }
        
        res.status(500).json({message: error.message})
    } finally {
        await session.endSession()
    }
}

const requestRevision = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
        
        if (!contract) {
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You cannot request a revision"})
        }
        if (contract.status !== "active") {
            return res.status(400).json({message: "This contract is not active"})
        }
        
        const milestone = contract.milestones.id(req.params.mid)

        if (!milestone) {
            return res.status(404).json({message: "Milestone not found"})
        }
        if (milestone.status !== "delivered") {
            return res.status(400).json({message: "A revision can only be requested after delivery"})
        }
        if (!req.body.note) {
            return res.status(400).json({message: "Revision comments are required"})
        }
        
        const latestDelivery = milestone.deliveries[milestone.deliveries.length - 1]

        latestDelivery.response = "revision"
        latestDelivery.responseNote = req.body.note
        latestDelivery.respondedAt = new Date()
        milestone.status = "in_progress"

        contract.activity.push({
            type: "milestone_revision",
            by: req.user._id,
            message: `Revision requested: ${milestone.title}`
        })

        await contract.save()
        
        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const cancelContract = async (req, res) => {
    const session = await mongoose.startSession()
    
    try {
        session.startTransaction()
        const contract = await Contract.findById(req.params.id).session(session)

        if (!contract) {
            await session.abortTransaction()
            return res.status(404).json({message: "Contract not found"})
        }
        if (contract.client.toString() !== req.user._id.toString() && contract.freelancer.toString() !== req.user._id.toString()) {
            await session.abortTransaction()
            return res.status(403).json({message: "You cannot cancel this contract"})
        }
        if (contract.status !== "active") {
            await session.abortTransaction()
            return res.status(400).json({message: "This contract cannot be cancelled"})
        }
        
        const client = await User.findById(contract.client).session(session)
        const refundTransactions = []
        
        for (let i = 0; i < contract.milestones.length; i++) {
            const milestone = contract.milestones[i]
            
            if (milestone.escrowAmount > 0 && milestone.status !== "approved") {
                
                const refundAmount = milestone.escrowAmount
                
                if (client.wallet.pending < refundAmount) {
                    await session.abortTransaction()
                    return res.status(422).json({message: "Invalid escrow balance"})
                }
                client.wallet.pending = Math.round((client.wallet.pending - refundAmount) * 100) /100
                client.wallet.available = Math.round((client.wallet.available + refundAmount) * 100)/100
                
                refundTransactions.push({
                    user: client._id,
                    type: "escrow_refund",
                    amount: refundAmount,
                    direction: "credit",
                    balanceAfter: client.wallet.available,
                    contract: contract._id,
                    milestoneId: milestone._id,
                    reference: `escrow-refund-${contract._id}-${milestone._id}`,
                    status: "completed"
                })
                
                milestone.escrowAmount = 0
                milestone.status = "refunded"
            } else if (
                milestone.status !== "approved" &&
                milestone.status !== "refunded"
            ) {
                milestone.status = "cancelled"
            }
        }
        
        contract.status = "cancelled"
        
        contract.activity.push({
            type: "contract_cancelled",
            by: req.user._id,
            message: "Contract cancelled"
        })
        
        if (refundTransactions.length > 0) {
            await Transaction.create(refundTransactions, {session})
        }
        await client.save({session})
        await contract.save({session})
        await session.commitTransaction()
        
        res.status(200).json(contract)
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction()
        }
        
        res.status(500).json({message: error.message})
    } finally {
        await session.endSession()
    }
}

module.exports = {
    index,
    show,
    addMilestone,
    updateMilestone,
    fundMilestone,
    deliverMilestone,
    approveMilestone,
    requestRevision,
    cancelContract
}