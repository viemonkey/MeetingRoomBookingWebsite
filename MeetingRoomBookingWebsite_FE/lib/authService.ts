const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ── Token helpers ─────────────────────────────────────────────
export function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null }
export function saveToken(t: string) { localStorage.setItem('nexus_token', t) }
export function removeToken() { localStorage.removeItem('nexus_token') }

export function getUser() {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('nexus_user'); return u ? JSON.parse(u) : null
}
export function saveUser(u: object) { localStorage.setItem('nexus_user', JSON.stringify(u)) }
export function removeUser() { localStorage.removeItem('nexus_user') }

function authHeader() { return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }

// ── Auth ──────────────────────────────────────────────────────
export async function loginApi(data: { email: string; password: string }) {
  const r = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
  return r.json()
}

export async function registerApi(data: { fullName: string; email: string; department: string; password: string }) {
  const r = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
  return r.json()
}

export async function getMeApi() {
  const r = await fetch(`${API}/api/auth/me`, { headers: authHeader() })
  return r.json()
}

export async function logoutApi() {
  await fetch(`${API}/api/auth/logout`, { method:'POST', headers: authHeader() }).catch(()=>{})
  removeToken(); removeUser()
}

// ── Bookings ──────────────────────────────────────────────────
export async function getBookingsApi(date?: string) {
  const url = date ? `${API}/api/bookings?date=${date}` : `${API}/api/bookings`
  const r = await fetch(url, { headers: authHeader() })
  return r.json()
}

export async function getMyBookingsApi() {
  const r = await fetch(`${API}/api/bookings/my`, { headers: authHeader() })
  return r.json()
}

export async function createBookingApi(data: {
  room: string; team: string; reason: string
  date: string; timeFrom: string; timeTo: string; note?: string
}) {
  const r = await fetch(`${API}/api/bookings`, {
    method:'POST', headers: authHeader(), body: JSON.stringify(data)
  })
  return r.json()
}

export async function deleteBookingApi(id: string) {
  const r = await fetch(`${API}/api/bookings/${id}`, { method:'DELETE', headers: authHeader() })
  return r.json()
}

export async function uploadMinutesApi(bookingId: string, file: File) {
  const fd = new FormData(); fd.append('file', file)
  const r = await fetch(`${API}/api/bookings/${bookingId}/minutes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  })
  return r.json()
}

// ── Notifications ─────────────────────────────────────────────
export async function getNotificationsApi() {
  const r = await fetch(`${API}/api/notifications`, { headers: authHeader() })
  return r.json()
}

export async function markReadApi(id: string) {
  const r = await fetch(`${API}/api/notifications/${id}/read`, { method:'PATCH', headers: authHeader() })
  return r.json()
}

export async function markAllReadApi() {
  const r = await fetch(`${API}/api/notifications/read-all`, { method:'PATCH', headers: authHeader() })
  return r.json()
}
