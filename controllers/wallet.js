const User = require('../models/user')
const Transaction = require('../models/transaction')

const index = async(req, res) => {
    try {
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        const transaction = await Transaction.find({user: req.user._id})
        res.status(200).json({wallet: user.wallet, transactions: transactions})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    index
}