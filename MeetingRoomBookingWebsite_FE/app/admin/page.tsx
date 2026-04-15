'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUser, logoutApi, isAdmin,
  adminGetUsersApi, adminGetStatsApi,
  adminApproveApi, adminRejectApi, adminResetApi,
  adminGetBookingsApi, adminDeleteBookingApi, adminGetReportApi,
  adminApproveBookingApi, adminRejectBookingApi,
} from '@/lib/authService'

type Tab = 'members' | 'bookings' | 'report'
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

function addDays(d: string, n: number) {
  const dt = new Date(d + 'T00:00:00'); dt.setDate(dt.getDate() + n)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

export default function AdminPage() {
  const router = useRouter()
  const user = getUser()
  const [activeTab, setActiveTab] = useState<Tab>('bookings')

  useEffect(() => {
    if (!user || !isAdmin()) router.push('/login')
  }, [])

  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() || 'AD'

  const navItems: { key: Tab; icon: string; label: string }[] = [
    { key: 'bookings', icon: 'calendar_month', label: 'Đặt phòng'         },
    { key: 'report',   icon: 'bar_chart',     label: 'Thống kê'           },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .adm-root { font-family: 'DM Sans', sans-serif; background: #f5f3f6; color: #323236; min-height: 100vh; display: flex; overflow: hidden; }
        .vcb-serif { font-family: 'DM Serif Display', serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .fill-icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

        /* ─ Sidebar ─ */
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: #fff;
          border-right: 1px solid rgba(178,177,182,0.12);
          display: flex; flex-direction: column;
          box-shadow: 2px 0 16px rgba(0,0,0,0.03);
        }
        .sidebar-brand {
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(178,177,182,0.1);
          display: flex; align-items: center; gap: 10px;
        }
        .brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #006d4e;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .nav-section-label {
          padding: 16px 16px 6px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          color: rgba(178,177,182,0.8); text-transform: uppercase;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; margin: 2px 8px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500; color: #5f5f63;
          cursor: pointer; transition: all 0.15s ease;
          border: none; background: none; width: calc(100% - 16px);
          text-align: left;
        }
        .nav-item:hover { background: #f5f3f6; color: #323236; }
        .nav-item.active { background: rgba(0,109,78,0.08); color: #006d4e; font-weight: 600; }
        .nav-item.active .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .sidebar-footer {
          margin-top: auto; padding: 16px;
          border-top: 1px solid rgba(178,177,182,0.1);
        }
        .user-row { display: flex; align-items: center; gap: 10px; padding: 8px 8px 4px; }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(0,109,78,0.1); color: #006d4e;
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .logout-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 8px; border-radius: 8px;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #b2b1b6;
          transition: all 0.15s;
        }
        .logout-btn:hover { color: #323236; background: #f5f3f6; }

        /* ─ Main area ─ */
        .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .topbar {
          height: 56px; flex-shrink: 0;
          background: #fff; border-bottom: 1px solid rgba(178,177,182,0.1);
          padding: 0 28px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 1px 8px rgba(0,0,0,0.03);
        }
        .content-area { flex: 1; padding: 28px; overflow-y: auto; }

        /* ─ Cards & Stats ─ */
        .stat-card {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(178,177,182,0.1);
          padding: 20px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .panel {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(178,177,182,0.1);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .panel-header {
          padding: 16px 24px; border-bottom: 1px solid rgba(178,177,182,0.08);
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .table-header {
          padding: 10px 24px;
          background: rgba(245,243,246,0.6);
          border-bottom: 1px solid rgba(178,177,182,0.08);
          display: grid; gap: 16px;
        }
        .table-row {
          padding: 14px 24px; border-bottom: 1px solid rgba(178,177,182,0.06);
          display: grid; gap: 16px; align-items: center;
          transition: background 0.15s;
        }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: rgba(245,243,246,0.5); }

        /* ─ Badges ─ */
        .badge {
          display: inline-flex; align-items: center;
          padding: 4px 10px; border-radius: 999px;
          font-size: 10px; font-weight: 700;
        }
        .badge-pending  { background: rgba(245,163,0,0.1); color: #b07800; }
        .badge-approved { background: rgba(0,150,90,0.1); color: #006d4e; }
        .badge-rejected { background: rgba(168,56,54,0.08); color: #a83836; }
        .badge-upcoming { background: rgba(45,103,195,0.1); color: #1e56a0; }
        .badge-ongoing  { background: rgba(0,150,90,0.1); color: #006d4e; }
        .badge-done     { background: #f0eef2; color: #7b7a7f; }

        /* ─ Buttons ─ */
        .btn-approve {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px;
          background: rgba(0,109,78,0.9); color: #e5fff0;
          font-size: 12px; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-approve:hover { background: #006d4e; }
        .btn-reject {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px;
          background: rgba(168,56,54,0.9); color: #fff7f6;
          font-size: 12px; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-reject:hover { background: #a83836; }
        .btn-outline {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px;
          background: transparent; color: #5f5f63;
          font-size: 12px; font-weight: 600;
          border: 1.5px solid rgba(178,177,182,0.3); cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover { background: #f5f3f6; color: #323236; }
        .btn-danger-outline {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px;
          background: transparent; color: #a83836;
          font-size: 12px; font-weight: 600;
          border: 1.5px solid rgba(168,56,54,0.2); cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-danger-outline:hover { background: rgba(168,56,54,0.05); }
        .btn-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer; transition: all 0.15s;
          color: #b2b1b6;
        }
        .btn-icon:hover { background: rgba(168,56,54,0.08); color: #a83836; }

        /* ─ Filters ─ */
        .filter-tabs {
          display: flex; gap: 2px;
          background: #f5f3f6; padding: 4px; border-radius: 10px;
        }
        .filter-tab {
          padding: 7px 14px; border-radius: 8px; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; color: #7b7a7f; background: none;
        }
        .filter-tab.active { background: #fff; color: #323236; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .search-input {
          padding: 8px 12px 8px 36px;
          background: #f5f3f6; border: 1.5px solid transparent;
          border-radius: 10px; font-size: 12.5px; color: #323236;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s; width: 220px;
        }
        .search-input:focus { background: #fff; border-color: #006d4e; box-shadow: 0 0 0 3px rgba(0,109,78,0.08); }
        .search-input::placeholder { color: #b2b1b6; }
        .date-input {
          padding: 7px 12px;
          background: #f5f3f6; border: 1.5px solid transparent;
          border-radius: 10px; font-size: 12.5px; color: #323236;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s;
        }
        .date-input:focus { background: #fff; border-color: #006d4e; }

        /* ─ Modal ─ */
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(14,14,16,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 16px;
          backdrop-filter: blur(4px);
        }
        .modal-box {
          background: #fff; border-radius: 20px;
          padding: 28px; width: 100%; max-width: 380px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.15);
        }
        .modal-textarea {
          width: 100%; padding: 12px; border-radius: 12px;
          border: 1.5px solid rgba(178,177,182,0.2);
          font-size: 13px; color: #323236;
          font-family: 'DM Sans', sans-serif;
          resize: none; outline: none; transition: border 0.2s;
          background: #fcf8fb;
        }
        .modal-textarea:focus { border-color: #006d4e; background: #fff; box-shadow: 0 0 0 3px rgba(0,109,78,0.08); }
        .modal-btn-primary {
          flex: 1; height: 42px; border-radius: 12px;
          background: #006d4e; color: #e5fff0;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          border: none; cursor: pointer; transition: opacity 0.15s;
        }
        .modal-btn-primary:hover { opacity: 0.9; }
        .modal-btn-primary.danger { background: #a83836; }
        .modal-btn-secondary {
          flex: 1; height: 42px; border-radius: 12px;
          background: none; color: #5f5f63;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          border: 1.5px solid rgba(178,177,182,0.2); cursor: pointer; transition: background 0.15s;
        }
        .modal-btn-secondary:hover { background: #f5f3f6; }

        /* ─ Alerts ─ */
        .alert-warning {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px;
          background: rgba(245,163,0,0.07);
          border: 1px solid rgba(245,163,0,0.2);
          font-size: 13px; color: #8a5c00;
          margin-bottom: 16px;
        }

        /* ─ Progress bar ─ */
        .progress-track { height: 10px; background: #efedf1; border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }

        /* ─ Loading/empty ─ */
        .empty-state { text-align: center; padding: 56px 24px; font-size: 13px; color: #b2b1b6; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeUp 0.35s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="adm-root">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span className="material-symbols-outlined fill-icon" style={{ color: '#fff', fontSize: 20 }}>meeting_room</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: '#323236' }}>Viên Chi Bảo</p>
              <p style={{ fontSize: 10, color: '#b2b1b6', marginTop: 1 }}>Admin Panel</p>
            </div>
          </div>

          <nav style={{ flex: 1, paddingTop: 8 }}>
            <p className="nav-section-label">Quản lý</p>
            {navItems.map(item => (
              <button key={item.key} onClick={() => setActiveTab(item.key)} className={`nav-item ${activeTab === item.key ? 'active' : ''}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-row">
              <div className="user-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#323236', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</p>
                <p style={{ fontSize: 10, color: '#b2b1b6' }}>Administrator</p>
              </div>
            </div>
            <button className="logout-btn" onClick={async () => { await logoutApi(); router.push('/login') }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-area">
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'report'   && <ReportTab />}
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB 1: DUYỆT THÀNH VIÊN
═══════════════════════════════════════════════════════════ */
function MembersTab() {
  const [users,        setUsers]        = useState<any[]>([])
  const [stats,        setStats]        = useState({ users: { pending: 0, approved: 0, rejected: 0, total: 0 } })
  const [filter,       setFilter]       = useState<StatusFilter>('pending')
  const [search,       setSearch]       = useState('')
  const [loading,      setLoading]      = useState(true)
  const [actionId,     setActionId]     = useState<string | null>(null)
  const [rejectModal,  setRejectModal]  = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' })
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => { loadData() }, [filter])

  async function loadData() {
    setLoading(true)
    const [uRes, sRes] = await Promise.all([
      adminGetUsersApi(filter === 'all' ? undefined : filter),
      adminGetStatsApi(),
    ])
    if (uRes.success) setUsers(uRes.data)
    if (sRes.success) setStats(sRes.data)
    setLoading(false)
  }

  async function approve(id: string) {
    setActionId(id); await adminApproveApi(id); await loadData(); setActionId(null)
  }
  async function confirmReject() {
    setActionId(rejectModal.userId)
    await adminRejectApi(rejectModal.userId, rejectReason)
    setRejectModal({ open: false, userId: '', name: '' }); setRejectReason('')
    await loadData(); setActionId(null)
  }
  async function revoke(id: string, name: string) {
    if (!confirm(`Thu hồi quyền của ${name}?`)) return
    setActionId(id); await adminRejectApi(id, 'Quyền bị thu hồi bởi admin'); await loadData(); setActionId(null)
  }
  async function reset(id: string) {
    setActionId(id); await adminResetApi(id); await loadData(); setActionId(null)
  }

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  )

  const u = stats.users

  return (
    <>
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: '#323236' }}>Duyệt thành viên</h1>
          <p style={{ fontSize: 11, color: '#b2b1b6', marginTop: 1 }}>Quản lý quyền truy cập đặt phòng</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B080' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#7b7a7f' }}>TRỰC TUYẾN</span>
        </div>
      </div>

      <div className="content-area fade-in">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Tổng thành viên', val: u.total,    icon: 'group',        bg: 'rgba(178,177,182,0.1)', ic: '#7b7a7f' },
            { label: 'Chờ duyệt',       val: u.pending,  icon: 'schedule',     bg: 'rgba(245,163,0,0.1)',   ic: '#b07800' },
            { label: 'Đã duyệt',        val: u.approved, icon: 'check_circle', bg: 'rgba(0,109,78,0.1)',    ic: '#006d4e' },
            { label: 'Từ chối',         val: u.rejected, icon: 'cancel',       bg: 'rgba(168,56,54,0.08)',  ic: '#a83836' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <span className="material-symbols-outlined fill-icon" style={{ color: s.ic, fontSize: 22 }}>{s.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#323236', lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 11, color: '#b2b1b6', marginTop: 4 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {u.pending > 0 && (
          <div className="alert-warning">
            <span className="material-symbols-outlined fill-icon" style={{ fontSize: 18, color: '#b07800' }}>warning</span>
            Có <strong>&nbsp;{u.pending}&nbsp;</strong> tài khoản đang chờ duyệt
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            <div className="filter-tabs">
              {([
                { val: 'pending',  label: `Chờ duyệt${u.pending > 0 ? ` (${u.pending})` : ''}` },
                { val: 'approved', label: 'Đã duyệt' },
                { val: 'rejected', label: 'Từ chối' },
                { val: 'all',      label: 'Tất cả' },
              ] as { val: StatusFilter; label: string }[]).map(f => (
                <button key={f.val} onClick={() => setFilter(f.val)} className={`filter-tab ${filter === f.val ? 'active' : ''}`}>{f.label}</button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#b2b1b6' }}>search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email, phòng ban..." className="search-input" />
            </div>
          </div>

          {/* Table head */}
          <div className="table-header" style={{ gridTemplateColumns: '1.2fr 1.6fr 1fr 0.9fr 1.3fr' }}>
            {['Họ tên', 'Email', 'Phòng ban', 'Trạng thái', 'Hành động'].map((h, i) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#b2b1b6', textTransform: 'uppercase', textAlign: i === 4 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">
              <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(0,109,78,0.2)', borderTopColor: '#006d4e', display: 'inline-block' }} className="spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#dbd9de', display: 'block', marginBottom: 8 }}>person_off</span>
              {search ? 'Không tìm thấy thành viên phù hợp' : 'Không có thành viên nào'}
            </div>
          ) : filtered.map(u => {
            const inits = u.fullName.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase()
            return (
              <div key={u._id} className="table-row" style={{ gridTemplateColumns: '1.2fr 1.6fr 1fr 0.9fr 1.3fr' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,109,78,0.1)', color: '#006d4e', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{inits}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#323236', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.fullName}</p>
                    <p style={{ fontSize: 10, color: '#b2b1b6' }}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#5f5f63', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                <p style={{ fontSize: 12, color: '#5f5f63' }}>{u.department}</p>
                <div>
                  <span className={`badge badge-${u.status}`}>{u.status === 'pending' ? 'Chờ duyệt' : u.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}</span>
                  {u.status === 'rejected' && u.rejectReason && (
                    <p style={{ fontSize: 10, color: '#a83836', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.rejectReason}>{u.rejectReason}</p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  {u.status === 'pending' && (
                    <>
                      <button onClick={() => approve(u._id)} disabled={actionId === u._id} className="btn-approve">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                        {actionId === u._id ? '...' : 'Duyệt'}
                      </button>
                      <button onClick={() => setRejectModal({ open: true, userId: u._id, name: u.fullName })} className="btn-reject">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                        Từ chối
                      </button>
                    </>
                  )}
                  {u.status === 'approved' && (
                    <button onClick={() => revoke(u._id, u.fullName)} disabled={actionId === u._id} className="btn-danger-outline">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>block</span>
                      {actionId === u._id ? '...' : 'Thu hồi'}
                    </button>
                  )}
                  {u.status === 'rejected' && (
                    <button onClick={() => reset(u._id)} disabled={actionId === u._id} className="btn-outline">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
                      {actionId === u._id ? '...' : 'Xét lại'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {rejectModal.open && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) { setRejectModal({ open: false, userId: '', name: '' }); setRejectReason('') } }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168,56,54,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined fill-icon" style={{ color: '#a83836', fontSize: 22 }}>person_off</span>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#323236' }}>Từ chối tài khoản</h3>
                <p style={{ fontSize: 12, color: '#7b7a7f', marginTop: 2 }}>{rejectModal.name}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#5f5f63', marginBottom: 16, lineHeight: 1.55 }}>
              Thành viên sẽ nhận thông báo và không thể đặt phòng.
            </p>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#7b7a7f', textTransform: 'uppercase', marginBottom: 8 }}>Lý do (tuỳ chọn)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              placeholder="Nhập lý do để thông báo cho thành viên..." className="modal-textarea" />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="modal-btn-secondary" onClick={() => { setRejectModal({ open: false, userId: '', name: '' }); setRejectReason('') }}>Huỷ</button>
              <button className="modal-btn-primary danger" onClick={confirmReject}>Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB 2: QUẢN LÝ ĐẶT PHÒNG
═══════════════════════════════════════════════════════════ */
function BookingsTab() {
  const today = new Date().toISOString().split('T')[0]
  const [date,     setDate]     = useState(today)
  const [room,     setRoom]     = useState('')
  const [bookings, setBookings] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; booking: any }>({ open: false, booking: null })
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { load() }, [date, room])

  async function load() {
    setLoading(true)
    const res = await adminGetBookingsApi({ date, room: room || undefined })
    if (res.success) setBookings(res.data)
    setLoading(false)
  }

  const [rejectModal, setRejectModal] = useState<{ open: boolean; booking: any }>({ open: false, booking: null })
  const [rejectReason, setRejectReason] = useState('')

  async function confirmDelete() {
    setDeleting(true)
    await adminDeleteBookingApi(deleteModal.booking._id || deleteModal.booking.id, deleteReason)
    setDeleteModal({ open: false, booking: null }); setDeleteReason('')
    await load(); setDeleting(false)
  }

  async function approveBooking(id: string) {
    const res = await adminApproveBookingApi(id)
    if (res.success) {
      await load()
    }
  }

  async function confirmReject() {
    setDeleting(true)
    await adminRejectBookingApi(rejectModal.booking._id || rejectModal.booking.id, rejectReason)
    setRejectModal({ open: false, booking: null }); setRejectReason('')
    await load(); setDeleting(false)
  }

  function bookingStatus(b: any) {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
    if (b.date > todayStr) return 'upcoming'
    if (b.date < todayStr) return 'done'
    if (nowMin < toMin(b.timeFrom)) return 'upcoming'
    if (nowMin >= toMin(b.timeTo)) return 'done'
    return 'ongoing'
  }

  const tang5 = bookings.filter(b => b.room === 'tang5').length
  const tang6 = bookings.filter(b => b.room === 'tang6').length

  return (
    <>
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: '#323236' }}>Quản lý đặt phòng</h1>
          <p style={{ fontSize: 11, color: '#b2b1b6', marginTop: 1 }}>Xem và huỷ lịch đặt phòng của thành viên</p>
        </div>
      </div>

      <div className="content-area fade-in">
        {/* Filters */}
        <div className="panel" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setDate(addDays(date, -1))} className="btn-icon" style={{ width: 32, height: 32 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#7b7a7f' }}>chevron_left</span>
              </button>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="date-input" />
              <button onClick={() => setDate(addDays(date, 1))} className="btn-icon" style={{ width: 32, height: 32 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#7b7a7f' }}>chevron_right</span>
              </button>
              <button onClick={() => setDate(today)} style={{
                padding: '7px 14px', background: 'rgba(0,109,78,0.08)', color: '#006d4e',
                border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}>Hôm nay</button>
            </div>
            <div className="filter-tabs" style={{ marginLeft: 'auto' }}>
              {[{ val: '', label: 'Tất cả' }, { val: 'tang5', label: 'Phòng lớn (T5)' }, { val: 'tang6', label: 'Phòng nhỏ (T6)' }].map(r => (
                <button key={r.val} onClick={() => setRoom(r.val)} className={`filter-tab ${room === r.val ? 'active' : ''}`}>{r.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Tổng lịch đặt', val: bookings.length, ic: '#323236', bg: 'rgba(178,177,182,0.1)' },
            { label: 'Phòng lớn (T5)', val: tang5, ic: '#006d4e', bg: 'rgba(0,109,78,0.08)' },
            { label: 'Phòng nhỏ (T6)', val: tang6, ic: '#2d676e', bg: 'rgba(45,103,110,0.08)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ justifyContent: 'center', textAlign: 'center', padding: '16px' }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 700, color: s.ic }}>{s.val}</p>
                <p style={{ fontSize: 11, color: '#b2b1b6', marginTop: 4 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="panel">
          <div className="table-header" style={{ gridTemplateColumns: '1.4fr 1.1fr 0.8fr 1fr 0.8fr 0.8fr 70px' }}>
            {['Người đặt', 'Lý do', 'Phòng', 'Thời gian', 'Trạng thái', 'Biên bản', 'Hành động'].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#b2b1b6', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="empty-state"><span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(0,109,78,0.2)', borderTopColor: '#006d4e', display: 'inline-block' }} className="spin" /></div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#dbd9de', display: 'block', marginBottom: 8 }}>calendar_off</span>
              Không có lịch đặt nào trong ngày này
            </div>
          ) : bookings.map(b => {
            const appSt = b.status || 'pending'
            const timeSt = appSt === 'approved' ? (b.timeStatus || bookingStatus(b)) : ''
            const inits = b.userName?.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() || 'NA'
            return (
              <div key={b._id} className="table-row" style={{ gridTemplateColumns: '1.4fr 1.1fr 0.8fr 1fr 0.8fr 0.8fr 70px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,109,78,0.08)', color: '#006d4e', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{inits}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#323236', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.userName}</p>
                    <p style={{ fontSize: 10, color: '#b2b1b6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.userId?.department || b.team || ''}</p>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#5f5f63', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.reason}>{b.reason}</p>
                <span className="badge" style={{ background: b.room === 'tang5' ? 'rgba(0,109,78,0.1)' : 'rgba(45,103,110,0.1)', color: b.room === 'tang5' ? '#006d4e' : '#2d676e' }}>
                  {b.room === 'tang5' ? 'Tầng 5' : 'Tầng 6'}
                </span>
                <div>
                  <p style={{ fontSize: 12, color: '#323236', fontWeight: 500 }}>{b.date}</p>
                  <p style={{ fontSize: 11, color: '#b2b1b6' }}>{b.timeFrom}–{b.timeTo}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                  {appSt === 'pending' && <span className="badge badge-pending">Chờ duyệt</span>}
                  {appSt === 'rejected' && <span className="badge badge-rejected">Từ chối</span>}
                  {timeSt && <span className={`badge badge-${timeSt}`}>{timeSt === 'upcoming' ? 'Sắp tới' : timeSt === 'ongoing' ? 'Đang họp' : 'Đã xong'}</span>}
                </div>
                <div>
                  <span className="badge" style={{ background: b.minutesFile ? 'rgba(0,109,78,0.1)' : 'rgba(178,177,182,0.1)', color: b.minutesFile ? '#006d4e' : '#7b7a7f' }}>
                    {b.minutesFile ? 'Đã nộp' : 'Chưa nộp'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {appSt === 'pending' && (
                    <>
                      <button className="btn-icon" onClick={() => approveBooking(b._id)} title="Duyệt"><span className="material-symbols-outlined" style={{ color: '#006d4e', fontSize: 18 }}>check_circle</span></button>
                      <button className="btn-icon" onClick={() => setRejectModal({ open: true, booking: b })} title="Từ chối"><span className="material-symbols-outlined" style={{ color: '#a83836', fontSize: 18 }}>cancel</span></button>
                    </>
                  )}
                  {(appSt === 'approved' && timeSt !== 'done') ? (
                    <button className="btn-icon" onClick={() => setDeleteModal({ open: true, booking: b })} title="Huỷ lịch đặt">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  ) : appSt !== 'pending' && <div style={{ width: 18 }} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {deleteModal.open && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setDeleteModal({ open: false, booking: null }) }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168,56,54,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined fill-icon" style={{ color: '#a83836', fontSize: 22 }}>event_busy</span>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#323236' }}>Huỷ lịch đặt phòng</h3>
                <p style={{ fontSize: 12, color: '#7b7a7f', marginTop: 2 }}>{deleteModal.booking?.userName}</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#b2b1b6', marginBottom: 16, lineHeight: 1.5 }}>
              {deleteModal.booking?.reason} · {deleteModal.booking?.date} · {deleteModal.booking?.timeFrom}–{deleteModal.booking?.timeTo}
            </p>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#7b7a7f', textTransform: 'uppercase', marginBottom: 8 }}>Lý do huỷ (tuỳ chọn)</label>
            <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} rows={2}
              placeholder="Thành viên sẽ nhận thông báo kèm lý do này..." className="modal-textarea" />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="modal-btn-secondary" onClick={() => { setDeleteModal({ open: false, booking: null }); setDeleteReason('') }}>Không</button>
              <button className="modal-btn-primary danger" onClick={confirmDelete} disabled={deleting}>{deleting ? '...' : 'Xác nhận huỷ'}</button>
            </div>
          </div>
        </div>
      )}

      {rejectModal.open && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setRejectModal({ open: false, booking: null }) }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168,56,54,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined fill-icon" style={{ color: '#a83836', fontSize: 22 }}>cancel</span>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#323236' }}>Từ chối lịch đặt</h3>
                <p style={{ fontSize: 12, color: '#7b7a7f', marginTop: 2 }}>{rejectModal.booking?.userName}</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#b2b1b6', marginBottom: 16, lineHeight: 1.5 }}>
              {rejectModal.booking?.reason} · {rejectModal.booking?.date} · {rejectModal.booking?.timeFrom}–{rejectModal.booking?.timeTo}
            </p>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#7b7a7f', textTransform: 'uppercase', marginBottom: 8 }}>Lý do (tuỳ chọn)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2}
              placeholder="Vd: Phòng đang sửa chữa..." className="modal-textarea" />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="modal-btn-secondary" onClick={() => { setRejectModal({ open: false, booking: null }); setRejectReason('') }}>Huỷ bỏ</button>
              <button className="modal-btn-primary danger" onClick={confirmReject} disabled={deleting}>{deleting ? '...' : 'Từ chối'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB 3: THỐNG KÊ
═══════════════════════════════════════════════════════════ */
function ReportTab() {
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 8) + '01'
  const [from,   setFrom]   = useState(monthStart)
  const [to,     setTo]     = useState(today)
  const [report, setReport] = useState<any>(null)
  const [stats,  setStats]  = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadStats(); loadReport() }, [])

  async function loadStats() {
    const res = await adminGetStatsApi()
    if (res.success) setStats(res.data)
  }
  async function loadReport() {
    setLoading(true)
    const res = await adminGetReportApi(from, to)
    if (res.success) setReport(res.data)
    setLoading(false)
  }

  const tang5Pct = report ? Math.round((report.byRoom?.tang5 || 0) / Math.max(report.total, 1) * 100) : 0
  const tang6Pct = report ? Math.round((report.byRoom?.tang6 || 0) / Math.max(report.total, 1) * 100) : 0

  return (
    <>
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: '#323236' }}>Thống kê & Báo cáo</h1>
          <p style={{ fontSize: 11, color: '#b2b1b6', marginTop: 1 }}>Phân tích hiệu suất sử dụng phòng họp</p>
        </div>
      </div>

      <div className="content-area fade-in">
        {/* Overall */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Tổng thành viên', val: stats.users?.total || 0,    icon: 'group',          bg: 'rgba(178,177,182,0.1)', ic: '#7b7a7f' },
              { label: 'Đã được duyệt',   val: stats.users?.approved || 0, icon: 'verified_user',  bg: 'rgba(0,109,78,0.1)',    ic: '#006d4e' },
              { label: 'Tổng lịch đặt',   val: stats.bookings?.total || 0, icon: 'calendar_month', bg: 'rgba(45,103,195,0.08)', ic: '#1e56a0' },
              { label: 'Đặt hôm nay',     val: stats.bookings?.today || 0, icon: 'trending_up',    bg: 'rgba(45,103,110,0.08)', ic: '#2d676e' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span className="material-symbols-outlined fill-icon" style={{ color: s.ic, fontSize: 22 }}>{s.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 26, fontWeight: 700, color: '#323236', lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: '#b2b1b6', marginTop: 4 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Date filter */}
        <div className="panel" style={{ marginBottom: 20, padding: '20px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#323236', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#7b7a7f' }}>filter_list</span>
            Lọc theo khoảng thời gian
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#7b7a7f', fontWeight: 500 }}>Từ</span>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="date-input" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#7b7a7f', fontWeight: 500 }}>Đến</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="date-input" />
            </div>
            <button onClick={loadReport} disabled={loading} style={{
              padding: '8px 18px', background: '#006d4e', color: '#e5fff0',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', opacity: loading ? 0.6 : 1,
            }}>{loading ? 'Đang tải...' : 'Xem báo cáo'}</button>
          </div>
        </div>

        {report && (
          <>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Tổng lịch đặt', val: report.total, sub: 'trong khoảng đã chọn', color: '#323236' },
                { label: 'Tổng giờ họp', val: `${report.totalHours}h`, sub: 'thời gian sử dụng', color: '#006d4e' },
                {
                  label: 'Phòng dùng nhiều', 
                  val: (report.byRoom?.tang5 || 0) >= (report.byRoom?.tang6 || 0) ? 'Phòng lớn' : 'Phòng nhỏ',
                  sub: `T5: ${report.byRoom?.tang5 || 0} · T6: ${report.byRoom?.tang6 || 0} lượt`,
                  color: '#2d676e',
                },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px 24px', gap: 6 }}>
                  <p style={{ fontSize: 11, color: '#b2b1b6', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: '#b2b1b6' }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Room usage */}
            <div className="panel" style={{ marginBottom: 20, padding: '24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#323236', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined fill-icon" style={{ fontSize: 20, color: '#7b7a7f' }}>meeting_room</span>
                Tỉ lệ sử dụng theo phòng
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { name: 'Phòng họp lớn (Tầng 5)', count: report.byRoom?.tang5 || 0, pct: tang5Pct, color: '#006d4e' },
                  { name: 'Phòng họp nhỏ (Tầng 6)', count: report.byRoom?.tang6 || 0, pct: tang6Pct, color: '#2d676e' },
                ].map(r => (
                  <div key={r.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#323236' }}>{r.name}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.count} lượt ({r.pct}%)</p>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top users */}
            {report.topUsers?.length > 0 && (
              <div className="panel">
                <div className="panel-header">
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#323236' }}>Top thành viên đặt phòng</p>
                </div>
                <div className="table-header" style={{ gridTemplateColumns: '32px 1fr 1fr 80px 80px' }}>
                  {['#', 'Họ tên', 'Phòng ban', 'Số lượt', 'Giờ họp'].map((h, i) => (
                    <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#b2b1b6', textTransform: 'uppercase', textAlign: i > 2 ? 'right' : 'left' }}>{h}</span>
                  ))}
                </div>
                {report.topUsers.map((u: any, i: number) => (
                  <div key={u.userId} className="table-row" style={{ gridTemplateColumns: '32px 1fr 1fr 80px 80px' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: i === 0 ? 'rgba(245,163,0,0.15)' : i === 1 ? '#f0eef2' : i === 2 ? 'rgba(180,100,0,0.1)' : '#f5f3f6',
                      color: i === 0 ? '#b07800' : i === 1 ? '#7b7a7f' : i === 2 ? '#8a5c00' : '#b2b1b6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>{i+1}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#323236' }}>{u.name}</p>
                    <p style={{ fontSize: 12, color: '#5f5f63' }}>{u.department}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#006d4e', textAlign: 'right' }}>{u.count} lượt</p>
                    <p style={{ fontSize: 12, color: '#b2b1b6', textAlign: 'right' }}>{(u.minutes / 60).toFixed(1)}h</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
