'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createBookingApi, getBookingsApi, getUser } from '@/lib/authService'

export default function BookingPage() {
  const router = useRouter()
  const user = getUser()

  const [selectedRoom, setSelectedRoom] = useState<'tang5'|'tang6'|''>('')
  const [team, setTeam] = useState(user?.department || '')
  const [reason, setReason] = useState('')
  const [date, setDate] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [note, setNote] = useState('')
  const [todayBookings, setTodayBookings] = useState<any[]>([])
  const [conflict, setConflict] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    loadTodayBookings()
  }, [])

  useEffect(() => {
    if (date) loadTodayBookings(date)
  }, [date])

  // Kiểm tra trùng giờ phía client (realtime)
  useEffect(() => {
    if (!selectedRoom || !date || !timeFrom || !timeTo || timeFrom >= timeTo) { setConflict(null); return }
    const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
    const c = todayBookings.find(b =>
      b.room === selectedRoom &&
      toMin(timeFrom) < toMin(b.timeTo) &&
      toMin(timeTo) > toMin(b.timeFrom)
    )
    setConflict(c || null)
  }, [selectedRoom, date, timeFrom, timeTo, todayBookings])

  async function loadTodayBookings(d?: string): Promise<any[]> {
    const res = await getBookingsApi(d || today)
    if (res.success) {
      setTodayBookings(res.data)
      return res.data
    }
    return []
  }

  // Kiểm tra trùng giờ trực tiếp từ danh sách bookings mới nhất
  function checkConflict(bookings: any[], room: string, from: string, to: string) {
    const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
    return bookings.find(b =>
      b.room === room &&
      toMin(from) < toMin(b.timeTo) &&
      toMin(to)   > toMin(b.timeFrom)
    ) || null
  }

  async function handleSubmit() {
    // 1. Validate form
    const e: Record<string,string> = {}
    if (!selectedRoom)  e.room     = 'Vui lòng chọn phòng'
    if (!team.trim())   e.team     = 'Vui lòng nhập team'
    if (!reason.trim()) e.reason   = 'Vui lòng nhập lý do'
    if (!date)          e.date     = 'Vui lòng chọn ngày'
    if (!timeFrom)      e.timeFrom = 'Vui lòng chọn giờ bắt đầu'
    if (!timeTo)        e.timeTo   = 'Vui lòng chọn giờ kết thúc'
    if (timeFrom && timeTo && timeFrom >= timeTo) e.timeTo = 'Giờ kết thúc phải sau giờ bắt đầu'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setLoading(true)
    try {
      // 2. Reload lịch mới nhất từ BE TRƯỚC KHI gửi — tránh dùng cache cũ
      const freshBookings = await loadTodayBookings(date)

      // 3. Kiểm tra trùng giờ với dữ liệu mới nhất
      const freshConflict = checkConflict(freshBookings, selectedRoom, timeFrom, timeTo)
      if (freshConflict) {
        setConflict(freshConflict)
        return
      }

      // 4. Gọi BE tạo booking (BE cũng sẽ check lại lần nữa)
      const res = await createBookingApi({ room: selectedRoom, team, reason, date, timeFrom, timeTo, note })

      if (res.success) {
        // Reset form VÀ xoá conflict TRƯỚC khi reload
        // Quan trọng: phải reset timeFrom/timeTo trước loadTodayBookings
        // để useEffect conflict không chạy với giờ cũ khi data mới về
        setConflict(null)
        setSelectedRoom('')
        setReason('')
        setTimeFrom('')
        setTimeTo('')
        setNote('')
        setSuccess(true)
        // Reload sau khi đã reset form
        await loadTodayBookings(date)
        setTimeout(() => { setSuccess(false) }, 3000)
      } else if (res.conflict) {
        // BE phát hiện trùng (double-check)
        setConflict(res.conflict)
        await loadTodayBookings(date)
      } else {
        alert(res.message || 'Có lỗi xảy ra')
      }
    } finally {
      setLoading(false)
    }
  }

  const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
  const START = 8*60, RANGE = 10*60
  const fromPct = timeFrom ? Math.max(0,((toMin(timeFrom)-START)/RANGE*100)) : 20
  const toPct   = timeTo  ? Math.max(0,((toMin(timeTo)-START)/RANGE*100))   : 50

  const roomBks = todayBookings.filter(b => b.room === selectedRoom)

  return (
    <DashboardLayout>
      <div className="px-8 pb-24 pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-primary tracking-tight mb-1">Đặt phòng họp</h1>
            <p className="text-on-surface-variant">Xin chào <span className="font-semibold text-primary">{user?.fullName}</span> — đặt phòng tầng 5 hoặc tầng 6</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-emerald-600" style={{fontSize:'20px'}}>check_circle</span>
              <div>
                <p className="text-emerald-700 font-bold text-sm">Đặt phòng thành công!</p>
                <p className="text-emerald-600 text-xs mt-0.5">Thông báo nhắc nhở sẽ xuất hiện trước 15 phút</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Chọn phòng */}
              <section className="bg-surface-container-low rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-primary">Chọn phòng</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Bước 1 trên 3</span>
                </div>
                {errors.room && <p className="text-xs text-red-500 mb-3">{errors.room}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['tang5','tang6'] as const).map(room => {
                    const bks = todayBookings.filter(b => b.room === room).length
                    return (
                      <div key={room} onClick={() => setSelectedRoom(room)}
                        className={`bg-surface-container-lowest p-1 rounded-lg cursor-pointer transition-all ${selectedRoom === room ? 'ring-2 ring-surface-tint' : 'hover:ring-2 hover:ring-surface-tint'}`}>
                        <div className="relative overflow-hidden rounded-md h-36">
                          <img alt={room} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            src={room === 'tang5'
                              ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80'
                              : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80'} />
                          <div className="absolute top-3 left-3 bg-[#001148]/90 text-white px-3 py-1 rounded text-[10px] font-black uppercase">
                            {room === 'tang5' ? 'Tầng 5' : 'Tầng 6'}
                          </div>
                          {selectedRoom === room && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-surface-tint flex items-center justify-center">
                              <span className="material-symbols-outlined text-white" style={{fontSize:'14px'}}>check</span>
                            </div>
                          )}
                        </div>
                        <div className={`p-4 border-l-4 mt-1 ${selectedRoom === room ? 'border-surface-tint' : 'border-outline-variant'}`}>
                          <h3 className="font-bold text-primary">{room === 'tang5' ? 'Aurora Boardroom' : 'Zenith Focus Lab'}</h3>
                          <p className="text-xs text-on-surface-variant mt-1">{room === 'tang5' ? 'Sức chứa 12 người · Màn hình 4K' : 'Sức chứa 4 người · Tường thông minh'}</p>
                          {bks > 0 && <p className="text-xs text-amber-600 font-semibold mt-1">{bks} lịch hôm nay</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Thời gian */}
              <section className="bg-surface-container-low rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-primary">Thời gian &amp; Ngày</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Bước 2 trên 3</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Chọn ngày</label>
                    <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
                      className={`w-full bg-surface-container-high border-none rounded-md px-4 py-3 font-semibold text-primary focus:ring-1 focus:ring-surface-tint outline-none ${errors.date ? 'ring-1 ring-red-400' : ''}`} />
                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Giờ bắt đầu</label>
                    <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)}
                      className={`w-full bg-surface-container-high border-none rounded-md px-4 py-3 font-semibold text-primary focus:ring-1 focus:ring-surface-tint outline-none ${errors.timeFrom ? 'ring-1 ring-red-400' : ''}`} />
                    {errors.timeFrom && <p className="text-xs text-red-500 mt-1">{errors.timeFrom}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Giờ kết thúc</label>
                    <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)}
                      className={`w-full bg-surface-container-high border-none rounded-md px-4 py-3 font-semibold text-primary focus:ring-1 focus:ring-surface-tint outline-none ${errors.timeTo ? 'ring-1 ring-red-400' : ''}`} />
                    {errors.timeTo && <p className="text-xs text-red-500 mt-1">{errors.timeTo}</p>}
                  </div>
                </div>

                {/* Timeline */}
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Tiến trình khả dụng (08:00–18:00)</label>
                <div className="h-10 bg-surface-container-high rounded-full overflow-hidden relative">
                  {roomBks.map(b => {
                    const l = Math.max(0,((toMin(b.timeFrom)-START)/RANGE*100))
                    const w = Math.max(0,((toMin(b.timeTo)-toMin(b.timeFrom))/RANGE*100))
                    return <div key={b.id} style={{position:'absolute',top:0,bottom:0,left:`${l}%`,width:`${w}%`}} className="bg-red-300/70" title={`${b.userName} ${b.timeFrom}–${b.timeTo}`} />
                  })}
                  <div style={{position:'absolute',top:0,bottom:0,left:`${fromPct}%`,width:`${Math.max(0,toPct-fromPct)}%`}} className="bg-surface-tint" />
                  <div className="absolute inset-0 flex justify-between px-4 items-center pointer-events-none">
                    <span className="text-[9px] font-bold text-primary/50">08:00</span>
                    <span className="text-[9px] font-bold text-white">
                      {timeFrom && timeTo ? `${timeFrom}–${timeTo}` : 'CHỌN KHUNG GIỜ'}
                    </span>
                    <span className="text-[9px] font-bold text-primary/50">18:00</span>
                  </div>
                </div>

                {/* Conflict warning */}
                {conflict && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
                    <span className="material-symbols-outlined text-red-500 flex-shrink-0" style={{fontSize:'18px'}}>error</span>
                    <div>
                      <p className="text-sm font-bold text-red-700">TRÙNG GIỜ — Không thể đặt</p>
                      <p className="text-xs text-red-500 mt-0.5">{conflict.userName || conflict.name} ({conflict.team}) đã đặt {conflict.timeFrom}–{conflict.timeTo}</p>
                    </div>
                  </div>
                )}
              </section>

              {/* Chi tiết */}
              <section className="bg-surface-container-low rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-primary">Mục đích &amp; Ghi chú</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Bước 3 trên 3</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Team / Phòng ban</label>
                    <input value={team} onChange={e => setTeam(e.target.value)}
                      className={`w-full bg-surface-container-high border-none rounded-md px-4 py-3 text-sm font-medium text-primary focus:ring-1 focus:ring-surface-tint outline-none ${errors.team ? 'ring-1 ring-red-400' : ''}`}
                      placeholder="Dev, Marketing, HR..." />
                    {errors.team && <p className="text-xs text-red-500 mt-1">{errors.team}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Lý do mượn phòng *</label>
                    <input value={reason} onChange={e => setReason(e.target.value)}
                      className={`w-full bg-surface-container-high border-none rounded-md px-4 py-3 text-sm font-medium text-primary focus:ring-1 focus:ring-surface-tint outline-none ${errors.reason ? 'ring-1 ring-red-400' : ''}`}
                      placeholder="Họp sprint, training, phỏng vấn..." />
                    {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Ghi chú nội bộ (tuỳ chọn)</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                      className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 text-sm font-medium text-primary focus:ring-1 focus:ring-surface-tint outline-none resize-none"
                      placeholder="Cần máy chiếu, bảng trắng..." />
                  </div>
                </div>
              </section>

              <button onClick={handleSubmit} disabled={loading || !!conflict}
                className="w-full bg-primary disabled:bg-surface-container-highest disabled:text-on-surface-variant text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin" style={{fontSize:'18px'}}>progress_activity</span> Đang xử lý...</>
                ) : conflict ? 'Không thể đặt — Trùng giờ' : (
                  <>Xác nhận đặt phòng <span className="material-symbols-outlined" style={{fontSize:'16px'}}>arrow_forward</span></>
                )}
              </button>
            </div>

            {/* Right panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="bg-surface-container-low rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
                  Người đặt
                </p>
                <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.fullName?.split(' ').map((n: string) => n[0]).slice(-2).join('') || 'NT'}
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">{user?.fullName || 'Người dùng'}</p>
                    <p className="text-[10px] text-on-surface-variant">{user?.department || 'Nội bộ'}</p>
                  </div>
                </div>
              </section>

              <section className="bg-surface-container-low rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
                  Lịch {date || 'hôm nay'}
                </p>
                {todayBookings.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">Chưa có lịch nào</p>
                ) : (
                  <div className="space-y-2">
                    {todayBookings.slice(0, 5).map(b => (
                      <div key={b.id} style={{borderLeft: `3px solid ${b.room === 'tang5' ? '#004ced' : '#6366f1'}`}}
                        className="pl-3 py-1.5 rounded-r-md bg-surface-container-lowest">
                        <p className="text-xs font-bold text-primary">{b.userName} · {b.team}</p>
                        <p className="text-[10px] text-on-surface-variant">{b.room === 'tang5' ? 'Tầng 5' : 'Tầng 6'} · {b.timeFrom}–{b.timeTo}</p>
                        <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{b.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
