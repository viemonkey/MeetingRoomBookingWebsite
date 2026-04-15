const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  fullName:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: { type: String, required: true },
  password:   { type: String, required: true, select: false },

  // THÊM MỚI: phân quyền
  role:       { type: String, enum: ['member', 'admin'], default: 'member' },

  // THÊM MỚI: trạng thái duyệt
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

  // THÊM MỚI: lý do từ chối (admin điền)
  rejectReason: { type: String, default: '' },
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

// Kiểm tra có quyền đặt phòng không
userSchema.methods.canBook = function() {
  return this.role === 'admin' || this.status === 'approved'
}

module.exports = mongoose.model('User', userSchema, 'users')
