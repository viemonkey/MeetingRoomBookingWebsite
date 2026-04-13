const { validationResult } = require('express-validator')
const Booking      = require('../models/bookingModel')
const Notification = require('../models/notificationModel')

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
  const { _id: userId, fullName: userName } = req.user

  try {
    // Kiểm tra trùng giờ
    const conflict = await Booking.findConflict(room, date, timeFrom, timeTo)
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

    const booking = await Booking.create({ userId, userName, team, room, reason, date, timeFrom, timeTo, note })

    // Thông báo xác nhận
    await Notification.create({
      userId,
      bookingId: booking._id,
      type: 'success',
      message: `Đặt phòng thành công: ${room === 'tang5' ? 'Tầng 5' : 'Tầng 6'} lúc ${timeFrom}–${timeTo} ngày ${date}`,
    })

    // Lên lịch nhắc trước 15 phút
    scheduleReminder(booking, userId)

    return res.status(201).json({ success: true, message: 'Đặt phòng thành công', data: booking })
  } catch (err) {
    console.error('[booking.create]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// GET /api/bookings
async function getAll(req, res) {
  try {
    const { date } = req.query
    const query = date ? { date } : {}
    const bookings = await Booking.find(query).sort({ date: 1, timeFrom: 1 })
    return res.json({ success: true, data: bookings })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// GET /api/bookings/my
async function getMy(req, res) {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ date: -1, timeFrom: -1 })
    return res.json({ success: true, data: bookings })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// DELETE /api/bookings/:id
async function remove(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy' })
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền' })
    }
    if (booking.status === 'done') {
      return res.status(400).json({ success: false, message: 'Không thể xoá cuộc họp đã qua' })
    }

    await Booking.findByIdAndDelete(req.params.id)
    await Notification.deleteMany({ bookingId: req.params.id })

    return res.json({ success: true, message: 'Đã xoá lịch đặt' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// POST /api/bookings/:id/minutes
async function uploadMinutes(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy' })
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền' })
    }
    if (booking.status !== 'done') {
      return res.status(400).json({ success: false, message: 'Chỉ nộp biên bản sau khi cuộc họp kết thúc' })
    }

    const file = req.file
    if (!file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file biên bản' })

    booking.minutesFile = file.originalname
    await booking.save()

    return res.json({ success: true, message: 'Nộp biên bản thành công', data: { fileName: file.originalname } })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// Nhắc họp trước 15 phút
function scheduleReminder(booking, userId) {
  const meetingTime  = new Date(`${booking.date}T${booking.timeFrom}:00`)
  const reminderTime = new Date(meetingTime.getTime() - 15 * 60 * 1000)
  const delay        = reminderTime.getTime() - Date.now()

  if (delay > 0) {
    setTimeout(async () => {
      await Notification.create({
        userId,
        bookingId: booking._id,
        type: 'reminder',
        message: `Nhắc nhở: Cuộc họp "${booking.reason}" bắt đầu sau 15 phút lúc ${booking.timeFrom}`,
        scheduledAt: reminderTime,
      })
      console.log(`[REMINDER] Đã nhắc booking ${booking._id}`)
    }, delay)
  }
}

module.exports = { create, getAll, getMy, remove, uploadMinutes }
