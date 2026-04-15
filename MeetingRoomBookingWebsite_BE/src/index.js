require('dotenv').config()
const express   = require('express')
const cors      = require('cors')
const connectDB = require('./config/database')

const authRoutes         = require('./routes/authRoutes')
const bookingRoutes      = require('./routes/bookingRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const adminRoutes        = require('./routes/adminRoutes')  // THÊM MỚI

const app  = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`)
  next()
})

app.use('/api/auth',          authRoutes)
app.use('/api/bookings',      bookingRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin',         adminRoutes)   // THÊM MỚI

app.get('/api/health', (_req, res) => res.json({
  success: true,
  message: 'Nexus Terminal API đang hoạt động',
  version: '4.0.0',
}))

app.use((_req, res) => res.status(404).json({ success: false, message: 'Endpoint không tồn tại' }))
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ success: false, message: err.message || 'Lỗi server nội bộ' })
})

app.listen(PORT, () => {
  console.log(`\n🚀 Nexus Terminal BE v4.0 → http://localhost:${PORT}`)
  console.log(`🔐 Auth:          /api/auth`)
  console.log(`📅 Bookings:      /api/bookings`)
  console.log(`🔔 Notifications: /api/notifications`)
  console.log(`👑 Admin:         /api/admin\n`)
  console.log(`💡 Tạo tài khoản admin: node src/createAdmin.js`)
})
