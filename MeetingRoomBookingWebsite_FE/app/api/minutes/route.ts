import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const id = formData.get('id') as string
  const file = formData.get('file') as File | null
  if (!id || !file) return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 })
  if (!file.name.match(/\.(doc|docx)$/i))
    return NextResponse.json({ error: 'Chỉ chấp nhận .doc hoặc .docx' }, { status: 400 })
  return NextResponse.json({ ok: true, fileName: file.name })
}
