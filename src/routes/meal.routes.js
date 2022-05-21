const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')

//UC-301 - Create new meal
router.post('/api/meal', authController.validate, mealController.validateNewMeal, mealController.addMeal);
  
//UC-303 - Get all meals
router.get('/api/meal', mealController.getAllMeals);

//UC-304 - Get single meal by ID
router.get('/api/meal/:mealId', mealController.getMealById);

//UC-305 - Delete a meal
router.delete('/api/meal/:mealId', authController.validate, mealController.deleteMeal);

module.exports = router;