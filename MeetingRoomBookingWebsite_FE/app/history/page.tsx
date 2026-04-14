'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, FileText, Calendar, Clock, Upload, CheckCircle2, Trash2 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { getMyBookingsApi, deleteBookingApi, uploadMinutesApi, getUser } from '@/lib/authService'

const tabs = ['Tất cả', 'Sắp tới', 'Đã qua']

export default function HistoryPage() {
  const router = useRouter()
  const user = getUser()
  const [bookings, setBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => { if (!user) router.push('/login'); else load() }, [])

  async function load() {
    setLoading(true)
    const res = await getMyBookingsApi()
    if (res.success) setBookings(res.data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá lịch đặt này?')) return
    const res = await deleteBookingApi(id)
    if (res.success) setBookings(prev => prev.filter(b => b.id !== id && b._id !== id))
    else alert(res.message)
  }

  async function handleUpload(id: string, file: File) {
    if (!file.name.match(/\.(doc|docx)$/i)) { alert('Chỉ chấp nhận .doc hoặc .docx'); return }
    setUploading(id)
    const res = await uploadMinutesApi(id, file)
    if (res.success) setBookings(prev => prev.map(b => (b.id === id || b._id === id) ? { ...b, minutesFile: res.data.fileName } : b))
    else alert(res.message)
    setUploading(null)
  }

  const filtered = bookings.filter(b => {
    if (activeTab === 'Sắp tới') return b.status === 'upcoming' || b.status === 'ongoing'
    if (activeTab === 'Đã qua') return b.status === 'done'
    return true
  })

  const totalHours = bookings.filter(b => b.status === 'done').reduce((acc, b) => {
    const [fh,fm] = b.timeFrom.split(':').map(Number)
    const [th,tm] = b.timeTo.split(':').map(Number)
    return acc + ((th*60+tm)-(fh*60+fm))/60
  }, 0)

  const mostUsed = (() => {
    const cnt: Record<string, number> = {}
    bookings.forEach(b => { cnt[b.room] = (cnt[b.room] || 0) + 1 })
    const top = Object.entries(cnt).sort((a,b) => b[1]-a[1])[0]
    return top ? (top[0] === 'tang5' ? 'Phòng họp lớn' : 'Phòng họp nhỏ') : '—'
  })()

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lịch sử đặt phòng</h1>
            <p className="text-sm text-muted-foreground">Xem lại và quản lý các lần đặt phòng</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-secondary">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
            <p className="text-xs font-semibold opacity-70">Tổng giờ đã họp</p>
            <p className="text-3xl font-bold mt-1">{totalHours.toFixed(1)} Giờ</p>
            <p className="text-xs opacity-60 mt-1">{bookings.filter(b => b.status==='done').length} cuộc họp</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-xs font-semibold text-muted-foreground">Phòng sử dụng nhiều nhất</p>
            <p className="text-lg font-bold text-foreground mt-1">{mostUsed}</p>
            <p className="text-xs text-muted-foreground mt-1">{bookings.length} lịch đặt tổng cộng</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{filtered.length} lịch đặt</p>
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Làm mới
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Chưa có lịch đặt phòng nào</div>
          ) : filtered.map(b => (
            <BookingItem key={b.id || b._id} booking={b} uploading={uploading === (b.id || b._id)}
              onDelete={() => handleDelete(b.id || b._id)}
              onUpload={file => handleUpload(b.id || b._id, file)} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function BookingItem({ booking: b, uploading, onDelete, onUpload }: { booking: any; uploading: boolean; onDelete: () => void; onUpload: (f: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const isUpcoming = b.status === 'upcoming' || b.status === 'ongoing'
  const roomName = b.room === 'tang5' ? 'Phòng họp lớn · Tầng 5' : 'Phòng họp nhỏ · Tầng 6'

  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4 hover-lift cursor-pointer">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${isUpcoming ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{b.reason}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{roomName}</p>
        {b.minutesFile && (
          <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{b.minutesFile}</p>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.date}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{b.timeFrom}–{b.timeTo}</span>
      </div>
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${isUpcoming ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
        {b.status === 'ongoing' ? 'Đang họp' : isUpcoming ? 'Sắp tới' : 'Đã qua'}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isUpcoming && (
          <>
            <input ref={fileRef} type="file" accept=".doc,.docx" className="hidden"
              onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); if(e.target) e.target.value = '' }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} title="Nộp biên bản"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${b.minutesFile ? 'bg-primary/10 text-primary' : 'border border-border hover:bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {uploading ? '...' : b.minutesFile ? <><CheckCircle2 className="h-3.5 w-3.5" />Đã nộp</> : <><Upload className="h-3.5 w-3.5" />Biên bản</>}
            </button>
          </>
        )}
        {isUpcoming && (
          <button onClick={onDelete} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
