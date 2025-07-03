'use client';

import { useEffect, useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import api from '@/lib/axios';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg, EventClickArg } from '@fullcalendar/interaction';

const FullCalendar = dynamic(
  () => import('@fullcalendar/react').then((mod) => mod.default),
  { ssr: false }
);

const CAL_CSS = (
  <Head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@fullcalendar/common@6.1.8/index.global.min.css"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/index.global.min.css"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.8/index.global.min.css"
    />
  </Head>
);

type Patient = { SK: string; nome: string };
type Appointment = {
  SK: string;
  pacienteId: string;
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
};

export default function EventosPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authNeeded, setAuthNeeded] = useState(false);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [submitting, setSubmitting] = useState(false);

  const redirectToGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/google/auth`;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, aRes] = await Promise.all([
          api.get<Patient[]>('/patients'),
          api.get<Appointment[]>('/appointments'),
        ]);
        setPatients(pRes.data);
        setAppointments(aRes.data);
      } catch (err: any) {
        // Se for erro de autenticação Google, pedimos o OAuth
        if (err.response?.status === 401 || err.response?.status === 403) {
          setAuthNeeded(true);
        } else {
          setError(err.message || 'Erro ao carregar dados');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
  };
  const handleEventClick = (arg: EventClickArg) => {
    alert(
      `Consulta: ${arg.event.title}\n` +
      `Início: ${arg.event.start?.toLocaleString()}\n` +
      `Fim: ${arg.event.end?.toLocaleString()}`
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDate) return;
    setSubmitting(true);
    setError(null);

    try {
      const start = `${selectedDate}T${startTime}:00.000Z`;
      const end   = `${selectedDate}T${endTime}:00.000Z`;
      const payload = {
        pacienteId: selectedPatient,
        summary, description, location, start, end,
      };
      const res = await api.post<{ appointment: Appointment }>('/appointments', payload);
      setAppointments(curr => [...curr, res.data.appointment]);
      setSummary(''); setDescription(''); setLocation('');
    } catch (err: any) {
      // Se for token Google expirado, redireciona
      if (err.response?.status === 401 || err.response?.status === 403) {
        redirectToGoogleAuth();
        return;
      }
      setError(err.response?.data?.error || err.message || 'Erro ao agendar');
    } finally {
      setSubmitting(false);
    }
  };

  // Enquanto carrega...
  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  // Se precisamos primeiro autenticar no Google
  if (authNeeded) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4 text-red-600">
          É necessário conectar sua conta Google para usar o calendário.
        </p>
        <button
          onClick={redirectToGoogleAuth}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Conectar ao Google
        </button>
      </div>
    );
  }

  return (
    <>
      {CAL_CSS}
      <div className="flex space-x-6 p-6">
        {/* Calendário */}
        <div className="w-2/3">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            selectable
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            events={appointments.map(e => ({
              title: e.summary,
              start: e.start,
              end:   e.end,
            }))}
            height="auto"
          />
        </div>

        {/* Formulário */}
        <div className="w-1/3 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Agendar Consulta</h2>
          {error && <div className="text-red-600 mb-2">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Data</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Horário Início</label>
              <input
                type="time"
                className="w-full border rounded p-2"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Horário Fim</label>
              <input
                type="time"
                className="w-full border rounded p-2"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Paciente</label>
              <select
                className="w-full border rounded p-2"
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {patients.map(p => (
                  <option key={p.SK} value={p.SK}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Título</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Descrição</label>
              <textarea
                className="w-full border rounded p-2"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium">Local</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Agendando...' : 'Agendar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
