const Notification = require('../models/notificationModel')

// GET /api/notifications
async function getAll(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50)
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false })
    return res.json({ success: true, data: notifications, unread })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// PATCH /api/notifications/:id/read
async function markRead(req, res) {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    )
    if (!n) return res.status(404).json({ success: false, message: 'Không tìm thấy' })
    return res.json({ success: true, data: n })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

// PATCH /api/notifications/read-all
async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true })
    return res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

module.exports = { getAll, markRead, markAllRead }
