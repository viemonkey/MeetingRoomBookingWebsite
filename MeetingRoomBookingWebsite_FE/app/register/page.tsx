'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); router.push('/booking') }

  return (
    <body className="bg-slate-100 text-[#191c1e] min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 technical-grid opacity-40"></div>
        <div className="absolute -top-1/4 -left-1/4 w-[1000px] h-[1000px] blur-3xl" style={{background:'radial-gradient(circle at 50% 50%, rgba(31,97,156,0.08) 0%, rgba(248,249,255,0) 70%)'}}></div>
        <div className="absolute top-1/2 -right-1/4 w-[800px] h-[800px] blur-3xl opacity-80" style={{background:'radial-gradient(circle at 50% 50%, rgba(31,97,156,0.08) 0%, rgba(248,249,255,0) 70%)'}}></div>
      </div>

      <header className="relative z-10 px-12 py-8 flex justify-center lg:justify-start">
        <div className="text-2xl font-bold tracking-tighter text-[#1f619c]">Nexus Terminal</div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="glass-panel w-full max-w-[480px] rounded-xl p-8 lg:p-12 shadow-xl shadow-slate-200/50">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Khởi tạo tài khoản</h1>
            <p className="text-slate-600 text-sm font-medium">Thiết lập thông tin đăng nhập của bạn để truy cập Nexus.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Họ và tên</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'20px'}}>person</span>
                <input className="w-full bg-white/60 border border-white/20 rounded-lg py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none" placeholder="Nguyễn Văn A" type="text" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Email công việc</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'20px'}}>alternate_email</span>
                <input className="w-full bg-white/60 border border-white/20 rounded-lg py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none" placeholder="name@company.com" type="email" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Phòng ban</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'20px'}}>hub</span>
                <select className="w-full bg-white/60 border border-white/20 rounded-lg py-3.5 pl-12 pr-10 text-slate-900 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none appearance-none">
                  <option value="" disabled>Chọn phòng ban</option>
                  <option value="engineering">Kỹ thuật &amp; Giao thức cốt lõi</option>
                  <option value="security">Trung tâm điều hành an ninh</option>
                  <option value="data">Trí tuệ dữ liệu</option>
                  <option value="admin">Quản trị hệ thống</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{fontSize:'20px'}}>expand_more</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{color:'rgba(31,97,156,0.8)'}}>Mật khẩu</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize:'20px'}}>lock</span>
                <input className="w-full bg-white/60 border border-white/20 rounded-lg py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[rgba(31,97,156,0.2)] focus:bg-white/90 transition-all outline-none" placeholder="••••••••••••" type="password" />
              </div>
            </div>

            <button className="w-full bg-[#1f619c] hover:bg-[#71a9e8] text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group mt-8" type="submit">
              <span>Tạo tài khoản</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{fontSize:'20px'}}>arrow_forward</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
            <p className="text-slate-500 text-sm">
              Đã có tài khoản?{' '}
              <Link className="text-[#1f619c] font-semibold hover:text-[#71a9e8] transition-colors ml-1" href="/login">Đăng nhập hệ thống</Link>
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

      <div className="absolute bottom-10 left-10 hidden xl:block">
        <div className="flex items-center gap-4" style={{color:'rgba(31,97,156,0.2)'}}>
          <div className="w-24 h-px bg-current"></div>
          <span className="text-[10px] tracking-[0.5em] font-bold uppercase">Hệ thống xác thực V4.02</span>
        </div>
      </div>
    </body>
  )
}
