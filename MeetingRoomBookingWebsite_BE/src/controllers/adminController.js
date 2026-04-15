const User         = require('../models/userModel')
const Booking      = require('../models/bookingModel')
const Notification = require('../models/notificationModel')

// Middleware: chỉ admin mới vào được
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ admin mới có quyền thực hiện thao tác này' })
  }
  next()
}

// ── QUẢN LÝ USER ──────────────────────────────────────────────

// GET /api/admin/users?status=pending|approved|rejected|all
async function getUsers(req, res) {
  try {
    const { status } = req.query
    const query = { role: 'member' }
    if (status && status !== 'all') query.status = status
    const users = await User.find(query).sort({ createdAt: -1 })
    return res.json({ success: true, data: users })
  } catch (err) {
    console.error('[admin.getUsers]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// PATCH /api/admin/users/:id/approve
async function approveUser(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' })
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể thay đổi quyền của admin' })

    user.status = 'approved'
    user.rejectReason = ''
    await user.save()

    await Notification.create({
      userId: user._id,
      type: 'success',
      message: `Tài khoản của bạn đã được duyệt! Bạn có thể đặt phòng họp ngay bây giờ.`,
    })

    return res.json({ success: true, message: 'Đã duyệt tài khoản', data: user.toSafeObject() })
  } catch (err) {
    console.error('[admin.approveUser]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// PATCH /api/admin/users/:id/reject
async function rejectUser(req, res) {
  try {
    const { reason } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' })
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể thay đổi quyền của admin' })

    user.status = 'rejected'
    user.rejectReason = reason || ''
    await user.save()

    await Notification.create({
      userId: user._id,
      type: 'conflict',
      message: `Tài khoản của bạn đã bị từ chối${reason ? ': ' + reason : ''}. Vui lòng liên hệ admin để biết thêm chi tiết.`,
    })

    return res.json({ success: true, message: 'Đã từ chối tài khoản', data: user.toSafeObject() })
  } catch (err) {
    console.error('[admin.rejectUser]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// PATCH /api/admin/users/:id/reset
async function resetUser(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' })

    user.status = 'pending'
    user.rejectReason = ''
    await user.save()

    return res.json({ success: true, message: 'Đã đặt lại trạng thái về chờ duyệt', data: user.toSafeObject() })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// ── THỐNG KÊ ──────────────────────────────────────────────────

// GET /api/admin/stats
async function getStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const [pending, approved, rejected, total, totalBookings, todayBookings, tang5Count, tang6Count] = await Promise.all([
      User.countDocuments({ role: 'member', status: 'pending' }),
      User.countDocuments({ role: 'member', status: 'approved' }),
      User.countDocuments({ role: 'member', status: 'rejected' }),
      User.countDocuments({ role: 'member' }),
      Booking.countDocuments({}),
      Booking.countDocuments({ date: today }),
      Booking.countDocuments({ room: 'tang5' }),
      Booking.countDocuments({ room: 'tang6' }),
    ])

    return res.json({
      success: true,
      data: {
        users: { pending, approved, rejected, total },
        bookings: { total: totalBookings, today: todayBookings, tang5: tang5Count, tang6: tang6Count },
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// ── QUẢN LÝ BOOKING ───────────────────────────────────────────

// GET /api/admin/bookings?date=YYYY-MM-DD&room=tang5|tang6&userId=...
async function getBookings(req, res) {
  try {
    const { date, room, userId } = req.query
    const query = {}
    if (date)   query.date = date
    if (room)   query.room = room
    if (userId) query.userId = userId

    const bookings = await Booking.find(query)
      .populate('userId', 'fullName email department')
      .sort({ date: 1, timeFrom: 1 })

    return res.json({ success: true, data: bookings })
  } catch (err) {
    console.error('[admin.getBookings]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// DELETE /api/admin/bookings/:id  — admin huỷ bất kỳ booking
async function deleteBooking(req, res) {
  try {
    const { reason } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt' })

    const roomName = booking.room === 'tang5' ? 'Phòng họp lớn (Tầng 5)' : 'Phòng họp nhỏ (Tầng 6)'

    // Thông báo cho chủ booking
    await Notification.create({
      userId: booking.userId,
      type: 'conflict',
      message: `Admin đã huỷ lịch đặt "${booking.reason}" tại ${roomName} ngày ${booking.date} lúc ${booking.timeFrom}–${booking.timeTo}${reason ? '. Lý do: ' + reason : ''}.`,
    })

    await Notification.deleteMany({ bookingId: req.params.id })
    await Booking.findByIdAndDelete(req.params.id)

    return res.json({ success: true, message: 'Đã huỷ lịch đặt' })
  } catch (err) {
    console.error('[admin.deleteBooking]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// PATCH /api/admin/bookings/:id/approve
async function approveBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt' })
    booking.status = 'approved'
    await booking.save()

    const roomName = booking.room === 'tang5' ? 'Phòng họp lớn (Tầng 5)' : 'Phòng họp nhỏ (Tầng 6)'
    await Notification.create({
      userId: booking.userId,
      type: 'success',
      message: `Đăng ký phòng họp "${booking.reason}" tại ${roomName} ngày ${booking.date} lúc ${booking.timeFrom}–${booking.timeTo} đã được duyệt!`,
    })

    return res.json({ success: true, message: 'Đã duyệt lịch đặt phòng' })
  } catch (err) {
    console.error('[admin.approveBooking]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// PATCH /api/admin/bookings/:id/reject
async function rejectBooking(req, res) {
  try {
    const { reason } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt' })
    booking.status = 'rejected'
    await booking.save()

    const roomName = booking.room === 'tang5' ? 'Phòng họp lớn (Tầng 5)' : 'Phòng họp nhỏ (Tầng 6)'
    await Notification.create({
      userId: booking.userId,
      type: 'conflict',
      message: `Đăng ký phòng họp "${booking.reason}" tại ${roomName} ngày ${booking.date} lúc ${booking.timeFrom}–${booking.timeTo} đã bị từ chối${reason ? '. Lý do: ' + reason : ''}.`,
    })

    return res.json({ success: true, message: 'Đã từ chối lịch đặt phòng' })
  } catch (err) {
    console.error('[admin.rejectBooking]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// GET /api/admin/bookings/report?from=YYYY-MM-DD&to=YYYY-MM-DD
// Báo cáo thống kê sử dụng phòng theo khoảng thời gian
async function getBookingReport(req, res) {
  try {
    const { from, to } = req.query
    const query = {}
    if (from && to) {
      query.date = { $gte: from, $lte: to }
    }

    const bookings = await Booking.find(query).populate('userId', 'fullName department')

    // Tổng hợp theo phòng
    const byRoom = { tang5: 0, tang6: 0 }
    // Tổng hợp theo người dùng
    const byUser = {}
    // Tổng số giờ
    let totalMinutes = 0

    bookings.forEach(b => {
      byRoom[b.room] = (byRoom[b.room] || 0) + 1
      const key = b.userId?._id?.toString() || b.userId?.toString()
      if (!byUser[key]) {
        byUser[key] = {
          userId: key,
          name: b.userName,
          department: b.userId?.department || '',
          count: 0,
          minutes: 0,
        }
      }
      byUser[key].count++
      const [fh,fm] = b.timeFrom.split(':').map(Number)
      const [th,tm] = b.timeTo.split(':').map(Number)
      const mins = (th*60+tm) - (fh*60+fm)
      byUser[key].minutes += mins
      totalMinutes += mins
    })

    return res.json({
      success: true,
      data: {
        total: bookings.length,
        totalHours: (totalMinutes / 60).toFixed(1),
        byRoom,
        topUsers: Object.values(byUser).sort((a,b) => b.count - a.count).slice(0, 10),
        bookings,
      },
    })
  } catch (err) {
    console.error('[admin.getBookingReport]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

module.exports = {
  adminOnly,
  // user management
  getUsers, approveUser, rejectUser, resetUser,
  // stats
  getStats,
  // booking management
  getBookings, deleteBooking, getBookingReport, approveBooking, rejectBooking,
}
