const Category = require('../models/category')

const index = async (req, res) => {
    try {
        const categories = await Category.find()

        res.status(200).json(categories)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const create = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message:"Only admins can create categories"})
        }
        const category = await Category.create({
            name: req.body.name,
            slug: req.body.slug,
            icon: req.body.icon,
            isFeatured: req.body.isFeatured
        })
        
        res.status(201).json(category)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

module.exports = {
    index,
    create,
}