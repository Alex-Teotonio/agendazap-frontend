// features/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type JWTPayload = {
  nutriId: string
  email: string
  iat: number
  exp: number
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post<{ token: string }>('/auth/login', {
        email,
        password: senha,
      })
      const { token } = res.data
      const [, base64] = token.split('.')
      const payload = JSON.parse(atob(base64)) as JWTPayload

      localStorage.setItem('token', token)
      localStorage.setItem('nutriId', payload.nutriId)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      router.push('/dashboard')
    } catch {
      alert('Erro no login. Verifique email e senha.')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground text-center">
          Entrar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 bg-input placeholder-muted-foreground text-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="senha" className="text-muted-foreground">
              Senha
            </Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="mt-1 bg-input placeholder-muted-foreground text-foreground"
            />
          </div>
          <Button type="submit" variant="default" className="w-full">
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
