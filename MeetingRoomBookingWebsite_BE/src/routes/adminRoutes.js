const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  adminOnly,
  getUsers, approveUser, rejectUser, resetUser,
  getStats,
  getBookings, deleteBooking, getBookingReport,
  approveBooking, rejectBooking,
} = require('../controllers/adminController')

// Tất cả route admin đều cần đăng nhập + là admin
router.use(protect)
router.use(adminOnly)

// ── User management ───────────────────────────────────────────
router.get('/users',               getUsers)
router.patch('/users/:id/approve', approveUser)
router.patch('/users/:id/reject',  rejectUser)
router.patch('/users/:id/reset',   resetUser)

// ── Stats & Dashboard ─────────────────────────────────────────
router.get('/stats',               getStats)

// ── Booking management ────────────────────────────────────────
router.get('/bookings',            getBookings)
router.get('/bookings/report',     getBookingReport)
router.delete('/bookings/:id',     deleteBooking)
router.patch('/bookings/:id/approve', approveBooking)
router.patch('/bookings/:id/reject',  rejectBooking)

module.exports = router
