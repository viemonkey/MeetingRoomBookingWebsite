'use client'
import { useState, useEffect } from 'react'
import * as mammoth from 'mammoth'
import { useRouter } from 'next/navigation'
import {
  getUser, logoutApi, isAdmin,
  adminGetUsersApi, 
  adminGetBookingsApi, adminApproveBookingApi,
  adminRejectBookingApi, adminDeleteBookingApi,
  adminGetReportApi
} from '@/lib/authService'
import { 
  Calendar, CheckCircle2, Clock, 
  Download, Eye, LayoutDashboard, 
  LogOut, Search, Trash2, User as UserIcon, XCircle, 
  ChevronLeft, ChevronRight, Building2, Users,
  Activity, Bell, FileText, Filter, BarChart, ExternalLink, Sparkles
} from 'lucide-react'

// --- Color Constants ---
const PRIMARY = '#005139'

// --- Helpers ---
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const getMinutesDownloadUrl = (id: string) => `${API}/api/bookings/${id}/minutes`
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'bookings' | 'users' | 'reports'>('bookings')
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const u = getUser()
    if (!u || !isAdmin()) {
      router.push('/login')
      return
    }
    setUser(u)
  }, [])

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-[#f8faf9] font-sans text-slate-800">
      {/* --- Sidebar --- */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 m-5 rounded-3xl bg-white shadow-sm border border-slate-100 hidden lg:flex flex-col overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
            <div className="w-10 h-10 bg-[#005139] rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
               <h1 className="text-sm font-black text-[#005139] leading-none">VIÊN CHI BẢO</h1>
               <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Administrator</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'bookings', label: 'Quản lý Lịch họp', icon: Calendar },
              { id: 'users', label: 'Danh mục Nhân sự', icon: Users },
            ].map((item) => (
              <button key={item.id} onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === item.id ? 'bg-[#005139] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={16} />
                <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-50">
           <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#005139] font-black italic border border-slate-100 text-xs">A</div>
              <div className="min-w-0">
                 <p className="text-[10px] font-bold truncate text-slate-900 uppercase">Admin</p>
              </div>
           </div>
           <button onClick={() => { logoutApi(); router.push('/login') }} className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-rose-500 font-bold text-[10px] uppercase">
             <LogOut size={12} /> Thoát
           </button>
        </div>
      </aside>

      {/* --- Main Contents --- */}
      <main className="flex-1 lg:ml-72 p-6 md:p-10">
        {tab === 'bookings' ? <BookingsTab /> : <UsersTab />}
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//    QUẢN LÝ LỊCH HỌP (TRÁI TIM DASHBOARD)
// ═══════════════════════════════════════════════════════════
function BookingsTab() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [room, setRoom] = useState<'all' | 'tang5' | 'tang6'>('all')
  const [bookings, setBookings] = useState<any[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isPendingFilter, setIsPendingFilter] = useState(false)
  
  const [previewData, setPreviewData] = useState<{ open: boolean; content: string; title: string }>({ open: false, content: '', title: '' })

  useEffect(() => { load(); loadStats() }, [date, room, isPendingFilter])

  async function load() {
    setLoading(true); try {
      const params: any = { room: room === 'all' ? undefined : room }
      if (!isPendingFilter) params.date = date // Nếu không lọc Pending, thì lọc theo ngày
      
      const res = await adminGetBookingsApi(params)
      if (res.success) {
        let list = res.data || [] // FIX: Lấy từ res.data mới đúng
        if (isPendingFilter) {
          list = list.filter((b: any) => b.status?.toLowerCase() === 'pending')
        }
        setBookings(list)
      }
    } finally { setLoading(false) }
  }

  async function loadStats() {
    const res = await adminGetReportApi(); if (res.success) setTotalHours(Number(res.data.totalHours || 0))
  }

  async function approveBooking(id: string) {
    const res = await adminApproveBookingApi(id); if (res.success) load()
  }

  async function rejectBooking(id: string) {
    const res = await adminRejectBookingApi(id); if (res.success) load()
  }

  async function deleteBooking(id: string) {
    if (!confirm('Bạn có chắc muốn xóa lịch này?')) return
    const res = await adminDeleteBookingApi(id); if (res.success) load()
  }

  async function handlePreview(b: any) {
    try {
       const resp = await fetch(getMinutesDownloadUrl(b._id), { headers: { Authorization: `Bearer ${getToken()}` } })
       const arrayBuffer = await resp.arrayBuffer()
       const result = await mammoth.convertToHtml({ arrayBuffer })
       setPreviewData({ open: true, content: result.value, title: b.minutesOriginalName || 'Biên bản cuộc họp' })
    } catch { alert('Lỗi: Không thể xem biên bản này.') }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner: Thống kê giờ sử dụng */}
      <div className="bg-[#005139] p-8 rounded-[32px] text-white flex flex-col md:flex-row justify-between items-center shadow-lg shadow-[#005139]/20 relative overflow-hidden">
         <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-black italic tracking-tight">Khu vực điều hành lịch họp</h2>
            <p className="text-emerald-200 text-[11px] font-bold uppercase tracking-[0.2em] mt-2">Viên Chi Bảo Premium Dashboard</p>
         </div>
         <div className="relative z-10 mt-6 md:mt-0 bg-white/10 backdrop-blur-md px-10 py-4 rounded-[24px] border border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 opacity-60">Tổng giờ sử dụng hệ thống</p>
            <h3 className="text-4xl font-black mt-1">{totalHours.toFixed(1)} <span className="text-lg opacity-50 font-medium tracking-tight">Giờ</span></h3>
         </div>
         <Sparkles className="absolute top-0 right-0 text-white/5 w-64 h-64 -mr-20 -mt-20" />
      </div>

      {/* Control & Timeline */}
      <div className="grid grid-cols-1 gap-6">
         {/* Filter Bar */}
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {['all', 'tang5', 'tang6'].map((r) => (
                     <button key={r} onClick={() => {setRoom(r as any); setIsPendingFilter(false)}} 
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isPendingFilter && room === r ? 'bg-[#005139] text-white shadow-sm' : 'text-slate-400 hover:text-[#005139]'}`}>
                        {r === 'all' ? 'Toàn bộ' : r === 'tang5' ? 'P.Lớn' : 'P.Nhỏ'}
                     </button>
                  ))}
               </div>
               <button onClick={() => setIsPendingFilter(!isPendingFilter)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-sm border ${isPendingFilter ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-100 hover:bg-amber-50'}`}>
                  <Sparkles size={14} />
                  {isPendingFilter ? 'Đang lọc Chờ Duyệt' : 'Xem yêu cầu Chờ Duyệt'}
               </button>
            </div>

            {!isPendingFilter && (
               <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                     <button onClick={()=> {const d=new Date(date); d.setDate(d.getDate()-1); setDate(d.toISOString().split('T')[0])}} className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-[#005139] transition-colors"><ChevronLeft size={18}/></button>
                     <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="bg-transparent border-none outline-none font-bold text-xs px-2 text-slate-700" />
                     <button onClick={()=> {const d=new Date(date); d.setDate(d.getDate()+1); setDate(d.toISOString().split('T')[0])}} className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-[#005139] transition-colors"><ChevronRight size={18}/></button>
                  </div>
                  <button onClick={()=>setDate(new Date().toISOString().split('T')[0])} className="px-5 py-2.5 bg-slate-100 text-[#005139] rounded-xl font-black text-[10px] uppercase hover:bg-emerald-50 transition-all">Hôm nay</button>
               </div>
            )}
         </div>

         {/* Visual Timeline Bar */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Clock size={12}/> Hiện trạng phòng ngày {new Date(date).toLocaleDateString('vi-VN')}
            </h4>
            <div className="space-y-4">
               {['tang5', 'tang6'].map(rKey => (
                  <div key={rKey} className="relative h-6 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                     <div className="absolute inset-y-0 left-0 w-full flex justify-between px-2 text-[8px] font-bold text-slate-300 pointer-events-none items-center">
                        <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
                     </div>
                     {bookings.filter(b=>b.room===rKey && b.status==='approved').map((b,i)=>{
                        const toM = (t:string) => { const [h,m] = t.split(':').map(Number); return h*60+m };
                        const ds=8*60; const de=20*60;
                        const left = ((toM(b.timeFrom)-ds)/(de-ds))*100;
                        const width = ((toM(b.timeTo)-toM(b.timeFrom))/(de-ds))*100;
                        return (
                          <div key={i} className="absolute inset-y-0 bg-[#005139]/30 border-x border-[#005139]/20 flex items-center justify-center group cursor-help transition-all hover:bg-[#005139]" style={{left:`${left}%`, width:`${width}%`}}>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a2e28] text-white px-3 py-1.5 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                                {b.userName} • {b.timeFrom}-{b.timeTo}
                             </div>
                          </div>
                        )
                     })}
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Main Booking List */}
      <div className="space-y-3">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-[#005139] uppercase tracking-widest">Danh sách chi tiết</h3>
            <span className="text-[10px] font-bold text-slate-400">{bookings.length} kết quả</span>
         </div>
         {loading ? (
            <div className="grid grid-cols-1 gap-3 opacity-50">{[1,2,3].map(i=><div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}</div>
         ) : bookings.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-100 text-center">
               <Calendar className="mx-auto text-slate-100 mb-4" size={48} />
               <p className="text-slate-300 font-bold text-[11px] uppercase tracking-[0.2em]">Hệ thống chưa ghi nhận lịch đặt nào.</p>
            </div>
         ) : bookings.map((b) => (
           <div key={b._id} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#005139]/40 transition-all duration-300 overflow-hidden relative">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                 {/* User Info */}
                 <div className="flex items-center gap-4 w-60 flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#005139] flex items-center justify-center font-black text-lg border border-slate-100 group-hover:bg-[#005139] group-hover:text-white transition-all uppercase">
                      {b.userName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                       <h4 className="text-xs font-black text-slate-900 uppercase truncate">{b.userName}</h4>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{b.team || 'Cty/Phòng ban'}</p>
                    </div>
                 </div>

                 {/* Booking Details */}
                 <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase ${b.room === 'tang5' ? 'bg-[#005139]/10 text-[#005139]' : 'bg-blue-50 text-blue-600'}`}>
                         {b.room === 'tang5' ? 'Phòng lớn' : 'Phòng nhỏ'}
                       </span>
                       <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[9px] font-bold flex items-center gap-1 border border-slate-100">
                         <Clock size={10}/> {b.timeFrom} — {b.timeTo}
                       </span>
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase border ${b.status === 'approved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-amber-400 text-white border-amber-400 shadow-sm'}`}>
                         {b.status === 'approved' ? 'Xác nhận' : 'Chờ duyệt'}
                       </span>
                    </div>
                    <p className="text-slate-500 text-[11px] italic font-medium leading-relaxed">"{b.reason}"</p>
                 </div>

                 {/* Documents & Actions */}
                 <div className="flex items-center gap-4">
                    {/* Minutes Section */}
                    {b.minutesFile ? (
                      <div className="flex gap-1.5 p-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                         <button onClick={()=>handlePreview(b)} className="w-9 h-9 rounded-lg bg-white text-[#005139] flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Xem nhanh"><Eye size={16}/></button>
                         <button onClick={()=>window.open(getMinutesDownloadUrl(b._id), '_blank')} className="w-9 h-9 rounded-lg bg-white text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Tải về"><Download size={16}/></button>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-widest">Thiếu BB</div>
                    )}

                    <div className="flex gap-2 border-l border-slate-100 pl-4 min-h-[40px] items-center">
                       {b.status?.toLowerCase() === 'pending' && (
                          <>
                             <button onClick={()=>approveBooking(b._id)} className="px-5 py-2.5 rounded-xl bg-[#005139] text-white text-[10px] font-black uppercase hover:opacity-90 flex items-center gap-1 shadow-md animate-pulse">
                                <CheckCircle2 size={13}/><span>Duyệt</span>
                             </button>
                             <button onClick={() => rejectBooking(b._id)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm"><XCircle size={18}/></button>
                          </>
                       )}
                       {b.status?.toLowerCase() === 'approved' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold border border-emerald-100">
                             <CheckCircle2 size={12}/> ĐÃ DUYỆT
                          </div>
                       )}
                       <button onClick={()=>deleteBooking(b._id)} className="w-10 h-10 rounded-xl bg-white text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all border border-slate-100"><Trash2 size={18}/></button>
                    </div>
                 </div>
              </div>
              {/* Soft background glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#005139]/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
         ))}
      </div>

      {/* --- PREVIEW MODAL --- */}
      {previewData.open && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1a2e28]/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#005139] rounded-xl flex items-center justify-center text-white shadow-md"><FileText size={20}/></div>
                     <div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none">{previewData.title}</h3>
                        <p className="text-[10px] font-bold text-[#005139] mt-2 tracking-widest uppercase">Xác minh biên bản cuộc họp chính thức</p>
                     </div>
                  </div>
                  <button onClick={()=>setPreviewData({open:false,content:'',title:''})} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 shadow-sm"><XCircle size={20}/></button>
               </div>
               <div className="flex-1 overflow-auto p-12 lg:p-16 prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed" dangerouslySetInnerHTML={{__html:previewData.content}} />
               <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={()=>setPreviewData({open:false,content:'',title:''})} className="px-8 py-3 rounded-xl bg-[#005139] text-white font-black text-[10px] uppercase hover:bg-emerald-700 transition-colors tracking-widest">Đóng cửa sổ</button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() { 
    setLoading(true); const res = await adminGetUsersApi(); setLoading(false)
    if (res.success) setUsers(res.data || [])
  }

  const filtered = users.filter(u => u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <h2 className="text-2xl font-black text-[#005139] tracking-tight italic flex items-center gap-3 underline decoration-[#005139]/20 decoration-8 underline-offset-8">
           <Users size={24} /> DANH MỤC NHÂN SỰ
         </h2>
         <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên nhân viên, phòng ban..." 
              className="w-full pl-12 pr-6 py-3 rounded-2xl border border-slate-200 focus:border-[#005139] bg-white shadow-sm outline-none text-xs font-bold transition-all" />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">Đang đồng bộ dữ liệu...</div> : filtered.map((u, i) => (
          <div key={u._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#005139]/30 transition-all duration-300 animate-in zoom-in-95" style={{animationDelay:`${i*60}ms`}}>
             <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#005139] flex items-center justify-center text-xl font-black border border-emerald-100">
                  {u.fullName?.charAt(0)}
                </div>
                <div className="min-w-0">
                   <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{u.fullName}</h4>
                   <p className="text-[10px] font-bold text-emerald-600 italic mt-0.5">{u.department || 'Phòng ban'}</p>
                </div>
             </div>
             <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium truncate bg-slate-50 p-2 rounded-lg"><Activity size={10}/> {u.email}</div>
                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1"><Filter size={9}/> Team: {u.team || 'Cố định'}</div>
             </div>
             <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${u.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                   {u.status === 'approved' ? 'Chính thức' : 'Khách'}
                </span>
                <span className="text-[10px] font-black text-[#005139] opacity-40 uppercase tracking-tighter">Verified Member</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
