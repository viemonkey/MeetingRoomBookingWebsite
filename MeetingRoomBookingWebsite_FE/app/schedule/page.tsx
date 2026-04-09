'use client'
import { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

const HOURS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']

const rooms = [
  {
    floor: 'TẦNG 5', name: 'The Vault', type: 'teal',
    slots: [
      { top: 0, height: 192, title: 'Q4 Strategy Review', person: 'Elena Rodriguez', tag: 'Liên kết trực tuyến đang hoạt động', tagIcon: 'videocam', dark: true },
      { top: 192, height: 96, title: null, empty: true },
      { top: 288, height: 144, title: 'UI/UX Sync', person: 'Design Team', dark: false },
      { top: 432, height: null, title: null, empty: true, last: true },
    ]
  },
  {
    floor: 'TẦNG 5', name: 'Sky Lounge', type: 'teal',
    slots: [
      { top: 0, height: 96, title: null, empty: true },
      { top: 96, height: 288, title: 'Board Selection', person: 'Executive Committee', tag: 'Phiên họp riêng tư', tagIcon: 'lock', dark: true, private: true },
    ]
  },
  {
    floor: 'TẦNG 6', name: 'Prism Hub', type: 'blue',
    slots: [
      { top: 0, height: 480, title: null, empty: true, nextTime: '01:00 PM' },
      { top: 480, height: 192, title: 'Dev Ops Sync', person: 'Marc Chen', dark: true },
    ]
  },
  {
    floor: 'TẦNG 6', name: 'The Atrium', type: 'blue',
    slots: [
      { top: 0, height: null, title: null, empty: true, noBooking: true, last: true },
    ]
  },
]

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState('24 Tháng 10, 2023')

  return (
    <DashboardLayout>
      <div className="pl-0 pt-0 h-[calc(100vh-64px)] flex flex-col bg-surface overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-end border-b border-surface-container-highest/30 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">Lịch phòng họp tổng quát</h1>
            <p className="text-on-surface-variant text-sm mt-1">Tình trạng sử dụng phòng thời gian thực tại Tầng 5 &amp; 6</p>
          </div>
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
            <button className="p-2 hover:bg-surface-container-lowest rounded-md transition-all">
              <span className="material-symbols-outlined text-on-surface-variant" style={{fontSize:'20px'}}>chevron_left</span>
            </button>
            <div className="px-4 py-2 text-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-surface-tint" style={{fontSize:'18px'}}>calendar_today</span>
              {currentDate}
            </div>
            <button className="p-2 hover:bg-surface-container-lowest rounded-md transition-all">
              <span className="material-symbols-outlined text-on-surface-variant" style={{fontSize:'20px'}}>chevron_right</span>
            </button>
          </div>
          <div className="flex gap-3">
            <Link href="/booking" className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-md font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>add</span> Đặt phòng mới
            </Link>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar p-8">
          <div className="inline-flex min-w-full">
            {/* Time Column */}
            <div className="flex flex-col pt-16 sticky left-0 z-20 bg-surface">
              <div className="h-12 w-20"></div>
              <div className="flex flex-col text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-tighter">
                {HOURS.map(h => (
                  <div key={h} className="h-24 border-t border-outline-variant/10 flex items-start justify-center pt-2">{h}</div>
                ))}
              </div>
            </div>

            {/* Room Columns */}
            <div className="flex-1 flex gap-4">
              {rooms.map((room, i) => (
                <div key={i} className="w-64 flex flex-col">
                  <div className={`h-16 p-4 rounded-t-xl mb-4 flex flex-col justify-center ${room.type === 'blue' ? 'bg-primary-container/10' : 'bg-surface-container'}`}>
                    <span className="text-[10px] font-black text-surface-tint uppercase tracking-widest">{room.floor}</span>
                    <h3 className="text-sm font-bold text-primary truncate">{room.name}</h3>
                  </div>
                  <div className="relative h-[960px] bg-surface-container-low/40 rounded-b-xl">
                    {room.slots.map((slot, j) => {
                      if (slot.empty) return (
                        <div key={j} className={`absolute left-0 right-0 m-1 rounded-md border-2 border-dashed border-outline-variant/20 flex items-center justify-center group cursor-pointer hover:bg-white/50 transition-colors ${slot.last ? 'bottom-0' : ''}`}
                          style={slot.last ? {top: slot.top} : {top: slot.top, height: slot.height ?? undefined}}>
                          <div className="text-center">
                            <span className="text-[10px] font-bold text-on-surface-variant/40 group-hover:text-surface-tint block">
                              {slot.noBooking ? 'KHÔNG CÓ LỊCH HẸN HÔM NAY' : 'TRỐNG'}
                            </span>
                            {slot.nextTime && <span className="text-[8px] text-on-surface-variant/30">Tiếp theo: {slot.nextTime}</span>}
                          </div>
                        </div>
                      )
                      return (
                        <div key={j} className={`absolute left-0 right-0 p-4 rounded-md shadow-lg z-10 m-1 border-l-4 ${slot.dark ? 'bg-primary text-on-primary border-surface-tint' : 'bg-secondary-container text-on-secondary-container border-secondary'}`}
                          style={{top: slot.top, height: slot.height ?? undefined}}>
                          <h4 className="text-xs font-bold truncate">{slot.title}</h4>
                          <p className="text-[10px] opacity-80 mt-1">{slot.person}</p>
                          {slot.tag && (
                            <div className="mt-auto pt-4 flex items-center gap-2" style={{color: slot.private ? '#b7c8e1' : undefined}}>
                              <span className="material-symbols-outlined text-xs" style={{fontSize:'14px', fontVariationSettings:"'FILL' 1"}}>{slot.tagIcon}</span>
                              <span className="text-[10px]">{slot.tag}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAB */}
        <Link href="/booking" className="fixed bottom-10 right-10 w-14 h-14 bg-surface-tint text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
          <span className="material-symbols-outlined" style={{fontSize:'28px'}}>add_location</span>
        </Link>
      </div>
    </DashboardLayout>
  )
}
