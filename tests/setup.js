const mongoose = require("mongoose")
const fs = require("node:fs")
const path = require("node:path")
const {MongoMemoryReplSet} = require("mongodb-memory-server")

let replicaSet
let databaseDirectory
let databaseReady = false

process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test-access-secret"
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret"
process.env.PLATFORM_FEE_PCT = "10"
process.env.CLIENT_URL = "http://localhost:5173"

beforeAll(async () => {
    databaseDirectory = fs.mkdtempSync(path.join(process.cwd(), ".test-mongodb-"))

    replicaSet = await MongoMemoryReplSet.create({
        instanceOpts: [
            {
                dbPath: databaseDirectory,
                args: ["--nounixsocket"]
            }
        ],
        replSet: {
            count: 1,
            storageEngine: "wiredTiger"
        }
    })

    await mongoose.connect(replicaSet.getUri())
    databaseReady = true
}, 120000)

afterEach(async () => {
    if (!databaseReady) {
        return
    }

    const collections = mongoose.connection.collections
    const names = Object.keys(collections)

    for (let i = 0; i < names.length; i++) {
        await collections[names[i]].deleteMany({})
    }
})

afterAll(async () => {
    if (databaseReady) {
        await mongoose.disconnect()
    }

    if (replicaSet) {
        await replicaSet.stop()
    }

    if (databaseDirectory && fs.existsSync(databaseDirectory)) {
        fs.rmSync(databaseDirectory, {recursive: true, force: true})
    }
}, 120000)
