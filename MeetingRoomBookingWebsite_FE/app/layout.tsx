import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Viên Chi Bảo — Đặt phòng họp',
  description: 'Hệ thống quản lý phòng họp nội bộ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
