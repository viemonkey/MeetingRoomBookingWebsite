const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/notificationController')
const { protect } = require('../middleware/authMiddleware')

router.get('/',              protect, ctrl.getAll)
router.patch('/read-all',    protect, ctrl.markAllRead)
router.patch('/:id/read',   protect, ctrl.markRead)

module.exports = router
