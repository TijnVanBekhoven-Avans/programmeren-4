module.exports = {
    jwtSecretKey: process.env.JWT_SECRET || 'kjsldkfjalskejflk,jvkjlkae',
    convertToBoolean: (number) => {
        if (number === 1) {
            return true
        } else if (number === 0) {
            return false
        }
    }
}