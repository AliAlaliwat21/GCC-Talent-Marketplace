const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req,file,cb)=>{
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if(!allowedTypes.includes(file.mimetype)){
        return cb(new Error('File type is not allowed'))
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
