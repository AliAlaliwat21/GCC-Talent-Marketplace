const Contract = require('../models/contract')

const index = async (req, res) => {
    try {
        let contracts
        
        if (req.user.role === 'client') {
            contracts = await Contract.find({client: req.user._id})
        }
        if (req.user.role === 'freelancer') {
            contracts = await Contract.find({freelancer: req.user._id})
        }
        
        res.status(200).json(contracts)
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
}

module.exports = {
    index
}