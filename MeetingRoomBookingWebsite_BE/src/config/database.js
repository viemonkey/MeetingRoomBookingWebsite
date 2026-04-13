const mongoose = require('mongoose')

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`✅ MongoDB kết nối thành công: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB kết nối thất bại:', err.message)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB mất kết nối')
})

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB kết nối lại thành công')
})

module.exports = connectDB
