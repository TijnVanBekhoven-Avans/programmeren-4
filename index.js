const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const authRoutes = require('./src/routes/auth.routes')
const mealRoutes = require('./src/routes/meal.routes')

const app = express();
const port = process.env.PORT || 3000

app.use(express.json())

// Log incomming http requests
app.use('/', (req, res, next) => {
    const method = req.method
    console.log(`Method ${method} is called`)
    next()
})

app.get('/api/info', (req, res) => {
    res.status(200).json(
        {
            status: 200,
            message: 'Server info-endpoint',
            data: {
                studentName: 'Tijn van Bekhoven',
                studentNumber: 2195786,
                description: 'Welcome to the share a meal API.'
            }
        }
    )
})

app.use('/api/user', userRoutes)
app.use('/api/meal', mealRoutes)
app.use('/api', authRoutes)

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

// Express error handler
app.use((err, req, res, next) => {
    res.status(err.code).json({
        status: err.code,
        message: err.message,
        data: {}
    });
});

// Listen to http requests
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`URL: http://localhost:${port}`)
})

module.exports = app;
