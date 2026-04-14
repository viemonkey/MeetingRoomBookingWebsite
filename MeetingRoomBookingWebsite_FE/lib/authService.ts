const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null }
export function saveToken(t: string) { localStorage.setItem('nexus_token', t) }
export function removeToken() { localStorage.removeItem('nexus_token') }
export function getUser(): any { if (typeof window === 'undefined') return null; const u = localStorage.getItem('nexus_user'); return u ? JSON.parse(u) : null }
export function saveUser(u: object) { localStorage.setItem('nexus_user', JSON.stringify(u)) }
export function removeUser() { localStorage.removeItem('nexus_user') }

function h() { return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }

export async function loginApi(data: { email: string; password: string }) {
  const r = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  return r.json()
}
export async function registerApi(data: { fullName: string; email: string; department: string; password: string }) {
  const r = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  return r.json()
}
export async function logoutApi() {
  await fetch(`${API}/api/auth/logout`, { method: 'POST', headers: h() }).catch(() => { })
  removeToken(); removeUser()
}
export async function getBookingsApi(date?: string) {
  const url = date ? `${API}/api/bookings?date=${date}` : `${API}/api/bookings`
  const r = await fetch(url, { headers: h() }); return r.json()
}
export async function getMyBookingsApi() {
  const r = await fetch(`${API}/api/bookings/my`, { headers: h() }); return r.json()
}
export async function createBookingApi(data: any) {
  const r = await fetch(`${API}/api/bookings`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); return r.json()
}
export async function deleteBookingApi(id: string) {
  const r = await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE', headers: h() }); return r.json()
}
export async function uploadMinutesApi(id: string, file: File) {
  const fd = new FormData(); fd.append('file', file)
  const r = await fetch(`${API}/api/bookings/${id}/minutes`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd })
  return r.json()
}
export async function getNotificationsApi() {
  const r = await fetch(`${API}/api/notifications`, { headers: h() }); return r.json()
}
export async function markReadApi(id: string) {
  const r = await fetch(`${API}/api/notifications/${id}/read`, { method: 'PATCH', headers: h() }); return r.json()
}
export async function markAllReadApi() {
  const r = await fetch(`${API}/api/notifications/read-all`, { method: 'PATCH', headers: h() }); return r.json()
}
