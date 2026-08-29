const Skill = require('../models/skill')

const index = async (req, res) => {
    try {
        const skills = await Skill.find()

        res.status(200).json(skills)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const create = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({message: "Only admins can create skills"})
        }
        
        const skill = await Skill.create({
            name: req.body.name,
            slug: req.body.slug,
            category: req.body.category
        })
        
        res.status(201).json(skill)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const update = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({message: "Only admins can update skills"})
        }
        const updatedSkill = await Skill.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                slug: req.body.slug,
                category: req.body.category
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        )

        if (!updatedSkill) {
            return res.status(404).json({message: "Skill not found"})
        }

        res.status(200).json(updatedSkill)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const deleteSkill = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({message: "Only admins can delete skills"})
        }
        const deletedSkill = await Skill.findByIdAndDelete(req.params.id)

        if (!deletedSkill) {
            return res.status(404).json({message: "Skill not found"})
        }

        res.status(200).json({message: "Skill deleted successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    index,
    create,
    update,
    deleteSkill
}
