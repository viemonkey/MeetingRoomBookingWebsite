const express  = require('express')
const multer   = require('multer')
const router   = express.Router()
const ctrl     = require('../controllers/bookingController')
const { protect } = require('../middleware/authMiddleware')
const { bookingValidation } = require('../middleware/bookingValidators')

// Multer — lưu file vào memory (không ghi ra disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(doc|docx)$/i)) cb(null, true)
    else cb(new Error('Chỉ chấp nhận file .doc hoặc .docx'))
  },
})

// Lấy tất cả lịch (theo ngày nếu có ?date=YYYY-MM-DD) — không cần auth để xem lịch chung
router.get('/',    ctrl.getAll)

// Lấy lịch của user đang đăng nhập
router.get('/my',  protect, ctrl.getMy)

// Tạo lịch đặt phòng
router.post('/',   protect, bookingValidation, ctrl.create)

// Xoá lịch
router.delete('/:id', protect, ctrl.remove)

// Nộp biên bản họp
router.post('/:id/minutes', protect, upload.single('file'), ctrl.uploadMinutes)

module.exports = router
