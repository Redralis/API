const express = require('express')
const authController = require('../controllers/auth.controller')
const router = express.Router()

//UC-101 - Login
router.post('/api/auth/login', authController.validateInput, authController.login)

module.exports = router