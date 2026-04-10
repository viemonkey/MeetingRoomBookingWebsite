const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const UserModel = require('../models/userModel')

// Tạo JWT token
function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

// POST /api/auth/register
async function register(req, res) {
  // Validate input
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
    // Kiểm tra email đã tồn tại chưa
    const existing = UserModel.findByEmail(email)
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được sử dụng',
        errors: [{ field: 'email', message: 'Email đã tồn tại' }],
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Tạo user
    const user = UserModel.create({
      fullName: fullName.trim(),
      email,
      department,
      password: hashedPassword,
    })

    // Tạo token
    const token = createToken(user.id)

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: {
        token,
        user: UserModel.safe(user),
      },
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
    // Tìm user
    const user = UserModel.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      })
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      })
    }

    // Tạo token
    const token = createToken(user.id)

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: UserModel.safe(user),
      },
    })
  } catch (err) {
    console.error('[login]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// GET /api/auth/me  (cần token)
function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: { user: UserModel.safe(req.user) },
  })
}

// POST /api/auth/logout
function logout(req, res) {
  // JWT stateless — client xoá token là xong
  // Nếu cần blacklist token thì lưu vào Redis
  return res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công',
  })
}

module.exports = { register, login, getMe, logout }
