import { NextRequest, NextResponse } from 'next/server'

interface Booking {
  id: string; name: string; team: string; room: string; reason: string
  date: string; timeFrom: string; timeTo: string; note?: string
  status: string; minutesFile?: string; createdAt: string
}

const store: Booking[] = []

function getStatus(date: string, timeFrom: string, timeTo: string) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const nowMin = now.getHours()*60+now.getMinutes()
  const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
  if (date > today) return 'upcoming'
  if (date < today) return 'done'
  if (nowMin < toMin(timeFrom)) return 'upcoming'
  if (nowMin >= toMin(timeTo)) return 'done'
  return 'ongoing'
}

function hasConflict(room: string, date: string, from: string, to: string) {
  const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
  return store.find(b => b.room === room && b.date === date &&
    toMin(from) < toMin(b.timeTo) && toMin(to) > toMin(b.timeFrom)) ?? null
}

export async function GET() {
  store.forEach(b => { b.status = getStatus(b.date, b.timeFrom, b.timeTo) })
  return NextResponse.json(store)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, team, room, reason, date, timeFrom, timeTo, note } = body
  if (!name || !team || !room || !reason || !date || !timeFrom || !timeTo)
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  const conflict = hasConflict(room, date, timeFrom, timeTo)
  if (conflict) return NextResponse.json({ error: 'TRÙNG GIỜ', conflict }, { status: 409 })
  const booking: Booking = {
    id: Date.now().toString(), name, team, room, reason, date, timeFrom, timeTo,
    note: note || '', status: getStatus(date, timeFrom, timeTo), createdAt: new Date().toISOString(),
  }
  store.push(booking)
  return NextResponse.json(booking, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const idx = store.findIndex(b => b.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
  store.splice(idx, 1)
  return NextResponse.json({ ok: true })
}
