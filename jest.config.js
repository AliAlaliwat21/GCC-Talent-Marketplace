module.exports = {
    testEnvironment: "node",
    maxWorkers: 1,
    collectCoverageFrom: [
        "controllers/**/*.js",
        "middleware/**/*.js",
        "services/**/*.js",
        "models/**/*.js",
        "!controllers/config/**"
    ],
    coverageThreshold: {
        global: {
            lines: 60
        }
    }
}
