// app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'
import { Sidebar, SidebarItem } from '@/components/ui/sidebar'
import { TopBar } from '@/components/ui/topbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Home, Users, Calendar } from 'lucide-react'

interface SentMessageDetail {
  sid: string
  to: string
  body: string
  status: string
  dateSent?: string
  dateCreated?: string
  errorCode?: string
  errorMessage?: string
}


export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [messages, setMessages] = useState<SentMessageDetail[]>([])

  const handleGoogleAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Você precisa estar logado')
    window.location.href = `https://vprikxgmlf.execute-api.us-east-1.amazonaws.com/google/auth?token=${encodeURIComponent(
      token
    )}`
  }

  const handleAction = async (path: string) => {
    setStatus(`🔄 Executando: ${path}`)
    try {
      await api.get(path)
      setStatus(`✅ Sucesso!`)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      setStatus(`❌ ${error.message}`)
    }
  }

  const fetchSentMessagesToday = async () => {
    setStatus('🔄 Carregando mensagens enviadas hoje...')
    try {
      const res = await api.get<{ details: SentMessageDetail[] }>(
        '/messages/sent-today'
      )
      setMessages(res.data.details)
      setStatus(null)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      setStatus(`❌ ${error.message}`)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}>
        <Link href="/dashboard">
          <SidebarItem
            icon={<Home size={20} />}
            label="Dashboard"
            collapsed={collapsed}
          />
        </Link>
        <Link href="/pacientes">
          <SidebarItem
            icon={<Users size={20} />}
            label="Pacientes"
            collapsed={collapsed}
          />
        </Link>
        <Link href="/eventos">
          <SidebarItem
            icon={<Calendar size={20} />}
            label="Eventos"
            collapsed={collapsed}
          />
        </Link>
      </Sidebar>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col">
        <TopBar>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </TopBar>

        <div className="p-6 space-y-6 overflow-auto">
          {/* Card de Operações */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Operações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleGoogleAuth}
                >
                  Autenticar Google
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleAction('/confirmation2days/send')}
                >
                  Confirmação 2 dias
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleAction('/confirmation7days/send')}
                >
                  Confirmação 7 dias
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={fetchSentMessagesToday}
                >
                  Ver mensagens hoje
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mensagens enviadas hoje */}
          {messages.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Mensagens enviadas hoje</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Para</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Enviado em</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.sid}>
                        <TableCell>{msg.to}</TableCell>
                        <TableCell>{msg.status}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {msg.body}
                        </TableCell>
                        <TableCell>
                          {msg.dateSent ?? msg.dateCreated ?? '—'}
                        </TableCell>
                        <TableCell className="text-destructive">
                          {msg.errorCode
                            ? `${msg.errorCode}: ${msg.errorMessage}`
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Feedback de status */}
          {status && (
            <div className="text-center text-sm text-muted-foreground">
              {status}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
