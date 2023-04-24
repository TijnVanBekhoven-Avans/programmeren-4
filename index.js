const express = require('express')
const assert = require('assert')
const app = express();
const port = 3000

app.use(express.json())

// In memory database to store users
let database = {
        users: [
        {
            id: 1,
            firstName: 'Tijn',
            lastName: 'van Bekhoven',
            street: 'Philips Vingboonsstraat 18',
            city: 'Tilburg',
            isActive: true,
            emailAddress: 'tijnvbek@gmail.com',
            password: 'secret',
            phoneNumber: '06 12345678'
        },
        {
            id: 2,
            firstName: 'Jaap',
            lastName: 'van Bekhoven',
            street: 'Philips Vingboonsstraat 18',
            city: 'Tilburg',
            isActive: false,
            emailAddress: 'jaapvbek@gmail.com',
            password: 'secret',
            phoneNumber: '06 12345678'
        }
    ]
}
let index = database.users.length // Amount of users stored in the in memory database

// Log incomming http requests
app.use('/', (req, res, next) => {
    const method = req.method
    console.log(`Method ${method} is called`)
    next()
})

// POST request to register a new user (UC-201)
app.post('/api/user', (req, res) => {
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

        index++
        newUser = {
            id: index,
            firstName: firstName,
            lastName: lastName,
            street: street,
            city: city,
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
})

// GET request to get all users (UC-202)
app.get('/api/user', (req, res) => {
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
})

// GET request to retrieve user profile (UC-203)
app.get('/api/user/profile', (req, res) => {
    res.status(501).json(
        {
            status: 501,
            message: 'Functionality has yet be realised',
            data: {}
        }
    )
})

// GET request to retrieve user by id (UC-204)
app.get('/api/user/:userId', (req, res) => {
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
})

// PUT request to overwrite user info by id (UC-205)
app.put('/api/user/:userId', (req, res) => {
    let userId = req.params.userId
    let user
    let userIndex
    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].id == userId) {
            user = database.users[i]
            userIndex = i
            console.log(userIndex)
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
})

// DELETE request to delete user by id (UC-206)
app.delete('/api/user/:userId', (req, res, next) => {
    let userId = req.params.userId
    
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
        }
    }

    res.status(404).json(
        {
            status: 404,
            message: `User with id ${userId} has not been found`,
            data: {}
        }
    )
})

// Catch not existing routes
app.use('*', (req, res) => {
    res.status(404).json(
        {
            status: 404,
            message: 'Endpoint not found',
            data: {}
        }
    )
})

// Listen to http requests
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`URL: http://localhost:${port}`)
})

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

module.exports = app;
