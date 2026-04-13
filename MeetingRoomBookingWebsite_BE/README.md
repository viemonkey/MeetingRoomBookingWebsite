# Nexus Terminal BE v3.0 — MongoDB Atlas

## Bước 1: Tạo MongoDB Atlas (miễn phí)

1. Vào https://www.mongodb.com/atlas → Sign up
2. Tạo cluster → chọn **M0 Free**
3. Chọn region: **Singapore (ap-southeast-1)**
4. Tạo Database User:
   - Username: `nexus_admin`
   - Password: (tạo mật khẩu mạnh, copy lại)
5. Network Access → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
6. Vào cluster → Connect → Drivers → copy connection string

## Bước 2: Cập nhật file .env

Mở file `.env` trong BE, thay dòng MONGODB_URI:

```
MONGODB_URI=mongodb+srv://nexus_admin:MATKHAU_CUA_BAN@cluster0.xxxxx.mongodb.net/nexus?retryWrites=true&w=majority
```

Thay `nexus_admin`, `MATKHAU_CUA_BAN`, `cluster0.xxxxx` bằng thông tin thật của bạn.

## Bước 3: Cài đặt và chạy

```bash
# Copy toàn bộ file vào MeetingRoomBookingWebsite_BE (ghi đè)
# Sau đó:
npm install     # cài thêm mongoose
npm run dev
```

Terminal sẽ hiện:
```
✅ MongoDB kết nối thành công: cluster0.xxxxx.mongodb.net
🚀 Nexus Terminal BE v3.0 → http://localhost:5000
```

## Cấu trúc file cần copy

```
src/
  config/
    database.js          ← KẾT NỐI MONGODB (MỚI)
  models/
    userModel.js         ← GHI ĐÈ (dùng Mongoose)
    bookingModel.js      ← GHI ĐÈ (dùng Mongoose)
    notificationModel.js ← GHI ĐÈ (dùng Mongoose)
  controllers/
    authController.js    ← GHI ĐÈ
    bookingController.js ← GHI ĐÈ
    notificationController.js ← GHI ĐÈ
  routes/                ← GHI ĐÈ tất cả
  middleware/            ← GHI ĐÈ tất cả
  index.js               ← GHI ĐÈ
package.json             ← GHI ĐÈ (thêm mongoose)
.env                     ← CẬP NHẬT MONGODB_URI
```

## Thay đổi chính so với v2.0

| Trước (RAM)                  | Sau (MongoDB)                    |
|------------------------------|----------------------------------|
| `const users = []`           | `mongoose.model('User', schema)` |
| `const bookings = []`        | `mongoose.model('Booking', ...)`  |
| Mất hết khi restart server   | Lưu vĩnh viễn trên cloud        |
| `users.push(user)`           | `await User.create(data)`        |
| `users.find(u => ...)`       | `await User.findOne({ ... })`    |
