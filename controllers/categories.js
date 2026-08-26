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
            return res.status(403).json({ message: "Only admins can create categories"})
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

const update = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({message: "Only admins can update categories"})
        }
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id,
            {
                name: req.body.name,
                slug: req.body.slug,
                icon: req.body.icon,
                isFeatured: req.body.isFeatured
            },
            {
                new: true,
                runValidators: true
            }
        )
        if (!updatedCategory) {
            return res.status(404).json({message: "Category not found"})
        }
        res.status(200).json(updatedCategory)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({message: "Only admins can delete categories"})
        }
        
        const deletedCategory = await Category.findByIdAndDelete(req.params.id)
        if (!deletedCategory) {
            return res.status(404).json({message: "Category not found"})
        }

        res.status(200).json({message: "Category deleted successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    index,
    create,
    update,
    deleteCategory
}