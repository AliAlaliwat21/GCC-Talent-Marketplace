const FreelancerProfile = require('../models/freelancerProfile')

const index = async (req, res) => {
    const profiles = await FreelancerProfile.find()
    res.json(profiles)
}

module.exports = {
    index
}