module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    globals: {
        "ts-jest": {
            "tsconfig": "tsconfig.test.json"
        }
    }
}
