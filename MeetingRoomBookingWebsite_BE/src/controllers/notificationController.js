const NotifModel = require('../models/notificationModel')

// GET /api/notifications
function getAll(req, res) {
  const data = NotifModel.findByUser(req.user.id)
  const unread = NotifModel.unreadCount(req.user.id)
  return res.json({ success: true, data, unread })
}

// PATCH /api/notifications/:id/read
function markRead(req, res) {
  const n = NotifModel.markRead(req.params.id, req.user.id)
  if (!n) return res.status(404).json({ success: false, message: 'Không tìm thấy' })
  return res.json({ success: true, data: n })
}

// PATCH /api/notifications/read-all
function markAllRead(req, res) {
  NotifModel.markAllRead(req.user.id)
  return res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' })
}

module.exports = { getAll, markRead, markAllRead }
