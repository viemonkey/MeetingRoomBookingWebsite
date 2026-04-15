const jwt  = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/userModel')

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

// POST /api/auth/register — status mặc định là 'pending'
async function register(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }

  const { fullName, email, department, password } = req.body

  try {
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được sử dụng',
        errors: [{ field: 'email', message: 'Email đã tồn tại' }],
      })
    }

    // Tạo user với status: 'pending' (mặc định trong schema)
    const user  = await User.create({ fullName, email, department, password })
    const token = createToken(user._id)

    return res.status(201).json({
      success: true,
      // Thông báo rõ là đang chờ duyệt
      message: 'Đăng ký thành công! Tài khoản đang chờ admin duyệt.',
      data: { token, user: user.toSafeObject() },
    })
  } catch (err) {
    console.error('[register]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// POST /api/auth/login
async function login(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' })
    }

    const token = createToken(user._id)

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { token, user: user.toSafeObject() },
    })
  } catch (err) {
    console.error('[login]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  return res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } })
}

// POST /api/auth/logout
function logout(req, res) {
  return res.status(200).json({ success: true, message: 'Đăng xuất thành công' })
}

module.exports = { register, login, getMe, logout }
