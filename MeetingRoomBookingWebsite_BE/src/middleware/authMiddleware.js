const jwt  = require('jsonwebtoken')
const User = require('../models/userModel')

async function protect(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập. Vui lòng đăng nhập.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' })
    }
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ.' })
  }
}

module.exports = { protect }
