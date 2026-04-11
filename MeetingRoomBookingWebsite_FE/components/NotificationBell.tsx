'use client'
import { useState, useEffect, useRef } from 'react'
import { getNotificationsApi, markReadApi, markAllReadApi } from '@/lib/authService'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
    // Poll mỗi 30 giây để nhận thông báo nhắc họp
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function load() {
    const res = await getNotificationsApi()
    if (res.success) { setNotifs(res.data); setUnread(res.unread) }
  }

  async function handleRead(id: string) {
    await markReadApi(id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  async function handleReadAll() {
    await markAllReadApi()
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  const iconForType = (type: string) => {
    if (type === 'reminder') return { icon: 'alarm', color: '#d97706', bg: '#fef3c7' }
    if (type === 'success')  return { icon: 'check_circle', color: '#16a34a', bg: '#f0fdf4' }
    if (type === 'conflict') return { icon: 'error', color: '#dc2626', bg: '#fef2f2' }
    return { icon: 'notifications', color: '#004ced', bg: '#eff6ff' }
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Vừa xong'
    if (m < 60) return `${m} phút trước`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} giờ trước`
    return `${Math.floor(h/24)} ngày trước`
  }

  return (
    <div style={{position:'relative'}} ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="material-symbols-outlined text-on-surface-variant p-2 rounded-full hover:bg-surface-container transition-colors relative"
        style={{fontSize:'20px'}}>
        notifications
        {unread > 0 && (
          <span style={{
            position:'absolute', top:4, right:4, minWidth:16, height:16,
            background:'#dc2626', color:'#fff', borderRadius:'50%',
            fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
            padding:'0 3px', fontFamily:'inherit'
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', right:0, top:'calc(100% + 8px)', width:340,
          background:'var(--color-background-primary, #fff)', border:'1px solid #e2e8f0',
          borderRadius:12, boxShadow:'0 4px 24px rgba(0,0,0,0.1)', zIndex:100, overflow:'hidden'
        }}>
          <div style={{padding:'12px 16px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span style={{fontSize:13, fontWeight:700, color:'#001148'}}>Thông báo</span>
            {unread > 0 && (
              <button onClick={handleReadAll} style={{fontSize:11, color:'#004ced', fontWeight:600, background:'none', border:'none', cursor:'pointer'}}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div style={{maxHeight:360, overflowY:'auto'}}>
            {notifs.length === 0 ? (
              <div style={{padding:'24px 16px', textAlign:'center', color:'#94a3b8', fontSize:12}}>
                Chưa có thông báo nào
              </div>
            ) : notifs.map(n => {
              const { icon, color, bg } = iconForType(n.type)
              return (
                <div key={n.id} onClick={() => !n.read && handleRead(n.id)}
                  style={{
                    padding:'10px 16px', display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer',
                    background: n.read ? 'transparent' : '#f8faff',
                    borderBottom:'1px solid #f1f5f9', transition:'background .15s'
                  }}>
                  <div style={{width:32, height:32, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <span className="material-symbols-outlined" style={{fontSize:'16px', color}}>{icon}</span>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <p style={{fontSize:12, color:'#1e293b', lineHeight:1.5}}>{n.message}</p>
                    <p style={{fontSize:10, color:'#94a3b8', marginTop:2}}>{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div style={{width:6, height:6, borderRadius:'50%', background:'#004ced', flexShrink:0, marginTop:4}} />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
