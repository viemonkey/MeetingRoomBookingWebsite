'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

type Filter = 'all' | 'upcoming' | 'done'
interface Booking {
  id: string; name: string; team: string; room: string; reason: string
  date: string; timeFrom: string; timeTo: string; status: string; minutesFile?: string
}

const STATIC_BOOKINGS: Booking[] = [
  { id: '1', name: 'Marcus Vance', team: 'Design', room: 'tang5', reason: 'Quarterly Alignment', date: '2023-10-24', timeFrom: '14:00', timeTo: '15:30', status: 'upcoming' },
  { id: '2', name: 'Marcus Vance', team: 'Dev', room: 'tang6', reason: 'Design Sprint Wrap-up', date: '2023-10-20', timeFrom: '09:00', timeTo: '12:00', status: 'done' },
  { id: '3', name: 'Marcus Vance', team: 'HR', room: 'tang5', reason: 'Board of Directors', date: '2023-10-15', timeFrom: '10:00', timeTo: '11:00', status: 'done' },
]

const ROOM_ICONS: Record<string, string> = { tang5: 'videocam', tang6: 'groups' }
const ROOM_LABELS: Record<string, string> = { tang5: 'The Glass Pavilion • Floor 5', tang6: 'Zenith Focus Lab • Floor 6' }

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [bookings, setBookings] = useState<Booking[]>(STATIC_BOOKINGS)
  const [uploading, setUploading] = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/bookings').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setBookings(data)
    }).catch(() => {})
  }, [])

  const filtered = bookings.filter(b => filter === 'all' || (filter === 'upcoming' ? b.status === 'upcoming' : b.status === 'done'))

  const handleUpload = async (id: string, file: File) => {
    if (!file.name.match(/\.(doc|docx)$/i)) { alert('Chỉ chấp nhận file .doc hoặc .docx'); return }
    setUploading(id)
    const fd = new FormData(); fd.append('id', id); fd.append('file', file)
    try {
      const res = await fetch('/api/minutes', { method: 'POST', body: fd })
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, minutesFile: file.name } : b))
      }
    } finally { setUploading(null) }
  }

  return (
    <DashboardLayout>
      <main className="flex-1 p-8 bg-surface">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black text-on-background tracking-tight mb-2">Lịch sử đặt phòng</h1>
            <p className="text-on-surface-variant">Quản lý lịch trình đặt phòng của bạn. Xem, chỉnh sửa hoặc đối soát các lần đặt phòng họp trước đó và sắp tới của bạn trên toàn hệ thống.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-low p-1.5 rounded-lg flex">
              {(['all','upcoming','done'] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-all ${filter === f ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                  {f === 'all' ? 'Tất cả' : f === 'upcoming' ? 'Sắp tới' : 'Đã qua'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Stats */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-8 bg-surface-container-low rounded-xl p-6 flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Hạng mục phòng</label>
              <select className="bg-transparent border-none text-sm font-semibold text-primary p-0 focus:ring-0 cursor-pointer outline-none">
                <option>Tất cả phòng họp</option>
                <option>Phòng tầng 5</option>
                <option>Phòng tầng 6</option>
              </select>
            </div>
            <div className="h-8 w-px bg-outline-variant/30"></div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Khoảng thời gian</label>
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-semibold text-primary">30 ngày qua</span>
                <span className="material-symbols-outlined text-sm" style={{fontSize:'18px'}}>calendar_month</span>
              </div>
            </div>
            <div className="ml-auto">
              <button className="bg-primary text-white px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">Tất cả</button>
            </div>
          </div>
          <div className="col-span-4 bg-primary-container text-white rounded-xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-on-primary-container uppercase tracking-widest mb-1">Tổng hiệu suất sử dụng</p>
              <h3 className="text-3xl font-black text-on-primary-container">42.5 Giờ</h3>
              <p className="text-xs text-on-primary-container mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{fontSize:'14px'}}>trending_up</span> Cao hơn 12% so với tháng trước
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined" style={{fontSize:'80px'}}>query_stats</span>
            </div>
          </div>
        </div>

        {/* Booking List */}
        <div className="bg-surface-container rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-high/50">
            <div className="col-span-4">Cuộc họp &amp; Phòng</div>
            <div className="col-span-3">Ngày &amp; Giờ</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-3 text-right">Thao tác</div>
          </div>
          <div className="space-y-px">
            {filtered.map(b => (
              <BookingRow key={b.id} booking={b} uploading={uploading === b.id} onUpload={handleUpload} />
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="px-8 py-3 text-xs font-bold uppercase tracking-widest border border-outline-variant/30 rounded-md text-on-surface-variant hover:bg-surface-container-low transition-colors">
            Tải thêm các lượt đặt phòng cũ
          </button>
        </div>
      </main>
    </DashboardLayout>
  )
}

function BookingRow({ booking: b, uploading, onUpload }: {
  booking: Booking; uploading: boolean; onUpload: (id: string, file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const isUpcoming = b.status === 'upcoming'
  const icon = ROOM_ICONS[b.room] ?? 'meeting_room'
  const roomLabel = ROOM_LABELS[b.room] ?? b.room

  const durationStr = (() => {
    const [fh,fm] = b.timeFrom.split(':').map(Number)
    const [th,tm] = b.timeTo.split(':').map(Number)
    const mins = (th*60+tm)-(fh*60+fm)
    return `${b.timeFrom} - ${b.timeTo} (${mins} min)`
  })()

  return (
    <div className={`grid grid-cols-12 px-8 py-6 items-center bg-surface-container-lowest hover:bg-surface-bright transition-colors group relative ${!isUpcoming ? 'opacity-80' : ''}`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-tint opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="col-span-4 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary ${!isUpcoming ? 'opacity-60' : ''}`}>
          <span className="material-symbols-outlined" style={{fontSize:'20px', fontVariationSettings: isUpcoming ? "'FILL' 1" : "'FILL' 0"}}>{icon}</span>
        </div>
        <div>
          <h4 className={`font-bold text-on-surface ${!isUpcoming ? 'opacity-80' : ''}`}>{b.reason}</h4>
          <p className="text-xs text-on-surface-variant">{roomLabel}</p>
          {b.minutesFile && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined" style={{fontSize:'12px'}}>description</span>{b.minutesFile}
            </p>
          )}
        </div>
      </div>
      <div className="col-span-3">
        <span className={`text-sm font-semibold text-on-surface ${!isUpcoming ? 'opacity-80' : ''}`}>{b.date}</span>
        <br /><span className="text-xs text-on-surface-variant">{durationStr}</span>
      </div>
      <div className="col-span-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          isUpcoming ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
        }`}>{isUpcoming ? 'Sắp tới' : 'Đã qua'}</span>
      </div>
      <div className="col-span-3 flex justify-end gap-2">
        {isUpcoming ? (
          <>
            <button className="h-9 w-9 flex items-center justify-center rounded bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>edit</span>
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error-container transition-all">
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>delete</span>
            </button>
          </>
        ) : (
          <>
            <input ref={fileRef} type="file" accept=".doc,.docx" className="hidden"
              onChange={e => { if (e.target.files?.[0]) onUpload(b.id, e.target.files[0]); if(e.target) e.target.value = '' }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              title={b.minutesFile ? `Đã nộp: ${b.minutesFile}` : 'Nộp biên bản họp'}
              className={`h-9 px-3 flex items-center gap-1.5 rounded text-xs font-bold transition-all ${
                b.minutesFile
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
              }`}>
              <span className="material-symbols-outlined" style={{fontSize:'14px'}}>{b.minutesFile ? 'task_alt' : 'upload_file'}</span>
              {uploading ? 'Đang tải...' : b.minutesFile ? 'Đã nộp' : 'Biên bản'}
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded bg-surface-container-low text-on-surface-variant hover:text-primary transition-all">
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>replay</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
