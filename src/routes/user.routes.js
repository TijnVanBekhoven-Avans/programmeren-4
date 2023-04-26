const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

// POST request to register a new user (UC-201)
router.post('', userController.registerUser)

// GET request to get all users (UC-202)
router.get('', userController.getAllUsers)

// GET request to retrieve user profile (UC-203)
router.get('/profile', userController.getUserProfile)

// GET request to retrieve user by id (UC-204)
router.get('/:userId', userController.getUser)

// PUT request to overwrite user info by id (UC-205)
router.put('/:userId', userController.updateUser)

// DELETE request to delete user by id (UC-206)
router.delete('/:userId', userController.deleteUser)

module.exports = router
