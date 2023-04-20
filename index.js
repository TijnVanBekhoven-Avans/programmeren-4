const express = require('express')
const assert = require('assert')
const app = express();
const port = 3000

app.use(express.json())

// In memory database to store users
let users = [
    {
        id: 1,
        firstName: 'Tijn',
        lastName: 'van Bekhoven',
        emailAddress: 'tijnvbek@gmail.com'
    },
    {
        id: 1,
        firstName: 'Jaap',
        lastName: 'van Bekhoven',
        emailAddress: 'jaapvbek@gmail.com'
    }
]
let index = users.length // Amount of users stored in the in memory database

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
        users.push(newUser)
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

// Listen to http requests
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`URL: http://localhost:${port}`)
})

module.exports = app;
