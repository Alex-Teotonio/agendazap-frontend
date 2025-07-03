// components/ui/topbar.tsx
'use client'
import { ReactNode, useEffect, useState } from 'react'
import api from '@/lib/axios'
import { Zap } from 'lucide-react'

export function TopBar({ children }: { children: ReactNode }) {
  const [googleConnected, setGoogleConnected] = useState<boolean|null>(null)

  useEffect(() => {
    // Tenta listar 1 evento s� pra testar se o token Google est� v�lido
    api.get('/appointments?limit=1')
      .then(() => setGoogleConnected(true))
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setGoogleConnected(false)
        }
      })
  }, [])

  const handleConnect = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/google/auth`
  }

  return (
    <div className="flex items-center justify-between bg-white p-4 shadow">
      {children}
      <div className="flex items-center space-x-4">
        {googleConnected === null ? (
          <span className="text-sm text-gray-500">Verificando Google�</span>
        ) : googleConnected ? (
          <span className="flex items-center text-green-600">
            <Zap className="mr-1" size={16} /> Google conectado
          </span>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center space-x-1 text-blue-600 hover:underline"
          >
            <Zap size={16} />
            <span>Conectar Google</span>
          </button>
        )}
      </div>
    </div>
  )
}
