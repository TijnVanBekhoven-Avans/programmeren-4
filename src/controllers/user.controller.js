const database = require('../util/database')
const assert = require('assert')

const userController = {
    registerUser: (req, res) => {
        let newUser = req.body
        let { firstName, lastName, street, city, emailAddress, password, phoneNumber } = req.body
    
        try {
            assert(typeof firstName === 'string', 'firstName must be a string')
            assert(typeof lastName === 'string', 'lastName must be a string')
            assert(typeof street === 'string', 'street must be a string')
            assert(typeof city === 'string', 'city must be a string')
            assert(typeof emailAddress === 'string', 'emailAddress must be a string')
            assert(typeof password === 'string', 'password must be a string')
            assert(typeof phoneNumber === 'string', 'phoneNumber must be a string')
    
            if (!validateEmailAddress(emailAddress)) {
                throw new Error('EmailAddress is not valid')
            } else if (!validatePassword(password)) {
                throw new Error('Password does not meet the minimum requirements')
            } else if (!validatePhoneNumber(phoneNumber)) {
                throw new Error('PhoneNumber is not valid')
            }
    
            for (let i = 0; i < database.users.length; i++) {
                if (database.users[i].emailAddress === emailAddress) {
                    res.status(403).json(
                        {
                            status: 403,
                            message: 'EmailAddress is already in use',
                            data: {}
                        }
                    )
                }
            }
    
            let index = database.index++
            newUser = {
                id: index,
                firstName: firstName,
                lastName: lastName,
                street: street,
                city: city,
                isActive: true,
                emailAddress: emailAddress,
                password: password,
                phoneNumber: phoneNumber
            }
            database.users.push(newUser)
            res.status(201).json(
                {
                    status: 201,
                    message: `User with id ${index} successfully added`,
                    data: newUser
                }
            )
        } 
        catch (err) {
            res.status(400).json(
                {
                    status: 400,
                    message: err.toString(),
                    data: {}
                }
            )
        }
    },
    
    getAllUsers: (req, res) => {
        let firstNameFilter = req.query.firstName
        let lastNameFilter = req.query.lastName
        let streetFilter = req.query.street
        let cityFilter = req.query.city
        let isActiveFilter = req.query.isActive
        let emailAddressFilter = req.query.emailAddress
        let phoneNumberFilter = req.query.phoneNumber
    
        let filteredUsers = database.users
        if (firstNameFilter) {
            filteredUsers = filteredUsers.filter((item) => item.firstName == firstNameFilter)
        }
        if (lastNameFilter) {
            filteredUsers = filteredUsers.filter((item) => item.lastName == lastNameFilter)
        }
        if (streetFilter) {
            filteredUsers = filteredUsers.filter((item) => item.street == streetFilter)
        }
        if (cityFilter) {
            filteredUsers = filteredUsers.filter((item) => item.city == cityFilter)
        }
        if (isActiveFilter) {
            if (isActiveFilter === 'true') {
                isActiveFilter = true
            } else if (isActiveFilter === 'false') {
                isActiveFilter = false
            }
            filteredUsers = filteredUsers.filter((item) => item.isActive == isActiveFilter)
        }
        if (emailAddressFilter) {
            filteredUsers = filteredUsers.filter((item) => item.emailAddress == emailAddressFilter)
        }
        if (phoneNumberFilter) {
            filteredUsers = filteredUsers.filter((item) => item.phoneNumber == phoneNumberFilter)
        }
    
        res.status(200).json(
            {
                status: 200,
                message: `Users successfully retrieved`,
                data: {
                    users: filteredUsers
                }
            }
        )
    },

    getUserProfile: (req, res) => {
        res.status(501).json(
            {
                status: 501,
                message: 'Functionality has yet be realised',
                data: {}
            }
        )
    },

    getUser: (req, res) => {
        let userId = req.params.userId
        let user = database.users.filter((item) => item.id == userId)
        if (user[0]) {
            res.status(200).json(
                {
                    status: 200,
                    message: `User with id ${userId} has been found`,
                    data: user[0]
                }
            )
        } else {
            res.status(404).json(
                {
                    status: 404,
                    message: `User with id ${userId} has not been found`,
                    data: {}
                }
            )
        }
    },

    updateUser: (req, res) => {
        let userId = req.params.userId
        let user
        let userIndex
        for (let i = 0; i < database.users.length; i++) {
            if (database.users[i].id == userId) {
                user = database.users[i]
                userIndex = i
            }
        }
        let { firstName, lastName, street, city, emailAddress, password, phoneNumber } = req.body
    
        // Check if emailAddress is present, if not throw error message
        if (!emailAddress) {
            res.status(400).json(
                {
                    status: 400,
                    message: `The required parameter emailAddress is missing`,
                    data: {}
                }
            )
        }
    
        try {
            // Check if parameters are the right datatype and are valid
            assert(typeof emailAddress === 'string', 'emailAddress must be a string')
            if (!validateEmailAddress(emailAddress)) {
                throw new Error('EmailAddress is not formatted correctly')
            }
            if (firstName) {
                assert(typeof firstName === 'string', 'firstName must be a string')
            }
            if (lastName) {
                assert(typeof lastName === 'string', 'lastName must be a string')
            }
            if (street) {
                assert(typeof street === 'string', 'street must be a string')
            }
            if (city) {
                assert(typeof city === 'string', 'city must be a string')
            }
            if (password) {
                assert(typeof password === 'string', 'password must be a string')
                if (!validatePassword(password)) {
                    throw new Error('Password is not formatted correctly')
                }
            }
            if (phoneNumber) {
                assert(typeof phoneNumber === 'string', 'phoneNumber must be a string')
                if (!validatePhoneNumber(phoneNumber)) {
                    throw new Error('Phonenumber is not formatted correctly')
                }
            }
        } 
        catch (err) {
            res.status(400).json(
                {
                    status: 400,
                    message: err.toString(),
                    data: {}
                }
            )
        }
        if (user) {
    
            if (firstName) {
                database.users[userIndex] = {
                    ...user,
                    firstName
                }
            }
            if (lastName) {
                database.users[userIndex] = {
                    ...user,
                    lastName
                }
            }
            if (street) {
                database.users[userIndex] = {
                    ...user,
                    street
                }
            }
            if (city) {
                database.users[userIndex] = {
                    ...user,
                    city
                }
            }
            if (emailAddress) {
                database.users[userIndex] = {
                    ...user,
                    emailAddress
                }
            }
            if (password) {
                database.users[userIndex] = {
                    ...user,
                    password
                }
            }
            if (phoneNumber) {
                database.users[userIndex] = {
                    ...user,
                    phoneNumber
                }
            }
    
            res.status(200).json(
                {
                    status: 200,
                    message: `User with id ${userId} has been edited succesfully`,
                    data: database.users[userIndex]
                }
            )
        } else {
            res.status(404).json(
                {
                    status: 404,
                    message: `User with id ${userId} has not been found`,
                    data: {}
                }
            )
        }
    },

    deleteUser: (req, res) => {
        let userId = req.params.userId
        let userDeleted
        
        for (let i = 0; i < database.users.length; i++) {
            if (database.users[i].id == userId) {
                database.users.splice(i, 1)
                res.status(200).json(
                    {
                        status: 200,
                        message: `User with id ${userId} has been deleted`,
                        data: {}
                    }
                )
                userDeleted = true
            }
        }
    
        if (!userDeleted) {
            res.status(404).json(
                {
                    status: 404,
                    message: `User with id ${userId} has not been found`,
                    data: {}
                }
            )
        }
    }
}

function validateEmailAddress(emailAddress) {
    let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regex(pattern, emailAddress)
}

function validatePassword(password) {
    let pattern = /^.{6,}$/
    return regex(pattern, password)
}

function validatePhoneNumber(phoneNumber) {
    let pattern = /^[0-9\s]+$/
    return regex(pattern, phoneNumber)
}

function regex(pattern, value) {
    return pattern.test(value)
}

module.exports = userController
