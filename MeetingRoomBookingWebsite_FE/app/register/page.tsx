'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerApi, saveToken, saveUser } from '@/lib/authService'

const DEPARTMENTS = [
  { value: 'engineering', label: 'Kỹ thuật & Giao thức cốt lõi' },
  { value: 'security',    label: 'Trung tâm điều hành an ninh' },
  { value: 'data',        label: 'Trí tuệ dữ liệu' },
  { value: 'admin',       label: 'Quản trị hệ thống' },
  { value: 'marketing',   label: 'Marketing' },
  { value: 'hr',          label: 'Nhân sự (HR)' },
  { value: 'product',     label: 'Sản phẩm' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName]     = useState('')
  const [email, setEmail]           = useState('')
  const [department, setDepartment] = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGlobalError('')
    setLoading(true)
    try {
      const res = await registerApi({ fullName, email, department, password })
      if (res.success && res.data) {
        saveToken(res.data.token)
        saveUser(res.data.user)
        router.push('/booking')
      } else if (res.errors) {
        const fieldErrors: Record<string, string> = {}
        res.errors.forEach(e => { fieldErrors[e.field] = e.message })
        setErrors(fieldErrors)
      } else {
        setGlobalError(res.message || 'Đăng ký thất bại')
      }
    } catch {
      setGlobalError('Không thể kết nối server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-100 text-[#191c1e] min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 technical-grid opacity-40"></div>
        <div className="absolute -top-1/4 -left-1/4 w-[1000px] h-[1000px] blur-3xl" style={{background:'radial-gradient(circle at 50% 50%, rgba(31,97,156,0.08) 0%, rgba(248,249,255,0) 70%)'}}></div>
      </div>

      <header className="relative z-10 px-12 py-8 flex justify-center lg:justify-start">
        <div className="text-2xl font-bold tracking-tighter text-[#1f619c]">Nexus Terminal</div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="glass-panel w-full max-w-[480px] rounded-xl p-8 lg:p-12 shadow-xl shadow-slate-200/50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Khởi tạo tài khoản</h1>
            <p className="text-slate-600 text-sm font-medium">Thiết lập thông tin đăng nhập của bạn để truy cập Nexus.</p>
          </div>

          {globalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500" style={{fontSize:'16px'}}>error</span>
              <p className="text-red-600 text-sm">{globalError}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Họ và tên</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'18px'}}>person</span>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  className={`w-full bg-white/60 border rounded-lg py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none ${errors.fullName ? 'border-red-300 bg-red-50/60' : 'border-white/20'}`}
                  placeholder="Nguyễn Văn A" type="text" />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 ml-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Email công việc</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'18px'}}>alternate_email</span>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  className={`w-full bg-white/60 border rounded-lg py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none ${errors.email ? 'border-red-300 bg-red-50/60' : 'border-white/20'}`}
                  placeholder="name@company.com" type="email" />
              </div>
              {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
            </div>

            {/* Phòng ban */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Phòng ban</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'18px'}}>hub</span>
                <select value={department} onChange={e => setDepartment(e.target.value)}
                  className={`w-full bg-white/60 border rounded-lg py-3.5 pl-12 pr-10 text-slate-900 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none appearance-none ${errors.department ? 'border-red-300 bg-red-50/60' : 'border-white/20'}`}>
                  <option value="" disabled>Chọn phòng ban</option>
                  {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{fontSize:'18px'}}>expand_more</span>
              </div>
              {errors.department && <p className="text-xs text-red-500 ml-1">{errors.department}</p>}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'18px'}}>lock</span>
                <input value={password} onChange={e => setPassword(e.target.value)}
                  className={`w-full bg-white/60 border rounded-lg py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none ${errors.password ? 'border-red-300 bg-red-50/60' : 'border-white/20'}`}
                  placeholder="••••••••••••" type="password" />
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1f619c] hover:bg-[#1a5289] text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <><span className="material-symbols-outlined animate-spin" style={{fontSize:'18px'}}>progress_activity</span> Đang tạo tài khoản...</>
              ) : (
                <><span>Tạo tài khoản</span><span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{fontSize:'18px'}}>arrow_forward</span></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
            <p className="text-slate-500 text-sm">
              Đã có tài khoản?{' '}
              <Link className="text-[#1f619c] font-semibold hover:underline transition-colors ml-1" href="/login">
                Đăng nhập hệ thống
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-8 flex flex-col md:flex-row justify-between items-center px-12 mt-auto">
        <div className="text-[10px] tracking-[0.2em] font-light text-slate-400 uppercase">© 2024 NEXUS TERMINAL. BẢN QUYỀN ĐÃ ĐƯỢC BẢO LƯU.</div>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a className="text-[10px] tracking-[0.2em] font-light text-slate-400 hover:text-[#1f619c] transition-colors" href="#">Giao thức</a>
          <a className="text-[10px] tracking-[0.2em] font-light text-slate-400 hover:text-[#1f619c] transition-colors" href="#">Bảo mật</a>
          <a className="text-[10px] tracking-[0.2em] font-light text-slate-400 hover:text-[#1f619c] transition-colors" href="#">Nút mạng</a>
        </div>
      </footer>
    </div>
  )
}
