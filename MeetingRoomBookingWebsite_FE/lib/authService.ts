const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  department: string
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: { token: string; user: AuthUser }
  errors?: { field: string; message: string }[]
}

// Lưu token vào localStorage
export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('nexus_token', token)
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('nexus_token')
  return null
}

export function removeToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('nexus_token')
}

export function saveUser(user: AuthUser) {
  if (typeof window !== 'undefined') localStorage.setItem('nexus_user', JSON.stringify(user))
}

export function getUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const u = localStorage.getItem('nexus_user')
    return u ? JSON.parse(u) : null
  }
  return null
}

export function removeUser() {
  if (typeof window !== 'undefined') localStorage.removeItem('nexus_user')
}

// POST /api/auth/register
export async function registerApi(data: {
  fullName: string
  email: string
  department: string
  password: string
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// POST /api/auth/login
export async function loginApi(data: {
  email: string
  password: string
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// GET /api/auth/me
export async function getMeApi(): Promise<AuthResponse> {
  const token = getToken()
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

// POST /api/auth/logout
export async function logoutApi() {
  const token = getToken()
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {})
  removeToken()
  removeUser()
}
