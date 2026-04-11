const { body } = require('express-validator')

const bookingValidation = [
  body('room')
    .notEmpty().withMessage('Vui lòng chọn phòng')
    .isIn(['tang5', 'tang6']).withMessage('Phòng không hợp lệ'),

  body('team')
    .trim().notEmpty().withMessage('Vui lòng nhập team/phòng ban'),

  body('reason')
    .trim().notEmpty().withMessage('Vui lòng nhập lý do mượn phòng')
    .isLength({ max: 200 }).withMessage('Lý do tối đa 200 ký tự'),

  body('date')
    .notEmpty().withMessage('Vui lòng chọn ngày')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Ngày không hợp lệ'),

  body('timeFrom')
    .notEmpty().withMessage('Vui lòng chọn giờ bắt đầu')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Giờ không hợp lệ'),

  body('timeTo')
    .notEmpty().withMessage('Vui lòng chọn giờ kết thúc')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Giờ không hợp lệ')
    .custom((timeTo, { req }) => {
      if (timeTo <= req.body.timeFrom) throw new Error('Giờ kết thúc phải sau giờ bắt đầu')
      return true
    }),
]

module.exports = { bookingValidation }
