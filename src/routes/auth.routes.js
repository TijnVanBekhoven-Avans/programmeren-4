const express = require('express')
const router = express.Router()
const authController = require('../controllers/authentication.controller')

// POST request to create new login session (UC-101)
router.post('/login', authController.login)

module.exports = router