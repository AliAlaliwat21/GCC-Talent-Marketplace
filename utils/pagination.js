const getPagination = (query, defaultLimit = 10, maximumLimit = 50) => {
    let page = Number(query.page)
    let limit = Number(query.limit)

    if (!Number.isInteger(page) || page < 1) {
        page = 1
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = defaultLimit
    }

    if (limit > maximumLimit) {
        limit = maximumLimit
    }

    return {
        page: page,
        limit: limit,
        skip: (page - 1) * limit
    }
}

module.exports = getPagination
