const { validationResult } = require('express-validator')
const BookingModel  = require('../models/bookingModel')
const NotifModel    = require('../models/notificationModel')

// POST /api/bookings
async function create(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }

  const { room, reason, date, timeFrom, timeTo, note, team } = req.body
  const { id: userId, fullName: userName } = req.user

  // Kiểm tra trùng giờ
  const conflict = BookingModel.findConflict(room, date, timeFrom, timeTo)
  if (conflict) {
    return res.status(409).json({
      success: false,
      message: 'TRÙNG GIỜ',
      conflict: {
        name: conflict.userName,
        team: conflict.team,
        timeFrom: conflict.timeFrom,
        timeTo: conflict.timeTo,
        room: conflict.room,
      },
    })
  }

  const booking = BookingModel.create({ userId, userName, team, room, reason, date, timeFrom, timeTo, note })

  // Tạo thông báo xác nhận
  NotifModel.create({
    userId,
    bookingId: booking.id,
    type: 'success',
    message: `Đặt phòng thành công: ${room === 'tang5' ? 'Tầng 5' : 'Tầng 6'} lúc ${timeFrom}–${timeTo} ngày ${date}`,
    scheduledAt: new Date().toISOString(),
  })

  // Tạo thông báo nhắc họp (trước 15 phút)
  scheduleReminder(booking)

  return res.status(201).json({ success: true, message: 'Đặt phòng thành công', data: booking })
}

// GET /api/bookings  (lấy tất cả theo ngày hoặc tất cả)
function getAll(req, res) {
  BookingModel.refreshStatuses()
  const { date } = req.query
  const data = date ? BookingModel.findByDate(date) : BookingModel.findAll()
  return res.json({ success: true, data })
}

// GET /api/bookings/my  (lấy của user đang đăng nhập)
function getMy(req, res) {
  BookingModel.refreshStatuses()
  const data = BookingModel.findByUser(req.user.id)
  return res.json({ success: true, data })
}

// DELETE /api/bookings/:id
function remove(req, res) {
  const booking = BookingModel.findById(req.params.id)
  if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy' })
  if (booking.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Không có quyền' })
  if (booking.status === 'done') return res.status(400).json({ success: false, message: 'Không thể xoá cuộc họp đã qua' })

  BookingModel.deleteById(req.params.id)
  NotifModel.deleteByBooking(req.params.id)
  return res.json({ success: true, message: 'Đã xoá lịch đặt' })
}

// POST /api/bookings/:id/minutes  (nộp biên bản họp)
async function uploadMinutes(req, res) {
  const booking = BookingModel.findById(req.params.id)
  if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy' })
  if (booking.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Không có quyền' })
  if (booking.status !== 'done') return res.status(400).json({ success: false, message: 'Chỉ nộp biên bản sau khi cuộc họp kết thúc' })

  const file = req.file
  if (!file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file biên bản' })
  if (!file.originalname.match(/\.(doc|docx)$/i)) return res.status(400).json({ success: false, message: 'Chỉ chấp nhận file .doc hoặc .docx' })

  BookingModel.updateMinutes(req.params.id, file.originalname)

  return res.json({ success: true, message: 'Nộp biên bản thành công', data: { fileName: file.originalname } })
}

// Hàm nội bộ: lên lịch nhắc họp trước 15 phút
function scheduleReminder(booking) {
  const [h, m] = booking.timeFrom.split(':').map(Number)
  const meetingDate = new Date(`${booking.date}T${booking.timeFrom}:00`)
  const reminderTime = new Date(meetingDate.getTime() - 15 * 60 * 1000)
  const now = new Date()
  const delay = reminderTime.getTime() - now.getTime()

  if (delay > 0) {
    setTimeout(() => {
      NotifModel.create({
        userId: booking.userId,
        bookingId: booking.id,
        type: 'reminder',
        message: `Nhắc nhở: Cuộc họp "${booking.reason}" bắt đầu sau 15 phút lúc ${booking.timeFrom}`,
        scheduledAt: reminderTime.toISOString(),
      })
      console.log(`[REMINDER] Đã tạo nhắc nhở cho booking ${booking.id}`)
    }, delay)
  }
}

module.exports = { create, getAll, getMy, remove, uploadMinutes }
