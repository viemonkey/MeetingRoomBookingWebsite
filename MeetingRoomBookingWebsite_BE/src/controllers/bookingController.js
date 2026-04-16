const path     = require('path')
const fs       = require('fs')
const { validationResult } = require('express-validator')
const Booking      = require('../models/bookingModel')
const Notification = require('../models/notificationModel')

// Thư mục lưu file biên bản
const UPLOADS_DIR = path.join(__dirname, '../../uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

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

  if (!req.user.canBook()) {
    const msgMap = {
      pending:  'Tài khoản của bạn đang chờ admin duyệt. Vui lòng chờ xác nhận.',
      rejected: `Tài khoản của bạn đã bị từ chối${req.user.rejectReason ? ': ' + req.user.rejectReason : ''}. Vui lòng liên hệ admin.`,
    }
    return res.status(403).json({
      success: false,
      message: msgMap[req.user.status] || 'Tài khoản chưa được kích hoạt',
      accountStatus: req.user.status,
    })
  }

  const { room, reason, date, timeFrom, timeTo, note, team } = req.body
  const { _id: userId, fullName: userName } = req.user

  try {
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

    await Notification.create({
      userId,
      bookingId: booking._id,
      type: 'success',
      message: `Đặt phòng thành công: ${room === 'tang5' ? 'Phòng họp lớn (Tầng 5)' : 'Phòng họp nhỏ (Tầng 6)'} lúc ${timeFrom}–${timeTo} ngày ${date}`,
    })

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
    if (booking.timeStatus === 'done') {
      return res.status(400).json({ success: false, message: 'Không thể xoá cuộc họp đã qua' })
    }

    // Xóa file biên bản nếu có
    if (booking.minutesFile) {
      const filePath = path.join(UPLOADS_DIR, booking.minutesFile)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
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
    if (booking.timeStatus !== 'done') {
      return res.status(400).json({ success: false, message: 'Chỉ nộp biên bản sau khi cuộc họp kết thúc' })
    }

    const file = req.file
    if (!file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file biên bản' })

    // FIX: Lưu file ra disk thay vì chỉ lưu tên
    // Tên file: bookingId_timestamp_originalname để tránh trùng
    const ext      = path.extname(file.originalname)
    const safeName = `${booking._id}_${Date.now()}${ext}`
    const destPath = path.join(UPLOADS_DIR, safeName)
    fs.writeFileSync(destPath, file.buffer)

    // Xóa file cũ nếu đã upload trước đó
    if (booking.minutesFile) {
      const oldPath = path.join(UPLOADS_DIR, booking.minutesFile)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    booking.minutesFile = safeName
    booking.minutesOriginalName = file.originalname   // lưu tên gốc để hiển thị
    await booking.save()

    return res.json({
      success: true,
      message: 'Nộp biên bản thành công',
      data: { fileName: safeName, originalName: file.originalname },
    })
  } catch (err) {
    console.error('[booking.uploadMinutes]', err)
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// GET /api/bookings/:id/minutes — tải biên bản về
async function downloadMinutes(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking || !booking.minutesFile) {
      return res.status(404).json({ success: false, message: 'Không có biên bản' })
    }
    const filePath = path.join(UPLOADS_DIR, booking.minutesFile)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File không tồn tại trên server' })
    }
    const displayName = booking.minutesOriginalName || booking.minutesFile
    res.download(filePath, displayName)
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// FIX: scheduleReminder dùng giờ Việt Nam (UTC+7) để tính đúng delay
function scheduleReminder(booking, userId) {
  // Parse theo giờ VN: thêm '+07:00' để JavaScript hiểu đúng timezone
  const meetingTime  = new Date(`${booking.date}T${booking.timeFrom}:00+07:00`)
  const reminderTime = new Date(meetingTime.getTime() - 15 * 60 * 1000)
  const delay        = reminderTime.getTime() - Date.now()

  if (delay > 0) {
    setTimeout(async () => {
      try {
        await Notification.create({
          userId,
          bookingId: booking._id,
          type: 'reminder',
          message: `Nhắc nhở: Cuộc họp "${booking.reason}" bắt đầu sau 15 phút lúc ${booking.timeFrom}`,
          scheduledAt: reminderTime,
        })
      } catch (err) {
        console.error('[scheduleReminder] Lỗi tạo notification:', err)
      }
    }, delay)
  }
}

module.exports = { create, getAll, getMy, remove, uploadMinutes, downloadMinutes }
