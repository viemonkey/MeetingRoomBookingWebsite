'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Monitor, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { createBookingApi, getBookingsApi, getUser, isApproved } from '@/lib/authService'

const rooms = [
  { id: 'tang5', name: 'Phòng họp lớn', floor: 'Tầng 5', capacity: 12, features: 'Màn hình 4K · Máy chiếu', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
  { id: 'tang6', name: 'Phòng họp nhỏ', floor: 'Tầng 6', capacity: 6, features: 'Bảng trắng · Webcam', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80' },
]

const hours = Array.from({ length: 10 }, (_, i) => i + 8)

export default function BookingPage() {
  const router = useRouter()
  const user = getUser()
  const [step, setStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [todayBookings, setTodayBookings] = useState<any[]>([])
  const [conflict, setConflict] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [accountBlocked, setAccountBlocked] = useState(false)
  const [accountMsg, setAccountMsg] = useState('')
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { if (!user) router.push('/login') }, [])
  useEffect(() => { loadBookings(date) }, [date])
  useEffect(() => {
    if (!selectedRoom || !date || !timeFrom || !timeTo || timeFrom >= timeTo) { setConflict(null); return }
    const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
    setConflict(todayBookings.find(b => b.room === selectedRoom && toMin(timeFrom) < toMin(b.timeTo) && toMin(timeTo) > toMin(b.timeFrom)) || null)
  }, [selectedRoom, date, timeFrom, timeTo, todayBookings])

  async function loadBookings(d: string): Promise<any[]> {
    const res = await getBookingsApi(d)
    if (res.success) { setTodayBookings(res.data); return res.data }
    return []
  }

  function getSlotStatus(roomId: string, hour: number) {
    return todayBookings.find(b => {
      if (b.room !== roomId) return false
      const [fh] = b.timeFrom.split(':').map(Number)
      const [th] = b.timeTo.split(':').map(Number)
      return hour >= fh && hour < th
    })
  }

  async function handleConfirm() {
    if (!reason.trim()) return
    setLoading(true)
    try {
      const fresh = await loadBookings(date)
      const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
      const c = fresh.find(b => b.room === selectedRoom && toMin(timeFrom) < toMin(b.timeTo) && toMin(timeTo) > toMin(b.timeFrom))
      if (c) { setConflict(c); setStep(2); return }

      const res = await createBookingApi({ room: selectedRoom, team: user?.department || '', reason, note, date, timeFrom, timeTo })
      if (res.accountStatus) {
        // Tài khoản chưa được duyệt hoặc bị từ chối
        setAccountBlocked(true)
        setAccountMsg(res.message)
        return
      }
      if (res.success) {
        setSuccess(true)
        setTimeout(() => { setSuccess(false); setStep(1); setSelectedRoom(null); setDate(new Date().toISOString().split('T')[0]); setTimeFrom(''); setTimeTo(''); setReason(''); setNote('') }, 3000)
        loadBookings(date)
      } else if (res.conflict) {
        setConflict(res.conflict); setStep(2)
      } else {
        alert(res.message)
      }
    } finally { setLoading(false) }
  }

  const stepLabels = [{ num: 1, label: 'Chọn phòng' }, { num: 2, label: 'Thời gian' }, { num: 3, label: 'Chi tiết' }]

  return (
    <DashboardLayout>
      <div className="page-transition max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Đặt phòng họp</h1>
          <p className="text-sm text-muted-foreground mt-1">Chọn phòng và thời gian phù hợp với nhu cầu của bạn</p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 animate-scale-in">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            <div><p className="text-sm font-bold text-primary">Đặt phòng thành công!</p><p className="text-xs text-primary/70 mt-0.5">Bạn sẽ nhận thông báo nhắc trước 15 phút</p></div>
          </div>
        )}

        {/* Banner tài khoản chưa được duyệt */}
        {(!isApproved() || accountBlocked) && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-700">Tài khoản chưa được kích hoạt</p>
              <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                {accountBlocked ? accountMsg : user?.status === 'rejected'
                  ? 'Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.'
                  : 'Tài khoản đang chờ admin duyệt. Bạn sẽ nhận thông báo sau khi được duyệt.'}
              </p>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {stepLabels.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button onClick={() => { if (s.num < step || (s.num === 2 && selectedRoom) || (s.num === 3 && date && timeFrom && timeTo)) setStep(s.num) }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${step === s.num ? 'bg-primary text-primary-foreground shadow-md' : step > s.num ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[11px]">{s.num}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < 2 && <div className={`w-8 h-px ${step > s.num ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
            {rooms.map(room => (
              <button key={room.id} onClick={() => { setSelectedRoom(room.id); setStep(2) }}
                className={`group rounded-2xl overflow-hidden border-2 text-left hover-lift card-shine transition-all duration-300 ${selectedRoom === room.id ? 'border-primary shadow-lg shadow-primary/10' : 'border-transparent bg-card shadow-sm hover:shadow-md'}`}>
                <div className="relative h-48 overflow-hidden">
                  <img src={room.img} alt={room.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-card/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-foreground">
                      <MapPin className="h-3 w-3" /> {room.floor}
                    </span>
                  </div>
                </div>
                <div className="p-5 bg-card">
                  <p className="text-lg font-bold text-foreground">{room.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {room.capacity} người</span>
                    <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> {room.features}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              {selectedRoom && (
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <img src={rooms.find(r => r.id === selectedRoom)?.img} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{rooms.find(r => r.id === selectedRoom)?.name}</p>
                    <p className="text-xs text-muted-foreground">{rooms.find(r => r.id === selectedRoom)?.floor}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Ngày</label>
                  <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Bắt đầu</label>
                  <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Kết thúc</label>
                  <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>

              {conflict && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-2 items-start animate-scale-in">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div><p className="text-sm font-bold text-destructive">TRÙNG GIỜ — Không thể đặt</p>
                    <p className="text-xs text-destructive/70 mt-0.5">{conflict.userName || conflict.name} ({conflict.team}) · {conflict.timeFrom}–{conflict.timeTo}</p></div>
                </div>
              )}

              {/* Timeline */}
              {selectedRoom && date && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Tình trạng phòng hôm nay
                  </p>
                  <RoomTimeline bookings={todayBookings} roomId={selectedRoom} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="px-5 h-11 rounded-xl border border-border bg-background text-sm font-semibold text-foreground hover:bg-secondary transition-colors">← Quay lại</button>
                <button onClick={() => { if (date && timeFrom && timeTo && !conflict) setStep(3) }}
                  disabled={!date || !timeFrom || !timeTo || !!conflict}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Lý do mượn phòng *</label>
                <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Họp sprint, training, phỏng vấn..."
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Ghi chú (tùy chọn)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Cần máy chiếu, bảng trắng..." rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="px-5 h-11 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-secondary transition-colors">← Quay lại</button>
                <button onClick={handleConfirm} disabled={loading || !reason.trim()}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Đang xử lý...</> : 'Xác nhận đặt phòng ✓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

const SLOT_COLORS = ['#fda4af','#86efac','#93c5fd','#fcd34d','#c4b5fd','#fdba74']

function RoomTimeline({ bookings, roomId }: { bookings: any[], roomId: string }) {
  const S = 8, E = 18, TOTAL = (E - S) * 60
  const roomBookings = bookings.filter(b => b.room === roomId)
  const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return (h - S) * 60 + m }
  const pct = (m: number) => `${(m / TOTAL * 100).toFixed(3)}%`
  const tickHours = [8, 10, 12, 14, 16, 18]

  const totalBooked = roomBookings.reduce((a, b) => a + toMins(b.timeTo) - toMins(b.timeFrom), 0)

  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-4 space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: roomBookings.length, label: 'Lịch đặt' },
          { val: `${(totalBooked / 60).toFixed(1)}h`, label: 'Đã đặt' },
          { val: `${((TOTAL * 2 - totalBooked) / 60).toFixed(1)}h`, label: 'Còn trống' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border px-3 py-2 text-center">
            <p className="text-base font-semibold text-foreground">{s.val}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-14 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden">
        {roomBookings.map((b, i) => {
          const l = toMins(b.timeFrom)
          const w = toMins(b.timeTo) - l
          return (
            <div key={i} title={`${b.userName} · ${b.reason} · ${b.timeFrom}–${b.timeTo}`}
              className="absolute top-1.5 bottom-1.5 rounded-lg flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:brightness-95 transition-all"
              style={{ left: pct(l), width: pct(w), background: SLOT_COLORS[i % SLOT_COLORS.length] }}>
              <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap px-1">{b.timeFrom}–{b.timeTo}</span>
              <span className="text-[10px] text-slate-600 whitespace-nowrap px-1">{b.userName}</span>
            </div>
          )
        })}
      </div>

      {/* Axis */}
      <div className="relative h-4">
        {tickHours.map(h => (
          <span key={h} className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
            style={{ left: pct((h - S) * 60) }}>
            {h}:00
          </span>
        ))}
      </div>

      {/* Legend + Pills */}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" /><span className="text-[10px] text-muted-foreground">Còn trống</span></div>
        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-rose-200 border border-rose-300" /><span className="text-[10px] text-muted-foreground">Đã đặt</span></div>
      </div>

      {roomBookings.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {roomBookings.map((b, i) => (
            <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5">
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: SLOT_COLORS[i % SLOT_COLORS.length] }} />
              <span className="text-xs font-medium text-foreground">{b.timeFrom}–{b.timeTo}</span>
              <span className="text-xs text-muted-foreground">{b.userName} · {b.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
