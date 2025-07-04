// app/api/google-auth/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // 1) Pega o Authorization que o cliente vai enviar via fetch()
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
  }

  // 2) Chama seu backend proxy, sem CORS, e sem seguir o redirect automaticamente
  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/google/auth`,
    {
      method: 'GET',
      headers: { Authorization: authHeader },
      redirect: 'manual',
    }
  )

  // 3) Seu backend responde 302 com Location=accounts.google.com/...
  const location = backendRes.headers.get('location')
  if (location) {
    // devolve um 302 pro browser COM o mesmo Location
    return NextResponse.redirect(location, 302)
  }

  return NextResponse.json(
    { error: 'Erro ao iniciar OAuth do Google' },
    { status: 500 }
  )
}
