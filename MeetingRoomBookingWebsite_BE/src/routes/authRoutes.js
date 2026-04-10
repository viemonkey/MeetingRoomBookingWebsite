const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const { registerValidation, loginValidation } = require('../middleware/validators')

// POST /api/auth/register
router.post('/register', registerValidation, authController.register)

// POST /api/auth/login
router.post('/login', loginValidation, authController.login)

// GET  /api/auth/me  — cần đăng nhập
router.get('/me', protect, authController.getMe)

// POST /api/auth/logout
router.post('/logout', protect, authController.logout)

module.exports = router
