const mongoose = require('mongoose')
const Contract = require('../models/contract')
const User = require('../models/user')
const Transaction = require('../models/transaction')

const index = async (req, res) => {
    try {
        let contracts
        
        if (req.user.role === "client") {
            contracts = await Contract.find({client: req.user._id})
        }
        if (req.user.role === "freelancer") {
            contracts = await Contract.find({freelancer: req.user._id})
        }
        
        res.status(200).json(contracts)
    } catch (error) {
        res.status(500).json({ message: error.message})
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
        contract.milestones.push({
            title: req.body.title,
            description: req.body.description,
            amount: req.body.amount,
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
        
        const milestone = contract.milestones.id(req.params.mid)
        
        if (!milestone) {
            return res.status(404).json({message: "Milestone not found"})
        }

        if (milestone.status !== 'pending') {
            return res.status(400).json({
                message: "Only unfunded milestones can be updated"
            })
        }

        if (req.body.title !== undefined) {
            milestone.title = req.body.title
        }

        if (req.body.description !== undefined) {
            milestone.description = req.body.description
        }

        if (req.body.amount !== undefined) {
            milestone.amount = req.body.amount
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

module.exports = {
    index,
    show,
    addMilestone,
    updateMilestone,
    fundMilestone,
    deliverMilestone,
}