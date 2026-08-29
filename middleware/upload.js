const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req,file,cb)=>{
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed'
    ]

    if(!allowedTypes.includes(file.mimetype)){
        const error = new Error("File type is not allowed")
        error.status = 400

        return cb(error)
    }

    cb(null,true)
}

const upload = multer({
    storage,
    limits:{
        fileSize: 20 * 1024 * 1024
    },
    fileFilter
})

module.exports = upload
