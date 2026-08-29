const {
    roundMoney,
    calculatePlatformFee,
    calculateRelease,
    calculateFundingBalances
} = require("../services/wallet")

describe("wallet service", () => {
    test("calculates the platform fee and freelancer amount", () => {
        expect(calculatePlatformFee(500, 10)).toBe(50)
        expect(calculateRelease(500, 10)).toEqual({
            amount: 500,
            platformFee: 50,
            freelancerAmount: 450
        })
    })

    test("rounds money to two decimal places", () => {
        expect(roundMoney(10.236)).toBe(10.24)
    })

    test("moves available money into pending escrow", () => {
        expect(calculateFundingBalances(1000, 50, 400)).toEqual({
            available: 600,
            pending: 450
        })
    })

    test("rejects funding when the wallet has insufficient money", () => {
        expect(() => calculateFundingBalances(100, 0, 200))
            .toThrow("Insufficient wallet balance")
    })
})
