const roundMoney = (amount) => {
    return Math.round(Number(amount) * 100) / 100
}

const calculatePlatformFee = (amount, percentage = 10) => {
    return roundMoney(Number(amount) * Number(percentage) / 100)
}

const calculateRelease = (escrowAmount, percentage = 10) => {
    const amount = roundMoney(escrowAmount)
    const platformFee = calculatePlatformFee(amount, percentage)

    return {
        amount: amount,
        platformFee: platformFee,
        freelancerAmount: roundMoney(amount - platformFee)
    }
}

const calculateFundingBalances = (available, pending, amount) => {
    const fundingAmount = roundMoney(amount)

    if (fundingAmount <= 0) {
        throw new Error("Funding amount must be greater than zero")
    }

    if (roundMoney(available) < fundingAmount) {
        throw new Error("Insufficient wallet balance")
    }

    return {
        available: roundMoney(available - fundingAmount),
        pending: roundMoney(pending + fundingAmount)
    }
}

module.exports = {
    roundMoney,
    calculatePlatformFee,
    calculateRelease,
    calculateFundingBalances
}
