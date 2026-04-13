const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const { registerValidation, loginValidation } = require('../middleware/validators')

router.post('/register', registerValidation, ctrl.register)
router.post('/login',    loginValidation,    ctrl.login)
router.get('/me',        protect,            ctrl.getMe)
router.post('/logout',   protect,            ctrl.logout)

module.exports = router
