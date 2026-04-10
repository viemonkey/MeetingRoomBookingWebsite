require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logger (dev)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Nexus Terminal API đang hoạt động',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' })
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err)
  res.status(500).json({ success: false, message: 'Lỗi server nội bộ' })
})

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Nexus Terminal BE chạy tại http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth API:     http://localhost:${PORT}/api/auth\n`)
})
