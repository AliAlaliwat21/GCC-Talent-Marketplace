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

module.exports = {
    index
}