const { body } = require('express-validator')

// Lấy ngày hôm nay theo giờ Việt Nam (UTC+7)
function getTodayVN() {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const pad = n => String(n).padStart(2, '0')
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`
}

const bookingValidation = [
  body('room')
    .notEmpty().withMessage('Vui lòng chọn phòng')
    .isIn(['tang5', 'tang6']).withMessage('Phòng không hợp lệ'),

  body('team')
    .trim().notEmpty().withMessage('Vui lòng nhập team/phòng ban'),

  body('reason')
    .trim().notEmpty().withMessage('Vui lòng nhập lý do')
    .isLength({ max: 200 }).withMessage('Tối đa 200 ký tự'),

  body('date')
    .notEmpty().withMessage('Vui lòng chọn ngày')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Ngày không hợp lệ')
    .custom(date => {
      // FIX: không cho đặt phòng trong quá khứ (so sánh theo giờ VN)
      if (date < getTodayVN()) {
        throw new Error('Không thể đặt phòng cho ngày trong quá khứ')
      }
      return true
    }),

  body('timeFrom')
    .notEmpty().withMessage('Vui lòng chọn giờ bắt đầu')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Giờ không hợp lệ'),

  body('timeTo')
    .notEmpty().withMessage('Vui lòng chọn giờ kết thúc')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Giờ không hợp lệ')
    .custom((timeTo, { req }) => {
      if (timeTo <= req.body.timeFrom) {
        throw new Error('Giờ kết thúc phải sau giờ bắt đầu')
      }
      return true
    }),
]

module.exports = { bookingValidation }
