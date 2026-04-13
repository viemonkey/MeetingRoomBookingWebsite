const { body } = require('express-validator')

const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Họ và tên không được để trống').isLength({ min: 2, max: 100 }).withMessage('Từ 2 đến 100 ký tự'),
  body('email').trim().notEmpty().withMessage('Email không được để trống').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('department').notEmpty().withMessage('Vui lòng chọn phòng ban')
    .isIn(['engineering','security','data','admin','marketing','hr','product']).withMessage('Phòng ban không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống').isLength({ min: 6 }).withMessage('Ít nhất 6 ký tự'),
]

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email không được để trống').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
]

module.exports = { registerValidation, loginValidation }
