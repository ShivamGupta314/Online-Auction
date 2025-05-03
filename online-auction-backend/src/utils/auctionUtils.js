// Returns true if current time is between product's startTime and endTime
export const isAuctionActive = ({ startTime, endTime }) => {
    const now = new Date()
    return now >= new Date(startTime) && now <= new Date(endTime)
}

// Returns true if auction has ended
export const isAuctionExpired = (endTime) => {
    return new Date() > new Date(endTime)
}

// Returns isExpired, timeLeft in ms, and formatted time left as HH:mm:ss
export const getAuctionStatus = (product) => {
    const now = new Date()
    const endTime = new Date(product.endTime)

    const isExpired = now > endTime
    const timeLeft = Math.max(0, endTime - now)

    const timeLeftFormatted = new Date(timeLeft)
        .toISOString()
        .substring(11, 19) // format: HH:mm:ss

    return { isExpired, timeLeft, timeLeftFormatted }
}
