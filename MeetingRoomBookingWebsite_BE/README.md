# Nexus Terminal — Backend (ExpressJS)

## Cấu trúc

```
MeetingRoomBookingWebsite_BE/
├── src/
│   ├── index.js                  ← Entry point, khởi động server
│   ├── routes/
│   │   └── authRoutes.js         ← Định nghĩa các route auth
│   ├── controllers/
│   │   └── authController.js     ← Logic xử lý register/login
│   ├── middleware/
│   │   ├── authMiddleware.js     ← Xác thực JWT token
│   │   └── validators.js         ← Validate input đầu vào
│   └── models/
│       └── userModel.js          ← In-memory store (thay DB sau)
├── .env                          ← Biến môi trường (KHÔNG commit)
├── .env.example                  ← Mẫu biến môi trường
└── package.json
```

---

## Cài đặt & chạy

```bash
cd MeetingRoomBookingWebsite_BE
npm install
npm run dev       # chạy dev với nodemon
# hoặc
npm start         # chạy production
```

Server chạy tại: **http://localhost:5000**

---

## API Endpoints

| Method | Endpoint           | Mô tả                        | Auth cần? |
|--------|--------------------|------------------------------|-----------|
| POST   | /api/auth/register | Đăng ký tài khoản mới        | Không     |
| POST   | /api/auth/login    | Đăng nhập                    | Không     |
| GET    | /api/auth/me       | Lấy thông tin user hiện tại  | Có (JWT)  |
| POST   | /api/auth/logout   | Đăng xuất                    | Có (JWT)  |
| GET    | /api/health        | Kiểm tra server               | Không     |

---

## Ví dụ request

### Đăng ký
```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@company.com",
  "department": "engineering",
  "password": "matkhau123"
}
```

### Đăng nhập
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "nguyenvana@company.com",
  "password": "matkhau123"
}
```

### Lấy thông tin user (cần token)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token_nhận_được_sau_login>
```

---

## Tích hợp với FE (NextJS)

### Bước 1: Copy file vào FE project

| File BE                    | Copy vào FE                              |
|----------------------------|------------------------------------------|
| `fe-auth-service.ts`       | `MeetingRoomBookingWebsite_FE/lib/authService.ts` |
| `fe-login-page.tsx`        | `MeetingRoomBookingWebsite_FE/app/login/page.tsx` |
| `fe-register-page.tsx`     | `MeetingRoomBookingWebsite_FE/app/register/page.tsx` |

### Bước 2: Thêm biến môi trường FE

Tạo file `.env.local` trong folder FE:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Bước 3: Chạy cả 2 server

Terminal 1 (BE):
```bash
cd MeetingRoomBookingWebsite_BE
npm run dev
# → http://localhost:5000
```

Terminal 2 (FE):
```bash
cd MeetingRoomBookingWebsite_FE
npm run dev
# → http://localhost:3000
```

---

## Nâng cấp sau

- Thay `userModel.js` (in-memory) bằng **MongoDB** hoặc **PostgreSQL**
- Thêm **refresh token** để gia hạn session
- Thêm **rate limiting** chống brute force
- Thêm **email verification** khi đăng ký
