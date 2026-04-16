const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null }
export function saveToken(t: string) { localStorage.setItem('nexus_token', t) }
export function removeToken() { localStorage.removeItem('nexus_token') }
export function getUser(): any { if (typeof window === 'undefined') return null; const u = localStorage.getItem('nexus_user'); return u ? JSON.parse(u) : null }
export function saveUser(u: object) { localStorage.setItem('nexus_user', JSON.stringify(u)) }
export function removeUser() { localStorage.removeItem('nexus_user') }
export function isAdmin(): boolean { return getUser()?.role === 'admin' }
export function isApproved(): boolean { const u = getUser(); return u?.role === 'admin' || u?.status === 'approved' }

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
}

// FIX: fetch wrapper — tự động logout + redirect khi token hết hạn (401)
async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(url, options)

  if (res.status === 401) {
    // Token hết hạn hoặc không hợp lệ → clear localStorage và về login
    removeToken()
    removeUser()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return { success: false, message: 'Phiên đăng nhập đã hết hạn' }
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────
export async function loginApi(data: { email: string; password: string }) {
  const r = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return r.json()
}

export async function registerApi(data: { fullName: string; email: string; department: string; password: string }) {
  const r = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return r.json()
}

export async function logoutApi() {
  await fetch(`${API}/api/auth/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {})
  removeToken()
  removeUser()
}

// FIX: sync user data từ server — gọi sau khi login để luôn có status mới nhất
export async function getMeApi() {
  const res = await apiFetch(`${API}/api/auth/me`, { headers: authHeaders() })
  if (res.success && res.data?.user) {
    saveUser(res.data.user)   // cập nhật localStorage với status mới nhất
    return res.data.user
  }
  return null
}

// ── Bookings ──────────────────────────────────────────────────
export async function getBookingsApi(date?: string) {
  const url = date ? `${API}/api/bookings?date=${date}` : `${API}/api/bookings`
  return apiFetch(url, { headers: authHeaders() })
}

export async function getMyBookingsApi() {
  return apiFetch(`${API}/api/bookings/my`, { headers: authHeaders() })
}

export async function createBookingApi(data: any) {
  return apiFetch(`${API}/api/bookings`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
}

export async function deleteBookingApi(id: string) {
  return apiFetch(`${API}/api/bookings/${id}`, { method: 'DELETE', headers: authHeaders() })
}

export async function uploadMinutesApi(id: string, file: File) {
  const fd = new FormData()
  fd.append('file', file)
  // FIX: apiFetch không dùng được với FormData vì header Content-Type phải để browser tự set
  const res = await fetch(`${API}/api/bookings/${id}/minutes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  })
  if (res.status === 401) {
    removeToken(); removeUser()
    window.location.href = '/login'
    return { success: false, message: 'Phiên đăng nhập đã hết hạn' }
  }
  return res.json()
}

// FIX: URL tải biên bản về
export function getMinutesDownloadUrl(id: string) {
  return `${API}/api/bookings/${id}/minutes`
}

// ── Notifications ─────────────────────────────────────────────
export async function getNotificationsApi() {
  return apiFetch(`${API}/api/notifications`, { headers: authHeaders() })
}

export async function markReadApi(id: string) {
  return apiFetch(`${API}/api/notifications/${id}/read`, { method: 'PATCH', headers: authHeaders() })
}

export async function markAllReadApi() {
  return apiFetch(`${API}/api/notifications/read-all`, { method: 'PATCH', headers: authHeaders() })
}

// ── Admin ─────────────────────────────────────────────────────
export async function adminGetUsersApi(status?: string) {
  const url = status ? `${API}/api/admin/users?status=${status}` : `${API}/api/admin/users`
  return apiFetch(url, { headers: authHeaders() })
}

export async function adminGetStatsApi() {
  return apiFetch(`${API}/api/admin/stats`, { headers: authHeaders() })
}

export async function adminApproveApi(id: string) {
  return apiFetch(`${API}/api/admin/users/${id}/approve`, { method: 'PATCH', headers: authHeaders() })
}

export async function adminRejectApi(id: string, reason?: string) {
  return apiFetch(`${API}/api/admin/users/${id}/reject`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ reason: reason || '' }),
  })
}

export async function adminResetApi(id: string) {
  return apiFetch(`${API}/api/admin/users/${id}/reset`, { method: 'PATCH', headers: authHeaders() })
}


// Admin API functions for booking management

export async function adminGetBookingsApi(params?: { date?: string; room?: string; userId?: string }) {
  const query = new URLSearchParams()
  if (params?.date)   query.set('date',   params.date)
  if (params?.room)   query.set('room',   params.room)
  if (params?.userId) query.set('userId', params.userId)
  return apiFetch(`${API}/api/admin/bookings?${query}`, { headers: authHeaders() })
}

export async function adminDeleteBookingApi(id: string, reason?: string) {
  return apiFetch(`${API}/api/admin/bookings/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ reason: reason || '' }),
  })
}

export async function adminGetReportApi(from?: string, to?: string) {
  const query = new URLSearchParams()
  if (from) query.set('from', from)
  if (to)   query.set('to',   to)
  return apiFetch(`${API}/api/admin/bookings/report?${query}`, { headers: authHeaders() })
}

// Duyệt / từ chối lịch đặt phòng (chức năng trong admin/page.tsx BookingsTab)
// Lưu ý: BE hiện chưa có endpoint này — các hàm dưới đây gọi endpoint /approve và /reject
// nếu BE chưa implement, chúng sẽ trả về lỗi 404 nhưng sẽ không làm crash FE
export async function adminApproveBookingApi(id: string) {
  return apiFetch(`${API}/api/admin/bookings/${id}/approve`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
}

export async function adminRejectBookingApi(id: string, reason?: string) {
  return apiFetch(`${API}/api/admin/bookings/${id}/reject`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ reason: reason || '' }),
  })
}
