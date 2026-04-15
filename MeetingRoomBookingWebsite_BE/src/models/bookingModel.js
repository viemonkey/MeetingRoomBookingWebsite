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
  minutesFile: { type: String, default: null },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true })

// Index để query nhanh theo ngày + phòng
bookingSchema.index({ date: 1, room: 1 })
bookingSchema.index({ userId: 1 })

// Virtual: tính trạng thái thời gian
bookingSchema.virtual('timeStatus').get(function() {
  const now   = new Date()
  const pad   = n => String(n).padStart(2,'0')
  const today = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const toMin  = t => { const [h,m] = t.split(':').map(Number); return h*60+m }

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
  const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m }
  const from  = toMin(timeFrom)
  const to    = toMin(timeTo)

  const bookings = await this.find({ room, date, status: { $ne: 'rejected' } })
  return bookings.find(b => {
    if (excludeId && b._id.toString() === excludeId.toString()) return false
    return from < toMin(b.timeTo) && to > toMin(b.timeFrom)
  }) || null
}

module.exports = mongoose.model('Booking', bookingSchema)
