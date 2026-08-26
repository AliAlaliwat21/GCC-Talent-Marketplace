const ClientProfile = require('../models/clientProfile')

const index = async (req, res) => {
    const profiles = await ClientProfile.find()
    res.json(profiles)
}

module.exports = {
    index
}