'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { getBookingsApi } from '@/lib/authService'

const roomDefs = [
  { id: 'tang5', name: 'Phòng họp lớn', floor: 'Tầng 5', color: 'bg-primary', textColor: 'text-primary-foreground' },
  { id: 'tang6', name: 'Phòng họp nhỏ', floor: 'Tầng 6', color: 'bg-accent', textColor: 'text-accent-foreground' },
]
const hours = Array.from({ length: 11 }, (_, i) => { const h = i + 8; return `${h.toString().padStart(2,'0')}:00` })
const eventColors = ['bg-primary', 'bg-accent', 'bg-primary/80', 'bg-accent/80']

function addDays(d: string, n: number) {
  const dt = new Date(d + 'T00:00:00'); dt.setDate(dt.getDate() + n)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}
function formatDateVN(d: string) {
  const dt = new Date(d + 'T00:00:00')
  const days = ['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy']
  return `${days[dt.getDay()]}, ${String(dt.getDate()).padStart(2,'0')} Tháng ${dt.getMonth()+1}, ${dt.getFullYear()}`
}

export default function SchedulePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => { load(date) }, [date])

  async function load(d: string) {
    const res = await getBookingsApi(d)
    if (res.success) setBookings(res.data)
  }

  function getEvent(roomId: string, hourStr: string) {
    const [h] = hourStr.split(':').map(Number)
    return bookings.find(b => {
      if (b.room !== roomId) return false
      const [fh] = b.timeFrom.split(':').map(Number)
      const [th] = b.timeTo.split(':').map(Number)
      return h >= fh && h < th
    })
  }
  function isOccupied(roomId: string, hourStr: string) {
    const [h] = hourStr.split(':').map(Number)
    return bookings.some(b => {
      if (b.room !== roomId) return false
      const [fh] = b.timeFrom.split(':').map(Number)
      const [th] = b.timeTo.split(':').map(Number)
      return h > fh && h < th
    })
  }
  function getEventDuration(b: any) {
    const [fh,fm] = b.timeFrom.split(':').map(Number)
    const [th,tm] = b.timeTo.split(':').map(Number)
    return ((th*60+tm) - (fh*60+fm)) / 60
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lịch phòng họp</h1>
            <p className="text-sm text-muted-foreground">Theo dõi tình trạng sử dụng phòng theo thời gian thực</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <button onClick={() => setDate(addDays(date,-1))} className="text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-sm font-semibold text-foreground min-w-[200px] text-center">{formatDateVN(date)}</span>
              <button onClick={() => setDate(addDays(date,1))} className="text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <Link href="/booking" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2 hover:bg-primary/90 transition">
              <Plus className="h-4 w-4" /> Đặt phòng
            </Link>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {roomDefs.map(r => <div key={r.id} className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${r.color}`} /><span className="text-xs font-medium text-muted-foreground">{r.name}</span></div>)}
          <div className="flex items-center gap-2 ml-auto"><span className="h-3 w-3 rounded-full bg-secondary border border-border" /><span className="text-xs font-medium text-muted-foreground">Trống</span></div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card animate-fade-in-up">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-[72px_repeat(2,1fr)] border-b border-border">
              <div className="bg-secondary/50 px-3 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-end">Giờ</div>
              {roomDefs.map((room, i) => (
                <div key={i} className={`border-l border-border ${room.color} px-4 py-3`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/70">{room.floor}</p>
                  <p className="text-sm font-bold text-primary-foreground">{room.name}</p>
                </div>
              ))}
            </div>

            <div className="relative">
              {hours.map((hour, i) => (
                <div key={i} className="grid grid-cols-[72px_repeat(2,1fr)] h-14 border-b border-border/40 last:border-0">
                  <div className="flex items-center justify-end pr-3 text-xs text-muted-foreground font-medium">{hour}</div>
                  {roomDefs.map((room, ri) => {
                    const event = getEvent(room.id, hour)
                    const occupied = isOccupied(room.id, hour)
                    if (occupied) return <div key={ri} className="border-l border-border/40" />
                    const colorClass = eventColors[bookings.indexOf(event!) % eventColors.length] || 'bg-primary'
                    return (
                      <div key={ri} className="relative border-l border-border/40">
                        {event ? (
                          <div className={`absolute inset-x-1 top-0.5 ${colorClass} rounded-xl p-3 text-primary-foreground z-10 shadow-sm`}
                            style={{ height: `${getEventDuration(event) * 56 - 4}px` }}>
                            <p className="text-sm font-bold truncate">{event.reason}</p>
                            <p className="text-xs opacity-75 mt-0.5 truncate">{event.userName} · {event.team}</p>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-[10px] font-medium text-muted-foreground/30">—</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
