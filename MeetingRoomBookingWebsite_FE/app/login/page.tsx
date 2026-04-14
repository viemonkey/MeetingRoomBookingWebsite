'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock } from 'lucide-react'
import { loginApi, saveToken, saveUser } from '@/lib/authService'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginApi({ email, password })
      if (res.success && res.data) {
        saveToken(res.data.token)
        saveUser(res.data.user)
        router.push('/booking')
      } else {
        setError(res.message || 'Email hoặc mật khẩu không đúng')
      }
    } catch {
      setError('Không thể kết nối server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — light gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #e8f5f0 0%, #f0f9f6 40%, #ede9fe 100%)' }}>
        {/* Blobs */}
        <div className="absolute top-16 left-16 w-64 h-64 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #6ee7b7 0%, transparent 70%)' }} />
        <div className="absolute bottom-24 right-12 w-80 h-80 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)' }} />

        <div className="relative z-10 px-14 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-base font-bold text-white shadow-md">V</div>
            <span className="text-xl font-bold text-gray-800">Viên Chi Bảo</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Quản lý phòng họp<br />
            <span className="text-primary">thông minh.</span>
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed text-sm">
            Đặt phòng nhanh chóng, theo dõi lịch trình và quản lý hiệu quả không gian làm việc của bạn.
          </p>
          <div className="mt-10 flex gap-8">
            <div>
              <p className="text-3xl font-bold text-primary">2</p>
              <p className="text-xs text-gray-400 mt-1">Phòng họp</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-xs text-gray-400 mt-1">Hỗ trợ</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-xs text-gray-400 mt-1">Bảo mật</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm page-transition">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">V</div>
            <span className="text-lg font-bold text-gray-800">Viên Chi Bảo</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Chào mừng trở lại</h1>
          <p className="mt-1 text-sm text-gray-400">Đăng nhập để quản lý phòng họp</p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-500 font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input type="email" placeholder="email@vienchibao.vn" value={email} onChange={e => setEmail(e.target.value)} required
                  className="h-11 w-full pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">Mật khẩu</label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">Quên?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  className="h-11 w-full pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 shadow-sm">
              {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Đang xử lý...</> : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
