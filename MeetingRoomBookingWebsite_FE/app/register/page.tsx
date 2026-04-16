'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Settings, Building2 } from 'lucide-react'
import { registerApi, saveToken, saveUser } from '@/lib/authService'

const departments = [
  'Kỹ thuật', 'Thiết kế', 'Kinh doanh', 'Nhân sự',
  'Marketing', 'Tài chính', 'Data', 'Product',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ fullName: '', email: '', department: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  // FIX: trạng thái đăng ký thành công → hiện màn chờ duyệt
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({}); setGlobalError('')
    setLoading(true)
    try {
      const res = await registerApi({
        fullName:   form.fullName,
        email:      form.email,
        department: form.department,   // gửi đúng giá trị (lowercase từ select)
        password:   form.password,
      })

      if (res.success && res.data) {
        saveToken(res.data.token)
        saveUser(res.data.user)
        // FIX: không redirect vào /booking ngay — hiện màn thông báo chờ duyệt
        setRegistered(true)
      } else if (res.errors) {
        const e: Record<string, string> = {}
        res.errors.forEach((err: any) => { e[err.field] = err.message })
        setErrors(e)
      } else {
        setGlobalError(res.message || 'Đăng ký thất bại')
      }
    } catch {
      setGlobalError('Không thể kết nối server')
    } finally {
      setLoading(false)
    }
  }

  // FIX: Màn chờ duyệt sau khi đăng ký thành công
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm text-center page-transition">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mx-auto mb-6">
            <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Tài khoản của bạn đang chờ admin phê duyệt.<br />
            Bạn sẽ nhận thông báo ngay khi được duyệt.
          </p>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-8 text-left">
            <p className="text-xs font-semibold text-amber-700 mb-1">Trong thời gian chờ, bạn có thể:</p>
            <ul className="text-xs text-amber-600 space-y-1 mt-2">
              <li>• Xem lịch trình phòng họp</li>
              <li>• Kiểm tra thông báo khi được duyệt</li>
              <li>• Liên hệ admin nếu cần gấp</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/booking')}
            className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            Vào trang chủ
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Đã có tài khoản khác?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #e8f5f0 0%, #f4f0fd 50%, #ede9fe 100%)' }}
      >
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full opacity-35"
          style={{ background: 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)' }} />
        <div className="absolute bottom-16 left-12 w-60 h-60 rounded-full opacity-35"
          style={{ background: 'radial-gradient(circle, #6ee7b7 0%, transparent 70%)' }} />

        <div className="relative z-10 px-14 max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-xl font-bold text-white shadow-lg">V</div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Tham gia <span className="text-primary">Viên Chi Bảo</span>
          </h2>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            Tạo tài khoản để bắt đầu đặt phòng họp, quản lý lịch trình và cộng tác hiệu quả cùng đội nhóm.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8">
            {[
              { icon: User,      label: 'Đăng ký\nnhanh chóng' },
              { icon: Building2, label: 'Quản lý\nphòng ban' },
              { icon: Lock,      label: 'Bảo mật\ntuyệt đối' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 border border-white shadow-sm">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-[11px] text-gray-400 whitespace-pre-line text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm page-transition">
          <h1 className="text-2xl font-bold text-gray-900">Khởi tạo tài khoản</h1>
          <p className="mt-1 text-sm text-gray-400">Thiết lập thông tin để truy cập hệ thống</p>

          {globalError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-500">{globalError}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="text" placeholder="Nguyễn Văn A" value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className={`h-11 w-full pl-10 pr-4 rounded-lg border bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${errors.fullName ? 'border-red-300' : 'border-gray-200'}`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Email công việc</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="email" placeholder="name@company.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={`h-11 w-full pl-10 pr-4 rounded-lg border bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Phòng ban */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Phòng ban</label>
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className={`h-11 w-full pl-10 pr-4 rounded-lg border bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none ${errors.department ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <option value="">Chọn phòng ban</option>
                  {/* FIX: value dùng chữ thường để khớp với BE validator */}
                  {departments.map(d => (
                    <option key={d} value={d.toLowerCase()}>{d}</option>
                  ))}
                </select>
              </div>
              {errors.department && <p className="mt-1 text-xs text-red-400">{errors.department}</p>}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="password" placeholder="Ít nhất 8 ký tự" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`h-11 w-full pl-10 pr-4 rounded-lg border bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              {loading
                ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Đang xử lý...</>
                : 'Tạo tài khoản →'
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
