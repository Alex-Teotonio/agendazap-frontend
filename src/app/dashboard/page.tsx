'use client'
import { useState } from "react";
import Link from 'next/link';
import api from "@/lib/axios";
import { Sidebar, SidebarItem } from "@/components/ui/sidebar";
import { TopBar } from "@/components/ui/topbar";
import { Home, Users, Calendar, Settings, Zap, RotateCw } from 'lucide-react';

interface SentMessageDetail {
  sid: string;
  to: string;
  body: string;
  status: string;
  dateSent?: string;
  dateCreated?: string;
  errorCode?: string;
  errorMessage?: string;
}


export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // no Dashboard component

  const handleGoogleAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("VocÃª precisa estar logado");
    // coloco o token na URL â€” atenÃ§Ã£o: expÃµe o token no histÃ³rico do browser!
    window.location.href = 
      `https://vprikxgmlf.execute-api.us-east-1.amazonaws.com/google/auth?token=${encodeURIComponent(token)}`;
  };
  
  
  
  const handleAction = async (path: string) => {
    setStatus(`? Executando: ${path}`);
    try {
      const res = await api.get(path);
      setStatus(`? Sucesso: ${JSON.stringify(res.data)}`);
    } 
    catch (_err: unknown) {
      const err = _err instanceof Error
        ? _err
        : new Error('Erro desconhecido ao iniciar OAuth')
      setStatus(`❌ ${err.message}`)
    }
  };

  const fetchSentMessagesToday = async () => {
    setStatus("🔄 Buscando mensagens enviadas hoje...");
    try {
      const res = await api.get("/messages/sent-today");
      setStatus(`✅ Mensagens enviadas hoje: ${JSON.stringify(res.data)}`);
    } 
    catch (_err: unknown) {
      const err = _err instanceof Error
        ? _err
        : new Error('Erro desconhecido ao iniciar OAuth')
      setStatus(`❌ ${err.message}`)
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}>
        <Link href="/dashboard">
          <SidebarItem icon={<Home size={20}/>} label="Dashboard" collapsed={collapsed} />
        </Link>
        <Link href="/pacientes">
          <SidebarItem icon={<Users size={20}/>} label="Pacientes" collapsed={collapsed} />
        </Link>
        <Link href="/eventos">
          <SidebarItem icon={<Calendar size={20}/>} label="Eventos" collapsed={collapsed} />
        </Link>
        <Link href="/configuracao-whatsapp">
          <SidebarItem icon={<Settings size={20}/>} label="Configura��o" collapsed={collapsed} />
        </Link>
        <Link href="/google-calendar">
          <SidebarItem icon={<Zap size={20}/>} label="Google Calendar" collapsed={collapsed} />
        </Link>
        <Link href="/confirmacoes-2d">
          <SidebarItem icon={<RotateCw size={20}/>} label="Confirma��es 2d" collapsed={collapsed} />
        </Link>
        <Link href="/suporte">
          <SidebarItem icon={<RotateCw size={20}/>} label="Suporte" collapsed={collapsed} />
        </Link>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <TopBar>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <button
        onClick={handleGoogleAuth}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Autenticar Google
      </button>
      {status && <div className="mt-4 text-sm">{status}</div>}
        </TopBar>

        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Operações</h2>
          <div className="flex flex-wrap gap-4">


            <button
              onClick={() => handleAction("/confirmation2days/send")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Confirmação 2 dias
            </button>
            <button
              onClick={() => handleAction("/confirmation7days/send")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Confirmação 7 dias
            </button>
            <button
              onClick={() => handleAction("/support/send")}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Notificação Suporte
            </button>

            <button
              onClick={fetchSentMessagesToday}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
              Ver mensagens enviadas hoje
            </button>

          </div>
          {status && (
  <div className="bg-white rounded p-4 shadow mt-4 text-sm whitespace-pre-wrap">
    {status}
    {status.startsWith("✅ Mensagens enviadas hoje:") && (() => {
      try {

        const parsed = JSON.parse(
          status.replace(/^✅ Mensagens enviadas hoje: /, "")
        ) as { details: SentMessageDetail[] };
        return parsed.details.map((msg) => (
          <div key={msg.sid} className="border-b py-2">
            <div><strong>Para:</strong> {msg.to}</div>
            <div><strong>Status:</strong> {msg.status}</div>
            <div><strong>Mensagem:</strong> {msg.body}</div>
            <div><strong>Enviado em:</strong> {msg.dateSent || 'N/A'}</div>
            {msg.errorCode && (
              <div className="text-red-500">
                <strong>Erro:</strong> {msg.errorCode} - {msg.errorMessage}
              </div>
            )}
          </div>
        ));
      } catch (e) {
        console.error("Erro ao processar JSON:", e);
        return <div className="text-red-500">Erro ao processar os detalhes das mensagens.</div>;
      }
    })()}
  </div>
)}
       </div>
      </div>
    </div>
  );
}
