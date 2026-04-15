'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RefreshCw, FileText, Calendar, Clock, Upload, CheckCircle2, Trash2, Pencil, X, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { getMyBookingsApi, deleteBookingApi, uploadMinutesApi, updateBookingApi, getUser, getBookingsApi } from '@/lib/authService'

const tabs = ['Tất cả', 'Sắp tới', 'Đã qua']

const rooms = [
  { id: 'tang5', name: 'Phòng họp lớn', floor: 'Tầng 5' },
  { id: 'tang6', name: 'Phòng họp nhỏ', floor: 'Tầng 6' },
]

export default function HistoryPage() {
  const router = useRouter()
  const user = getUser()
  const [bookings, setBookings]   = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{ open: boolean; booking: any }>({ open: false, booking: null })

  useEffect(() => { if (!user) router.push('/login'); else load() }, [])

  async function load() {
    setLoading(true)
    const res = await getMyBookingsApi()
    if (res.success) setBookings(res.data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const toastId = toast.loading('Đang xoá lịch đặt...')
    const res = await deleteBookingApi(id)
    if (res.success) {
      setBookings(prev => prev.filter(b => b.id !== id && b._id !== id))
      toast.success('Đã xoá lịch đặt!', { id: toastId })
    } else {
      toast.error(res.message || 'Có lỗi xảy ra', { id: toastId })
    }
  }

  async function handleUpload(id: string, file: File) {
    if (!file.name.match(/\.(doc|docx)$/i)) { toast.error('Chỉ chấp nhận file .doc hoặc .docx'); return }
    setUploading(id)
    const res = await uploadMinutesApi(id, file)
    if (res.success) {
      setBookings(prev => prev.map(b => (b.id === id || b._id === id) ? { ...b, minutesFile: res.data.fileName } : b))
      toast.success('Nộp biên bản thành công!')
    } else {
      toast.error(res.message || 'Có lỗi xảy ra')
    }
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
            <BookingItem key={b.id || b._id} booking={b}
              uploading={uploading === (b.id || b._id)}
              onDelete={() => handleDelete(b.id || b._id)}
              onUpload={file => handleUpload(b.id || b._id, file)}
              onEdit={() => setEditModal({ open: true, booking: b })} />
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <EditBookingModal
          booking={editModal.booking}
          onClose={() => setEditModal({ open: false, booking: null })}
          onSaved={(updated) => {
            setBookings(prev => prev.map(b => (b._id === updated._id || b.id === updated._id) ? { ...b, ...updated } : b))
            setEditModal({ open: false, booking: null })
          }}
        />
      )}
    </DashboardLayout>
  )
}

function BookingItem({ booking: b, uploading, onDelete, onUpload, onEdit }: {
  booking: any; uploading: boolean
  onDelete: () => void; onUpload: (f: File) => void; onEdit: () => void
}) {
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
        {b.note && <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{b.note}</p>}
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
        {isUpcoming && b.status !== 'ongoing' && (
          <>
            <button onClick={onEdit} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Sửa lịch">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={onDelete} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Xoá lịch">
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function EditBookingModal({ booking, onClose, onSaved }: { booking: any; onClose: () => void; onSaved: (b: any) => void }) {
  const today = new Date().toISOString().split('T')[0]
  const [room,     setRoom]     = useState(booking.room)
  const [date,     setDate]     = useState(booking.date)
  const [timeFrom, setTimeFrom] = useState(booking.timeFrom)
  const [timeTo,   setTimeTo]   = useState(booking.timeTo)
  const [reason,   setReason]   = useState(booking.reason)
  const [note,     setNote]     = useState(booking.note || '')
  const [conflict, setConflict] = useState<any>(null)
  const [saving,   setSaving]   = useState(false)
  const [allBookings, setAllBookings] = useState<any[]>([])

  useEffect(() => {
    getBookingsApi(date).then(res => { if (res.success) setAllBookings(res.data) })
  }, [date])

  useEffect(() => {
    if (!room || !date || !timeFrom || !timeTo || timeFrom >= timeTo) { setConflict(null); return }
    const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
    const c = allBookings.find(b =>
      b.room === room &&
      (b._id !== booking._id && b.id !== booking._id) &&
      toMin(timeFrom) < toMin(b.timeTo) && toMin(timeTo) > toMin(b.timeFrom)
    )
    setConflict(c || null)
  }, [room, date, timeFrom, timeTo, allBookings])

  async function save() {
    if (!reason.trim() || !date || !timeFrom || !timeTo || conflict) return
    setSaving(true)
    const res = await updateBookingApi(booking._id || booking.id, { room, date, timeFrom, timeTo, reason, note })
    if (res.success) { toast.success('Đã cập nhật lịch đặt!'); onSaved(res.data) }
    else toast.error(res.message || 'Có lỗi xảy ra')
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-foreground">Sửa lịch đặt phòng</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-4">
          {/* Room */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phòng họp</label>
            <div className="grid grid-cols-2 gap-2">
              {rooms.map(r => (
                <button key={r.id} onClick={() => setRoom(r.id)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left ${room === r.id ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground hover:bg-secondary'}`}>
                  <p>{r.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{r.floor}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ngày</label>
              <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Bắt đầu</label>
              <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Kết thúc</label>
              <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {conflict && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-destructive">TRÙNG GIỜ</p>
                <p className="text-xs text-destructive/70 mt-0.5">{conflict.userName} · {conflict.timeFrom}–{conflict.timeTo}</p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Lý do *</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Họp sprint, training..."
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ghi chú</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition">Huỷ</button>
          <button onClick={save} disabled={saving || !!conflict || !reason.trim()}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}
