'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { getMyBookingsApi, deleteBookingApi, uploadMinutesApi, getUser } from '@/lib/authService'

type Filter = 'all' | 'upcoming' | 'done'

export default function HistoryPage() {
  const router = useRouter()
  const user = getUser()
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [filterRoom, setFilterRoom] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string|null>(null)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    load()
  }, [])

  async function load() {
    setLoading(true)
    const res = await getMyBookingsApi()
    if (res.success) setBookings(res.data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá lịch đặt này?')) return
    const res = await deleteBookingApi(id)
    if (res.success) setBookings(prev => prev.filter(b => b.id !== id))
    else alert(res.message)
  }

  async function handleUpload(id: string, file: File) {
    setUploading(id)
    const res = await uploadMinutesApi(id, file)
    if (res.success) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, minutesFile: res.data.fileName } : b))
    } else { alert(res.message) }
    setUploading(null)
  }

  const filtered = bookings
    .filter(b => filter === 'all' || (filter === 'upcoming' ? b.status === 'upcoming' : b.status === 'done'))
    .filter(b => !filterRoom || b.room === filterRoom)

  const totalHours = bookings.filter(b => b.status === 'done').reduce((acc, b) => {
    const [fh,fm] = b.timeFrom.split(':').map(Number)
    const [th,tm] = b.timeTo.split(':').map(Number)
    return acc + ((th*60+tm)-(fh*60+fm))/60
  }, 0)

  return (
    <DashboardLayout>
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black text-on-background tracking-tight mb-2">Lịch sử đặt phòng</h1>
            <p className="text-on-surface-variant">Quản lý, xem lại và nộp biên bản cuộc họp của bạn</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-surface-container-low p-1.5 rounded-lg flex">
              {(['all','upcoming','done'] as Filter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-all ${filter === f ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                  {f === 'all' ? 'Tất cả' : f === 'upcoming' ? 'Sắp tới' : 'Đã qua'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats + Filter */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-8 bg-surface-container-low rounded-xl p-6 flex items-center gap-8">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mb-1">Hạng mục phòng</label>
              <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-primary focus:ring-0 outline-none cursor-pointer">
                <option value="">Tất cả phòng họp</option>
                <option value="tang5">Phòng tầng 5</option>
                <option value="tang6">Phòng tầng 6</option>
              </select>
            </div>
            <div className="h-8 w-px bg-outline-variant/30" />
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mb-1">Tổng lịch</label>
              <p className="text-sm font-bold text-primary">{bookings.length} lần đặt</p>
            </div>
            <div className="ml-auto">
              <button onClick={load} className="bg-primary text-white px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined" style={{fontSize:'16px'}}>refresh</span> Làm mới
              </button>
            </div>
          </div>

          <div className="col-span-4 bg-primary-container text-white rounded-xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-on-primary-container uppercase tracking-widest mb-1">Tổng giờ đã họp</p>
              <h3 className="text-3xl font-black text-on-primary-container">{totalHours.toFixed(1)} Giờ</h3>
              <p className="text-xs text-on-primary-container mt-2">{bookings.filter(b=>b.status==='done').length} cuộc họp đã hoàn thành</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined" style={{fontSize:'80px'}}>query_stats</span>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Đang tải...</div>
        ) : (
          <div className="bg-surface-container rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-high/50">
              <div className="col-span-4">Cuộc họp &amp; Phòng</div>
              <div className="col-span-3">Ngày &amp; Giờ</div>
              <div className="col-span-2">Trạng thái</div>
              <div className="col-span-3 text-right">Thao tác</div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant text-sm">Không có lịch đặt phòng nào</div>
            ) : (
              <div className="space-y-px">
                {filtered.map(b => (
                  <BookingRow key={b.id} booking={b} uploading={uploading === b.id}
                    onDelete={handleDelete} onUpload={handleUpload} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}

function BookingRow({ booking: b, uploading, onDelete, onUpload }: any) {
  const fileRef = useRef<HTMLInputElement>(null)
  const isUpcoming = b.status === 'upcoming'
  const isOngoing  = b.status === 'ongoing'
  const roomLabel  = b.room === 'tang5' ? 'Tầng 5 · Aurora' : 'Tầng 6 · Zenith'
  const roomColor  = b.room === 'tang5' ? '#004ced' : '#6366f1'

  const dur = (() => {
    const [fh,fm] = b.timeFrom.split(':').map(Number)
    const [th,tm] = b.timeTo.split(':').map(Number)
    return (th*60+tm)-(fh*60+fm)
  })()

  const badge = isOngoing  ? { label:'ĐANG HỌP', cls:'bg-amber-100 text-amber-800' }
               : isUpcoming ? { label:'SẮP TỚI',  cls:'bg-secondary-container text-on-secondary-container' }
               : { label:'ĐÃ QUA', cls:'bg-surface-container-high text-on-surface-variant' }

  return (
    <div className={`grid grid-cols-12 px-8 py-5 items-center bg-surface-container-lowest hover:bg-surface-bright transition-colors group relative ${!isUpcoming && !isOngoing ? 'opacity-75' : ''}`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{background: roomColor}} />

      <div className="col-span-4 flex items-center gap-4">
        <div className={`h-11 w-11 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 ${!isUpcoming && !isOngoing ? 'opacity-50' : ''}`} style={{color: roomColor}}>
          <span className="material-symbols-outlined" style={{fontSize:'20px', fontVariationSettings:"'FILL' 1"}}>
            {b.room === 'tang5' ? 'videocam' : 'groups'}
          </span>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-on-surface text-sm truncate">{b.reason}</h4>
          <p className="text-xs text-on-surface-variant">{roomLabel}</p>
          {b.minutesFile && (
            <div className="flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-emerald-600" style={{fontSize:'12px'}}>description</span>
              <span className="text-[10px] text-emerald-600 font-semibold truncate max-w-[140px]">{b.minutesFile}</span>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-3">
        <p className="text-sm font-semibold text-on-surface">{b.date}</p>
        <p className="text-xs text-on-surface-variant">{b.timeFrom}–{b.timeTo} ({dur} phút)</p>
        <p className="text-xs text-on-surface-variant opacity-60">{b.team}</p>
      </div>

      <div className="col-span-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="col-span-3 flex justify-end gap-2">
        {/* Nộp biên bản — chỉ khi đã qua */}
        {!isUpcoming && !isOngoing && (
          <>
            <input ref={fileRef} type="file" accept=".doc,.docx" className="hidden"
              onChange={e => { if (e.target.files?.[0]) onUpload(b.id, e.target.files[0]); if(e.target) e.target.value='' }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              title={b.minutesFile ? `Đã nộp: ${b.minutesFile}` : 'Nộp biên bản họp (.docx)'}
              className={`h-9 px-3 flex items-center gap-1.5 rounded text-xs font-bold transition-all ${
                b.minutesFile
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
              }`}>
              <span className="material-symbols-outlined" style={{fontSize:'14px'}}>{b.minutesFile ? 'task_alt' : 'upload_file'}</span>
              {uploading ? '...' : b.minutesFile ? 'Đã nộp' : 'Biên bản'}
            </button>
          </>
        )}

        {/* Xoá — chỉ khi chưa họp */}
        {(isUpcoming || isOngoing) && (
          <button onClick={() => onDelete(b.id)}
            className="h-9 w-9 flex items-center justify-center rounded bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error-container transition-all">
            <span className="material-symbols-outlined" style={{fontSize:'16px'}}>delete</span>
          </button>
        )}
      </div>
    </div>
  )
}
