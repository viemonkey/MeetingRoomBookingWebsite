'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function BookingPage() {
  const router = useRouter()
  const [selectedRoom, setSelectedRoom] = useState<'tang5'|'tang6'|null>(null)
  const [purpose, setPurpose] = useState('')
  const [team, setTeam] = useState('Vận hành chiến lược')
  const [date, setDate] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRoom || !date || !timeFrom || !timeTo || !purpose) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: selectedRoom, date, timeFrom, timeTo, reason: purpose, note: notes, name: 'Marcus Vance', team }),
      })
      if (res.ok) { setSuccess(true); setTimeout(() => router.push('/history'), 1500) }
    } finally { setLoading(false) }
  }

  const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
  const START = 8*60, RANGE = 10*60
  const fromPct = timeFrom ? ((toMin(timeFrom)-START)/RANGE*100) : 20
  const toPct = timeTo ? ((toMin(timeTo)-START)/RANGE*100) : 50

  return (
    <DashboardLayout>
      <div className="px-8 pb-24 pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Đặt phòng họp</h1>
            <p className="text-on-surface-variant font-medium">Đặt chỗ môi trường làm việc chuyên nghiệp trên toàn cầu của chúng tôi.</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600" style={{fontSize:'20px'}}>check_circle</span>
              <p className="text-emerald-700 font-bold text-sm">Đặt phòng thành công! Đang chuyển hướng...</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Room Selection */}
              <section className="bg-surface-container-low rounded-xl p-6 shadow-2xl shadow-black/5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-primary">Chọn phòng</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Bước 1 trên 3</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Room Card 1 - Tầng 5 */}
                  <div onClick={() => setSelectedRoom('tang5')}
                    className={`bg-surface-container-lowest p-1 rounded-lg cursor-pointer transition-all ${selectedRoom === 'tang5' ? 'ring-2 ring-surface-tint' : 'hover:ring-2 hover:ring-surface-tint'}`}>
                    <div className="relative overflow-hidden rounded-md h-40">
                      <img alt="Floor 5 Conference" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" />
                      <div className="absolute top-3 left-3 bg-[#001148]/90 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">Tầng 5</div>
                    </div>
                    <div className={`p-4 border-l-4 mt-1 ${selectedRoom === 'tang5' ? 'border-surface-tint' : 'border-outline-variant'}`}>
                      <h3 className="font-bold text-primary text-lg">Aurora Boardroom</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>groups</span> Sức chứa 12
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>videocam</span> Màn hình 4K
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Card 2 - Tầng 6 */}
                  <div onClick={() => setSelectedRoom('tang6')}
                    className={`bg-surface-container-lowest p-1 rounded-lg cursor-pointer transition-all ${selectedRoom === 'tang6' ? 'ring-2 ring-surface-tint' : 'hover:ring-2 hover:ring-surface-tint'}`}>
                    <div className="relative overflow-hidden rounded-md h-40">
                      <img alt="Floor 6 Hub" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80" />
                      <div className="absolute top-3 left-3 bg-[#001148]/90 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">Tầng 6</div>
                    </div>
                    <div className={`p-4 border-l-4 mt-1 ${selectedRoom === 'tang6' ? 'border-surface-tint' : 'border-outline-variant'}`}>
                      <h3 className="font-bold text-primary text-lg">Zenith Focus Lab</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>person</span> Sức chứa 4
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>whiteboard</span> Tường thông minh
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Time & Date */}
              <section className="bg-surface-container-low rounded-xl p-6 shadow-2xl shadow-black/5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-primary">Thời gian &amp; Ngày</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Bước 2 trên 3</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Chọn ngày</label>
                    <input value={date} onChange={e => setDate(e.target.value)} className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 font-semibold text-primary focus:ring-1 focus:ring-surface-tint outline-none" type="date" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Giờ bắt đầu</label>
                    <input value={timeFrom} onChange={e => setTimeFrom(e.target.value)} className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 font-semibold text-primary focus:ring-1 focus:ring-surface-tint outline-none" type="time" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Giờ kết thúc</label>
                    <input value={timeTo} onChange={e => setTimeTo(e.target.value)} className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 font-semibold text-primary focus:ring-1 focus:ring-surface-tint outline-none" type="time" />
                  </div>
                </div>
                {/* Timeline Bar */}
                <div className="mt-8">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Tiến trình khả dụng</label>
                  <div className="h-10 bg-surface-container-high rounded-full overflow-hidden flex relative">
                    <div className="h-full bg-primary/20 border-r border-white/20" style={{width:`${fromPct}%`}}></div>
                    <div className="h-full bg-surface-tint shadow-inner" style={{width:`${Math.max(0,toPct-fromPct)}%`}}></div>
                    <div className="h-full bg-primary/20 border-l border-white/20 flex-1"></div>
                    <div className="absolute inset-0 flex justify-between px-4 items-center pointer-events-none">
                      <span className="text-[9px] font-bold text-primary/50">08:00</span>
                      <span className="text-[9px] font-bold text-white">
                        {timeFrom && timeTo ? `SELECTED (${timeFrom} - ${timeTo})` : 'CHỌN KHUNG GIỜ'}
                      </span>
                      <span className="text-[9px] font-bold text-primary/50">18:00</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Booking Info */}
              <section className="bg-surface-container-low rounded-xl p-6 shadow-2xl shadow-black/5">
                <h2 className="text-xl font-bold text-primary mb-6">Thông tin đặt phòng</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Người đăng ký</label>
                    <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#002277] flex items-center justify-center text-white text-xs font-bold">MV</div>
                      <div className="text-sm">
                        <p className="font-bold text-primary">Marcus Vance</p>
                        <p className="text-[10px] text-on-surface-variant">Lead Solutions Architect</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Nhóm phụ trách</label>
                    <select value={team} onChange={e => setTeam(e.target.value)} className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 font-semibold text-primary focus:ring-1 focus:ring-surface-tint outline-none appearance-none">
                      <option>Vận hành chiến lược</option>
                      <option>Kỹ thuật sản phẩm</option>
                      <option>Kiến trúc toàn cầu</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Additional Details */}
              <section className="bg-surface-container-low rounded-xl p-6 shadow-2xl shadow-black/5">
                <h2 className="text-lg font-bold text-primary mb-4">Thời gian &amp; Ngày</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Mục đích</label>
                    <input value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 text-sm font-medium text-primary focus:ring-1 focus:ring-surface-tint outline-none" placeholder="e.g. Quarterly Review" type="text" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Ghi chú nội bộ</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 text-sm font-medium text-primary focus:ring-1 focus:ring-surface-tint outline-none resize-none" placeholder="Thêm hướng dẫn thiết lập..." rows={3}></textarea>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  <button onClick={handleSubmit} disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-md font-bold tracking-tight text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? 'Đang xử lý...' : <>Xác nhận đặt phòng <span className="material-symbols-outlined" style={{fontSize:'16px'}}>arrow_forward</span></>}
                  </button>
                  <button className="w-full py-3 rounded-md font-bold text-on-surface-variant text-xs hover:bg-surface-container-high transition-colors">
                    Lưu tạm
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
