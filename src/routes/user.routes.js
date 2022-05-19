const express = require('express');
const { validateUser } = require('../controllers/user.controller');
const router = express.Router();
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

//Standard response
router.get('/', userController.standardResponse);

//UC-201 - Register as a new user
router.post('/api/user', userController.validateNewUser, userController.addUser);
  
//UC-202 - Get all users
router.get('/api/user', authController.validate, userController.getAllUsers);

//UC-203 - Request personal user profile
router.get('/api/user/profile', authController.validate, userController.getPersonalProfile);

//UC-204 - Get single user by ID
router.get('/api/user/:userId', authController.validate, userController.getUserById);

//UC-205 - Update a single user
router.put('/api/user/:userId', authController.validate, userController.validateUpdatedUser, userController.updateUser);

//UC-206 - Delete a user
router.delete('/api/user/:userId', authController.validate, userController.deleteUser);

module.exports = router;