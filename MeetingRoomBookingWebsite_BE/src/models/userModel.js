// In-memory store — thay bằng database (MongoDB/PostgreSQL) sau
const users = []

module.exports = {
  users,

  findByEmail(email) {
    return users.find(u => u.email === email.toLowerCase()) || null
  },

  findById(id) {
    return users.find(u => u.id === id) || null
  },

  create(userData) {
    const user = {
      id: require('uuid').v4(),
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    return user
  },

  // Trả về user không có password
  safe(user) {
    if (!user) return null
    const { password, ...safe } = user
    return safe
  },
}
