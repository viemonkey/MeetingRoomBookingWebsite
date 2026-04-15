// Chạy 1 lần để tạo tài khoản admin:
// node src/createAdmin.js

require('dotenv').config()
const mongoose = require('mongoose')
const User     = require('./models/userModel')

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Kết nối MongoDB')

  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@vienchibao.vn'
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2024!'
  const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Admin'

  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role   = 'admin'
      existing.status = 'approved'
      await existing.save()
      console.log(`✅ Đã nâng cấp ${ADMIN_EMAIL} thành admin`)
    } else {
      console.log(`ℹ️  Admin ${ADMIN_EMAIL} đã tồn tại`)
    }
    process.exit(0)
  }

  await User.create({
    fullName:   ADMIN_NAME,
    email:      ADMIN_EMAIL,
    department: 'admin',
    password:   ADMIN_PASSWORD,
    role:       'admin',
    status:     'approved',
  })

  console.log(`✅ Tạo tài khoản admin thành công!`)
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log(`   Password: ${ADMIN_PASSWORD}`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
