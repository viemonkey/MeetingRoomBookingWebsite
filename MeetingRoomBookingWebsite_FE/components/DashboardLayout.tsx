'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getUser, logoutApi } from '@/lib/authService'
import NotificationBell from './NotificationBell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path   = usePathname()
  const router = useRouter()
  const user   = getUser()

  const navItems = [
    { href:'/booking',  icon:'calendar_add_on', label:'Đặt phòng'  },
    { href:'/schedule', icon:'event_note',       label:'Lịch trình' },
    { href:'/history',  icon:'history',          label:'Lịch sử'    },
  ]

  async function handleLogout() {
    await logoutApi()
    router.push('/login')
  }

  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() || 'NT'

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden">
      {/* TopNavBar */}
      <header className="bg-[#f7f9fb] flex justify-between items-center w-full px-8 py-3 h-16 fixed top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black text-[#001148] uppercase tracking-tighter">Nexus Terminal</span>
          <div className="hidden md:flex items-center bg-[#eceef0] px-4 py-2 rounded-md gap-3 w-72">
            <span className="material-symbols-outlined text-[#43474f]" style={{fontSize:'18px'}}>search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none" placeholder="Tìm kiếm phòng..." />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`text-sm font-bold tracking-tight py-5 transition-colors ${path === item.href ? 'text-[#004ced] border-b-2 border-[#004ced]' : 'text-[#43474f] hover:text-[#001148]'}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <NotificationBell />
          <button className="material-symbols-outlined text-[#43474f] p-2 rounded-full hover:bg-[#eceef0] transition-colors" style={{fontSize:'20px'}}>settings</button>
          <button onClick={handleLogout} title="Đăng xuất"
            className="w-8 h-8 rounded-full bg-[#002277] flex items-center justify-center text-white text-xs font-bold hover:bg-[#001148] transition-colors">
            {initials}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 z-40 w-64 bg-[#f2f4f6]/70 backdrop-blur-xl hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#002277] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#001148] truncate">{user?.fullName || 'Người dùng'}</p>
              <p className="text-[11px] text-[#43474f] truncate">{user?.department || 'Nội bộ'}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => {
              const active = path === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-semibold ${active ? 'bg-white text-[#004ced] shadow-sm border-l-4 border-[#004ced]' : 'text-[#43474f] hover:bg-white/50'}`}>
                  <span className="material-symbols-outlined" style={{fontSize:'20px'}}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto pt-8 border-t border-outline-variant/10 mt-8">
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-md text-[#43474f] hover:bg-red-50 hover:text-red-600 transition-all w-full text-sm font-semibold">
              <span className="material-symbols-outlined" style={{fontSize:'20px'}}>logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 pt-16">{children}</main>

      {/* Footer */}
      <footer className="lg:ml-64 bg-[#f7f9fb] border-t border-[#43474f]/10 flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] tracking-widest uppercase text-[#43474f]">Trạng thái hệ thống: Hoạt động • v2.0.0</span>
        </div>
        <div className="flex gap-8">
          <a className="text-[10px] tracking-widest uppercase text-[#43474f] opacity-60 hover:text-[#004ced]" href="#">Chính sách bảo mật</a>
          <a className="text-[10px] tracking-widest uppercase text-[#43474f] opacity-60 hover:text-[#004ced]" href="#">Hỗ trợ</a>
        </div>
      </footer>
    </div>
  )
}
