const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/authentication.controller')

// POST request to create new meal (UC-301)
router.post('', authController.validateToken, mealController.createMeal)

// PUT request to edit meal (UC-302)

// GET request to get all meals (UC-303)

// GET request to get a meal (UC-304)

// DELETE request to delete a meal (UC-305)

module.exports = router