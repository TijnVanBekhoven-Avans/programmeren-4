const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/authentication.controller')

// POST request to register a new user (UC-201)
router.post('', userController.registerUser)

// GET request to get all users (UC-202)
router.get('', userController.getAllUsers)

// GET request to retrieve user profile (UC-203)
router.get('/profile', authController.validateToken, userController.getUserProfile)

// GET request to retrieve user by id (UC-204)
router.get('/:userId', authController.validateTokenOptional, userController.getUser)

// PUT request to overwrite user info by id (UC-205)
router.put('/:userId', authController.validateToken, userController.updateUser)

// DELETE request to delete user by id (UC-206)
router.delete('/:userId', authController.validateToken, userController.deleteUser)

module.exports = router
