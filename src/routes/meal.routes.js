const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/authentication.controller')

// POST request to create new meal (UC-301)
router.post('', authController.validateToken, mealController.createMeal)

// PUT request to edit meal (UC-302)

// GET request to get all meals (UC-303)
router.get('', mealController.getMeals)

// GET request to get a meal (UC-304)
router.get('/:mealId', mealController.getMeal)

// DELETE request to delete a meal (UC-305)
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal)

module.exports = router