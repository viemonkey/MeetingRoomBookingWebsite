const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:    { type: String, required: true },
  team:        { type: String, required: true },
  room:        { type: String, enum: ['tang5', 'tang6'], required: true },
  reason:      { type: String, required: true, trim: true },
  date:        { type: String, required: true },   // YYYY-MM-DD
  timeFrom:    { type: String, required: true },   // HH:MM
  timeTo:      { type: String, required: true },   // HH:MM
  note:        { type: String, default: '' },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  minutesFile: { type: String, default: null },             // tên file lưu trên disk
  minutesOriginalName: { type: String, default: null },     // FIX: tên gốc để hiển thị
}, { timestamps: true })

bookingSchema.index({ date: 1, room: 1 })
bookingSchema.index({ userId: 1 })

// Virtual: tính trạng thái thời gian (múi giờ Việt Nam UTC+7)
bookingSchema.virtual('timeStatus').get(function() {
  const VN_OFFSET_MS = 7 * 60 * 60 * 1000
  const now    = new Date(Date.now() + VN_OFFSET_MS)
  const pad    = n => String(n).padStart(2, '0')
  const today  = `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())}`
  const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes()
  const toMin  = t => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m }

  if (this.date > today) return 'upcoming'
  if (this.date < today) return 'done'
  if (nowMin < toMin(this.timeFrom)) return 'upcoming'
  if (nowMin >= toMin(this.timeTo))  return 'done'
  return 'ongoing'
})

bookingSchema.set('toJSON',   { virtuals: true })
bookingSchema.set('toObject', { virtuals: true })

// Static: kiểm tra trùng giờ
bookingSchema.statics.findConflict = async function(room, date, timeFrom, timeTo, excludeId = null) {
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const from  = toMin(timeFrom)
  const to    = toMin(timeTo)

  const bookings = await this.find({ room, date })
  return bookings.find(b => {
    if (excludeId && b._id.toString() === excludeId.toString()) return false
    return from < toMin(b.timeTo) && to > toMin(b.timeFrom)
  }) || null
}

module.exports = mongoose.model('Booking', bookingSchema)
