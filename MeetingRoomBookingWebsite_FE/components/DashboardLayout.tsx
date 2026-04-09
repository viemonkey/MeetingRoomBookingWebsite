'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()

  const navItems = [
    { href: '/booking', icon: 'calendar_add_on', label: 'Đặt phòng' },
    { href: '/schedule', icon: 'event_note', label: 'Lịch trình' },
    { href: '/history', icon: 'history', label: 'Lịch sử' },
  ]

  const topNavItems = [
    { href: '/booking', label: 'Đặt phòng họp' },
    { href: '/schedule', label: 'Lịch trình' },
    { href: '/history', label: 'Danh bạ' },
  ]

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden">
      {/* TopNavBar */}
      <header className="bg-[#f7f9fb] flex justify-between items-center w-full px-8 py-3 h-16 fixed top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black text-[#001148] uppercase tracking-tighter">Nexus Terminal</span>
          <div className="hidden md:flex items-center bg-[#eceef0] px-4 py-2 rounded-md gap-3 w-80">
            <span className="material-symbols-outlined text-[#43474f]" style={{fontSize:'18px'}}>search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium outline-none" placeholder="Tìm kiếm phòng hoặc nhóm..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            {topNavItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`text-sm font-bold tracking-tight py-5 transition-colors ${
                  path === item.href
                    ? 'text-[#004ced] border-b-2 border-[#004ced]'
                    : 'text-[#43474f] hover:bg-[#e0e3e5] py-1 px-2 rounded'
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-[#43474f] p-2 rounded-full hover:bg-[#eceef0] transition-colors" style={{fontSize:'20px'}}>notifications</button>
            <button className="material-symbols-outlined text-[#43474f] p-2 rounded-full hover:bg-[#eceef0] transition-colors" style={{fontSize:'20px'}}>settings</button>
            <div className="w-8 h-8 rounded-full bg-[#002277] flex items-center justify-center text-white text-xs font-bold">NT</div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-16 bottom-0 z-40 w-64 bg-[#f2f4f6]/70 backdrop-blur-xl hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#eceef0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#001148]" style={{fontSize:'20px'}}>apartment</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#001148]">The Executive Flow</p>
              <p className="text-[11px] font-semibold text-[#43474f]">Floor 4 - Main Office</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => {
              const active = path === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                    active
                      ? 'bg-white text-[#004ced] shadow-sm border-l-4 border-[#004ced]'
                      : 'text-[#43474f] hover:bg-white/50'
                  }`}>
                  <span className="material-symbols-outlined" style={{fontSize:'20px'}}>{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="lg:ml-64 bg-[#f7f9fb] border-t border-[#43474f]/10 flex justify-between items-center px-8 py-4 w-full">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] tracking-widest uppercase text-[#43474f]">Trạng thái hệ thống: Hoạt động • v2.4.0</span>
        </div>
        <div className="flex gap-8">
          <a className="text-[10px] tracking-widest uppercase text-[#43474f] opacity-60 hover:text-[#004ced] transition-opacity" href="#">Chính sách bảo mật</a>
          <a className="text-[10px] tracking-widest uppercase text-[#43474f] opacity-60 hover:text-[#004ced] transition-opacity" href="#">Hỗ trợ</a>
          <a className="text-[10px] tracking-widest uppercase text-[#43474f] opacity-60 hover:text-[#004ced] transition-opacity" href="#">Tài liệu API</a>
        </div>
      </footer>
    </div>
  )
}
