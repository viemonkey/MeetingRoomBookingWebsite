const path    = require('path')
const express = require('express')
const multer  = require('multer')
const router  = express.Router()
const ctrl    = require('../controllers/bookingController')
const { protect } = require('../middleware/authMiddleware')
const { bookingValidation } = require('../middleware/bookingValidators')

// FIX: dùng memoryStorage vẫn được (controller tự ghi disk)
// Giữ memoryStorage để controller kiểm soát tên file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB
  fileFilter(req, file, cb) {
    file.originalname.match(/\.(doc|docx)$/i)
      ? cb(null, true)
      : cb(new Error('Chỉ chấp nhận .doc hoặc .docx'))
  },
})

router.get('/',                     ctrl.getAll)
router.get('/my',  protect,         ctrl.getMy)
router.post('/',   protect, bookingValidation, ctrl.create)
router.delete('/:id', protect,      ctrl.remove)
router.post('/:id/minutes',  protect, upload.single('file'), ctrl.uploadMinutes)
router.get('/:id/minutes',   protect, ctrl.downloadMinutes)   // FIX: route tải biên bản

module.exports = router
