const mongoSanitize = require("express-mongo-sanitize")

const cleanString = (value) => {
    return value
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
        .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
        .replace(/javascript:/gi, "")
}

const cleanValues = (value) => {
    if (typeof value === "string") {
        return cleanString(value)
    }

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            value[i] = cleanValues(value[i])
        }

        return value
    }

    if (value && typeof value === "object") {
        const keys = Object.keys(value)

        for (let i = 0; i < keys.length; i++) {
            value[keys[i]] = cleanValues(value[keys[i]])
        }
    }

    return value
}

const sanitize = (req, res, next) => {
    if (req.body) {
        mongoSanitize.sanitize(req.body)
        cleanValues(req.body)
    }

    if (req.params) {
        mongoSanitize.sanitize(req.params)
    }

    next()
}

module.exports = sanitize
