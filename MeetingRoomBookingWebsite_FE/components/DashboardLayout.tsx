'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarPlus, CalendarDays, Clock, LogOut, Bell, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUser, logoutApi, getNotificationsApi, markAllReadApi } from '@/lib/authService'

const navItems = [
  { label: 'Đặt phòng', icon: CalendarPlus, href: '/booking' },
  { label: 'Lịch trình', icon: CalendarDays, href: '/schedule' },
  { label: 'Lịch sử', icon: Clock, href: '/history' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifs, setNotifs] = useState<any[]>([])
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    setUser(getUser())
    loadNotifs()
    const t = setInterval(loadNotifs, 30000)
    return () => clearInterval(t)
  }, [])

  async function loadNotifs() {
    const res = await getNotificationsApi().catch(() => null)
    if (res?.success) { setNotifs(res.data); setUnread(res.unread) }
  }

  async function handleLogout() { await logoutApi(); router.push('/login') }

  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() || 'NT'
  const pageTitle = navItems.find(n => n.href === path)?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 shadow-sm flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground flex-shrink-0">V</div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">Viên Chi Bảo</p>
            <p className="text-[10px] text-sidebar-foreground/50 font-medium">Quản lý phòng họp</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">Menu</p>
          {navItems.map(item => {
            const active = path === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active ? 'bg-primary text-primary-foreground shadow-md' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary flex-shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.fullName || 'Người dùng'}</p>
              <p className="text-[11px] text-sidebar-foreground/40">{user?.department || 'Nội bộ'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <p className="text-sm font-semibold text-foreground hidden md:block">{pageTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Trực tuyến
            </span>
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen && unread > 0) markAllReadApi().then(() => setUnread(0)) }}
                className="relative p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Thông báo</span>
                    <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Chưa có thông báo</p>
                    ) : notifs.slice(0, 10).map(n => (
                      <div key={n.id || n._id} className={`px-4 py-3 border-b border-border/50 ${!n.read ? 'bg-primary/5' : ''}`}>
                        <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-md py-2 md:hidden">
        {navItems.map(item => {
          const active = path === item.href
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <item.icon className={`h-5 w-5 ${active ? 'scale-110' : ''} transition-transform`} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
