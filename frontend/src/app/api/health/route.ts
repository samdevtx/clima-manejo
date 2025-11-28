import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const res = await fetch(`${backendUrl}/health/`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ status: 'down' }, { status: 502 })
    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ status: 'down' }, { status: 502 })
  }
}

