const { v4: uuidv4 } = require('uuid')

const bookings = []

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function getStatus(date, timeFrom, timeTo) {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const today = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
  const nowMin = now.getHours() * 60 + now.getMinutes()

  if (date > today) return 'upcoming'
  if (date < today) return 'done'
  if (nowMin < toMinutes(timeFrom)) return 'upcoming'
  if (nowMin >= toMinutes(timeTo)) return 'done'
  return 'ongoing'
}

module.exports = {
  bookings,

  findConflict(room, date, timeFrom, timeTo, excludeId = null) {
    const from = toMinutes(timeFrom)
    const to   = toMinutes(timeTo)
    return bookings.find(b => {
      if (b.id === excludeId) return false
      if (b.room !== room || b.date !== date) return false
      return from < toMinutes(b.timeTo) && to > toMinutes(b.timeFrom)
    }) || null
  },

  create({ userId, userName, team, room, reason, date, timeFrom, timeTo, note }) {
    const booking = {
      id: uuidv4(),
      userId, userName, team,
      room, reason, date, timeFrom, timeTo,
      note: note || '',
      status: getStatus(date, timeFrom, timeTo),
      minutesFile: null,
      createdAt: new Date().toISOString(),
    }
    bookings.push(booking)
    return booking
  },

  findById(id) {
    return bookings.find(b => b.id === id) || null
  },

  findByUser(userId) {
    return bookings
      .filter(b => b.userId === userId)
      .map(b => ({ ...b, status: getStatus(b.date, b.timeFrom, b.timeTo) }))
      .sort((a, b) => b.date.localeCompare(a.date) || b.timeFrom.localeCompare(a.timeFrom))
  },

  findByDate(date) {
    return bookings
      .filter(b => b.date === date)
      .map(b => ({ ...b, status: getStatus(b.date, b.timeFrom, b.timeTo) }))
      .sort((a, b) => a.timeFrom.localeCompare(b.timeFrom))
  },

  findAll() {
    return bookings.map(b => ({ ...b, status: getStatus(b.date, b.timeFrom, b.timeTo) }))
  },

  deleteById(id) {
    const idx = bookings.findIndex(b => b.id === id)
    if (idx === -1) return false
    bookings.splice(idx, 1)
    return true
  },

  updateMinutes(id, fileName) {
    const b = this.findById(id)
    if (!b) return null
    b.minutesFile = fileName
    return b
  },

  refreshStatuses() {
    bookings.forEach(b => { b.status = getStatus(b.date, b.timeFrom, b.timeTo) })
  },
}
