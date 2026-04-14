'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Settings, CalendarPlus, Building2 } from 'lucide-react'
import { registerApi, saveToken, saveUser } from '@/lib/authService'

const departments = ['Kỹ thuật', 'Thiết kế', 'Kinh doanh', 'Nhân sự', 'Marketing', 'Tài chính', 'Data', 'Product']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', department: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({}); setGlobalError('')
    setLoading(true)
    try {
      const res = await registerApi({ fullName: form.fullName, email: form.email, department: form.department, password: form.password })
      if (res.success && res.data) {
        saveToken(res.data.token); saveUser(res.data.user); router.push('/booking')
      } else if (res.errors) {
        const e: Record<string, string> = {}
        res.errors.forEach((err: any) => { e[err.field] = err.message })
        setErrors(e)
      } else { setGlobalError(res.message || 'Đăng ký thất bại') }
    } catch { setGlobalError('Không thể kết nối server') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #e8f5f0 0%, #f4f0fd 50%, #ede9fe 100%)' }}>
        {/* Blobs */}
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
              { icon: User, label: 'Đăng ký\nnhanh chóng' },
              { icon: Building2, label: 'Quản lý\nphòng ban' },
              { icon: Lock, label: 'Bảo mật\ntuyệt đối' },
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
            {[
              { key: 'fullName', label: 'Họ và tên', icon: User, placeholder: 'Nguyễn Văn A', type: 'text' },
              { key: 'email', label: 'Email công việc', icon: Mail, placeholder: 'name@company.com', type: 'email' },
            ].map(f => (
              <div key={f.key}>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className={`h-11 w-full pl-10 pr-4 rounded-lg border bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${errors[f.key] ? 'border-red-300' : 'border-gray-200'}`} />
                </div>
                {errors[f.key] && <p className="mt-1 text-xs text-red-400">{errors[f.key]}</p>}
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Phòng ban</label>
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className={`h-11 w-full pl-10 pr-4 rounded-lg border bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none ${errors.department ? 'border-red-300' : 'border-gray-200'}`}>
                  <option value="">Chọn phòng ban</option>
                  {departments.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                </select>
              </div>
              {errors.department && <p className="mt-1 text-xs text-red-400">{errors.department}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input type="password" placeholder="••••••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`h-11 w-full pl-10 pr-4 rounded-lg border bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${errors.password ? 'border-red-300' : 'border-gray-200'}`} />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-sm">
              {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Đang xử lý...</> : 'Tạo tài khoản →'}
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
