import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('[google-auth] sem Authorization')
    return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  console.log('[google-auth] NEXT_PUBLIC_API_BASE_URL =', base)

  const url = `${base}/google/auth`
  console.log('[google-auth] proxying to', url)

  const backendRes = await fetch(url, {
    method: 'GET',
    headers: { Authorization: authHeader },
    redirect: 'manual',
  })

  console.log('[google-auth] backend status:', backendRes.status)
  console.log('[google-auth] backend location:', backendRes.headers.get('location'))

  const location = backendRes.headers.get('location')
  if (location) {
    return NextResponse.redirect(location, 302)
  }

  const text = await backendRes.text()
  console.error('[google-auth] resposta inesperada:', text)
  return NextResponse.json(
    { error: 'Erro ao iniciar OAuth do Google' },
    { status: 500 }
  )
}
