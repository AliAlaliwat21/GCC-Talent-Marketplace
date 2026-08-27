const cloudinary = require('../config/cloudinary')

const upload = async(req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                message: 'No file uploaded'
            })
        }
        if(
            req.file.mimetype.startsWith('image/')&&
            req.file.size > 5 * 1024 * 1024
        ){
            return res.status(400).json({
                message: 'Images must be 5 MB or smaller'
            })
        }

        const result = await new Promise((resolve, reject)=>{
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder:'GCC-Talent-Marketplace',
                    resource_type: 'auto'
                },
                (error, result)=>{
                    if(error){
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            )
       stream.end(req.file.buffer)
        })

        res.status(201).json({
            id: result.public_id,
            url: result.secure_url,
            name: req.file.originalname,
            size: req.file.size,
            mime: req.file.mimetype
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    upload
}