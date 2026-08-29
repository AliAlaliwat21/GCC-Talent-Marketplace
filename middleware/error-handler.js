const notFound = (req, res) => {
    res.status(404).json({
        message: "Route not found"
    })
}

const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    let status = error.status || error.statusCode || 500
    let message = error.message || "Internal server error"

    if (error.name === "CastError") {
        status = 400
        message = "Invalid ID"
    }

    if (error.code === 11000) {
        status = 409
        message = "This record already exists"
    }

    if (error.name === "MulterError") {
        status = 400
        message = error.code === "LIMIT_FILE_SIZE"
            ? "File is too large"
            : error.message
    }

    res.status(status).json({
        message: message
    })
}

module.exports = {
    notFound,
    errorHandler
}
