validate = {
    emailAddress(emailAddress) {
        let pattern = /^[a-zA-Z]\.[a-zA-Z]{1,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/
        return regex(pattern, emailAddress)
    },

    password(password) {
        let pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/ // Tenminste 1 hoofdletter, 1 cijfer en 8 karakters lang
        return regex(pattern, password)
    },

    phoneNumber(phoneNumber) {
        let pattern = /^[0-9]{2}[\s-]{0,1}[0-9]{8}$/
        return regex(pattern, phoneNumber)
    }
}

function regex(pattern, value) {
    return pattern.test(value)
}

module.exports = validate