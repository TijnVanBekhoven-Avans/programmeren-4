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

// Listen to http requests
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`URL: http://localhost:${port}`)
})

module.exports = app;
