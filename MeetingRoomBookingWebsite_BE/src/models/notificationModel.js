const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type:        { type: String, enum: ['reminder','success','conflict'], default: 'success' },
  message:     { type: String, required: true },
  scheduledAt: { type: Date, default: Date.now },
  read:        { type: Boolean, default: false },
}, { timestamps: true })

notificationSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
