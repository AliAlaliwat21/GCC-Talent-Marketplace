const ClientProfile = require('../models/clientProfile')

const index = async (req, res) => {
    const profiles = await ClientProfile.find()
    res.json(profiles)
}

const show = async (req, res)=>{
    try{
    const profile = await ClientProfile.findById(req.params.id)

    if(!profile) {
        return res.status(404).json({message: 'Client not found'})
    }

  res.status(200).json(profile)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
}

const create = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}
module.exports = {
    index
}