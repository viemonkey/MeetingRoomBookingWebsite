const { body } = require('express-validator')

// Danh sách phòng ban phải khớp với FE (register/page.tsx)
const DEPARTMENTS = [
  'kỹ thuật', 'thiết kế', 'kinh doanh', 'nhân sự',
  'marketing', 'tài chính', 'data', 'product',
]

const registerValidation = [
  body('fullName')
    .trim().notEmpty().withMessage('Họ và tên không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Từ 2 đến 100 ký tự'),

  body('email')
    .trim().notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('department')
    .notEmpty().withMessage('Vui lòng chọn phòng ban')
    .custom(val => {
      // So sánh không phân biệt hoa thường để tránh lỗi do FE gửi lowercase
      if (!DEPARTMENTS.includes(val.toLowerCase())) {
        throw new Error('Phòng ban không hợp lệ')
      }
      return true
    }),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu ít nhất 8 ký tự'),
]

const loginValidation = [
  body('email')
    .trim().notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống'),
]

module.exports = { registerValidation, loginValidation }
