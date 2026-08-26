const Contract = require('../models/contract')

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

module.exports = {
    index,
    show,
    addMilestone,
}