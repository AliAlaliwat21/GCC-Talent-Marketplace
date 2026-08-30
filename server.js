require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const dns = require('node:dns')

dns.setServers(['8.8.8.8', '1.1.1.1'])
const apiRoutes = require("./routes")
const sanitize = require("./middleware/sanitize")
const {notFound, errorHandler} = require("./middleware/error-handler")

const app = express()
const PORT = process.env.PORT || "3000"

const allowedOrigins = (
    process.env.CLIENT_URLS ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin)

const connectDatabase = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI)
    }
}

mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}. 🥭`)
})

app.disable("x-powered-by")
app.use(helmet())
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true)
            }

            callback(new Error("Origin is not allowed by CORS"))
        },
        credentials: true
    })
)
app.use(express.json({limit: "1mb"}))
app.use(sanitize)

if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"))
}

app.use(cookieParser())
app.use("/api/v1", apiRoutes)
app.use(notFound)
app.use(errorHandler)

if (require.main === module) {
    connectDatabase()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`The express app is ready on port ${PORT}! 💀`)
            })
        })
        .catch((error) => {
            console.error(error.message)
            process.exit(1)
        })
}

module.exports = {
    app,
    connectDatabase
}
