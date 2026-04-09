'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/booking')
  }

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden selection:bg-[#71a9e8] selection:text-[#003d6a]" style={{backgroundColor:'#f0f2f5'}}>
      {/* Background Layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{background:'linear-gradient(to top right, #f0f2f5, #e5e9f0, #f8f9fc)'}}></div>
        <div className="absolute inset-0 grid-pattern opacity-100"></div>
        <div className="absolute top-[-10%] right-[15%] w-[300px] h-[300px] border border-[rgba(31,97,156,0.05)] rotate-45 pointer-events-none"></div>
        <div className="absolute bottom-[-5%] left-[10%] w-[300px] h-[300px] border border-[rgba(31,97,156,0.05)] rotate-45 pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vh] opacity-70 -z-10" style={{background:'radial-gradient(circle at center, rgba(31,97,156,0.08) 0%, rgba(240,242,245,0) 70%)', filter:'blur(120px)'}}></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vh] opacity-50 -z-10" style={{background:'radial-gradient(circle at center, rgba(31,97,156,0.08) 0%, rgba(240,242,245,0) 70%)', filter:'blur(120px)'}}></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6">
        {/* Branding */}
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase" style={{letterSpacing:'-0.05em'}}>
            Nexus Terminal
          </h1>
          <p className="text-[10px] tracking-[0.4em] font-medium uppercase" style={{color:'rgba(31,97,156,0.6)'}}>
            Architectural Neural Interface
          </p>
        </div>

        {/* Login Card */}
        <section className="glass-card rounded-xl p-10 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
          <header className="mb-10 relative z-10">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Truy cập hệ thống</h2>
            <p className="text-sm text-slate-500 font-light mt-1">Xác thực phiên làm việc để tiếp tục.</p>
          </header>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-2 group">
              <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500 ml-1" htmlFor="email">Email công việc</label>
              <input
                className="w-full bg-white/40 border border-slate-200 rounded-lg py-4 px-5 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all input-focus-glow"
                id="email" placeholder="name@nexus.terminal" required type="email"
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-end px-1">
                <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500" htmlFor="password">Mật khẩu</label>
                <a className="text-[10px] uppercase tracking-wider font-bold transition-colors duration-300" style={{color:'rgba(31,97,156,0.7)'}} href="#">Quên mật khẩu?</a>
              </div>
              <input
                className="w-full bg-white/40 border border-slate-200 rounded-lg py-4 px-5 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all input-focus-glow"
                id="password" placeholder="••••••••••••" required type="password"
              />
            </div>

            <div className="pt-4">
              <button className="w-full btn-gradient py-4 rounded-lg text-white font-bold text-sm tracking-wide shadow-lg hover:brightness-105 hover:-translate-y-px active:translate-y-px transition-all duration-300" type="submit">
                Đăng nhập
              </button>
            </div>
          </form>

          <footer className="mt-10 text-center relative z-10">
            <p className="text-xs text-slate-500 font-medium">
              Chưa có tài khoản?{' '}
              <Link className="text-[#1f619c] font-bold hover:underline transition-colors ml-1" href="/register">Đăng ký ngay</Link>
            </p>
          </footer>
        </section>

        {/* Status Footer */}
        <div className="mt-12 flex justify-center items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{boxShadow:'0 0 8px rgba(16,185,129,0.3)'}}></span>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Hệ thống: Đang hoạt động</span>
          </div>
          <span className="h-px w-8 bg-slate-300"></span>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-slate-400" style={{fontSize:'14px'}}>verified_user</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Bảo mật xác minh</span>
          </div>
        </div>
      </main>
    </div>
  )
}
