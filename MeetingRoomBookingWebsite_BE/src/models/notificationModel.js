// Lưu danh sách thông báo cho từng user
const notifications = []
const { v4: uuidv4 } = require('uuid')

module.exports = {
  notifications,

  create({ userId, bookingId, type, message, scheduledAt }) {
    const n = {
      id: uuidv4(),
      userId,
      bookingId,
      type,       // 'reminder' | 'conflict' | 'success'
      message,
      scheduledAt,
      read: false,
      createdAt: new Date().toISOString(),
    }
    notifications.push(n)
    return n
  },

  findByUser(userId) {
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  markRead(id, userId) {
    const n = notifications.find(n => n.id === id && n.userId === userId)
    if (n) n.read = true
    return n
  },

  markAllRead(userId) {
    notifications.filter(n => n.userId === userId).forEach(n => { n.read = true })
  },

  unreadCount(userId) {
    return notifications.filter(n => n.userId === userId && !n.read).length
  },

  deleteByBooking(bookingId) {
    const idxs = notifications.reduce((acc, n, i) => {
      if (n.bookingId === bookingId) acc.push(i)
      return acc
    }, [])
    idxs.reverse().forEach(i => notifications.splice(i, 1))
  },
}
