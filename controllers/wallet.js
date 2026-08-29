const mongoose = require('mongoose')
const User = require('../models/user')
const Transaction = require('../models/transaction')
const getPagination = require("../utils/pagination")
const {roundMoney} = require("../services/wallet")

const index = async(req, res) => {
    try {
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        const pagination = getPagination(req.query)
        const transactions = await Transaction.find({user: req.user._id})
            .sort({createdAt: -1})
            .skip(pagination.skip)
            .limit(pagination.limit)

        const total = await Transaction.countDocuments({user: req.user._id})

        res.status(200).json({
            wallet: user.wallet,
            transactions: transactions,
            page: pagination.page,
            limit: pagination.limit,
            total: total,
            totalPages: Math.ceil(total / pagination.limit)
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const deposit = async (req, res) => {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        if (req.user.role !== "client") {
            await session.abortTransaction()
            return res.status(403).json({message: "Only clients can add funds"})
        }

        const idempotencyKey = req.headers["idempotency-key"]

        if (!idempotencyKey || idempotencyKey.length > 100) {
            await session.abortTransaction()
            return res.status(400).json({
                message: "A valid Idempotency-Key header is required"
            })
        }
        
        const amount = Number(req.body.amount)
        if (isNaN(amount) || amount <= 0) {
            await session.abortTransaction()
            return res.status(400).json({message: "Amount must be greater than zero"})
        }
        if (!req.body.card || !req.body.card.number || !req.body.card.exp || !req.body.card.cvc) {
            await session.abortTransaction()
            return res.status(400).json({message: "Card details are required"})
        }
        if (req.body.card.number !== "4242424242424242") {
            await session.abortTransaction()
            return res.status(402).json({message: "Payment failed"})
        }
        
        const reference = `deposit-${req.user._id}-${idempotencyKey}`
        const existingTransaction = await Transaction.findOne({
            reference: reference
        }).session(session)

        if (existingTransaction) {
            const existingUser = await User.findById(req.user._id).session(session)
            await session.abortTransaction()

            return res.status(200).json({
                message: "Funds were already added for this request",
                wallet: existingUser.wallet,
                transaction: existingTransaction
            })
        }

        const user = await User.findById(req.user._id).session(session)
        if (!user) {
            await session.abortTransaction()
            return res.status(404).json({message: "User not found"})
        }

        user.wallet.available = roundMoney(user.wallet.available + amount)

        await Transaction.create([{
            user: user._id,
            type: "deposit",
            amount: amount,
            direction: "credit",
            balanceAfter: user.wallet.available,
            reference: reference,
            status: "completed"
        }], {session, ordered: true})
        
        await user.save({session})
        await session.commitTransaction()

        res.status(200).json({
            message: "Funds added successfully",
            wallet: user.wallet
        })
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction()
        }

        res.status(500).json({
            message: error.message
        })
    } finally {
        await session.endSession()
    }
}

module.exports = {
    index,
    deposit
}
