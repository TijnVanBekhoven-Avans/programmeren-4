const express = require('express')
const userRoutes = require('./src/routes/user.routes')

const app = express();
const port = process.env.PORT || 3000

app.use(express.json())

// Log incomming http requests
app.use('/', (req, res, next) => {
    const method = req.method
    console.log(`Method ${method} is called`)
    next()
})

app.use('/api/user', userRoutes)

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

module.exports = app;
