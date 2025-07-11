// EventosPage.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import api from '@/lib/axios';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const FullCalendar = dynamic(() => import('@fullcalendar/react').then((mod) => mod.default), { ssr: false });

const CAL_CSS = (
  <Head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/common@6.1.8/index.global.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/index.global.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.8/index.global.min.css" />
  </Head>
);

type Patient = { SK: string; nome: string };
type DateTimeOrObject = string | { dateTime: string; timeZone: string };

type Appointment = {
  SK: string;
  pacienteId: string;
  summary: string;
  description: string;
  location: string;
  start: DateTimeOrObject;
  end: DateTimeOrObject;
};

export default function EventosPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authNeeded, setAuthNeeded] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
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
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            setAuthNeeded(true);
          } else {
            setError(err.message);
          }
        } else {
          setError(String(err) || 'Erro ao carregar dados');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        pacienteId: selectedPatient,
        summary,
        description,
        location,
        start: { dateTime: `${selectedDate}T${startTime}:00`, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: `${selectedDate}T${endTime}:00`, timeZone: 'America/Sao_Paulo' },
      };
      const res = await api.post<{ appointment: Appointment }>('/appointments', payload);
      setAppointments(curr => [...curr, res.data.appointment]);
      setModalOpen(false);
      setSelectedPatient('');
      setSummary('');
      setDescription('');
      setLocation('');
      setStartTime('10:00');
      setEndTime('11:00');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          redirectToGoogleAuth();
          return;
        }
        setError(err.response?.data?.error ?? err.message);
      } else {
        setError(String(err) || 'Erro ao agendar');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;
  if (authNeeded)
    return (
      <div className="p-6 text-center">
        <p className="mb-4 text-red-600">É necessário conectar sua conta Google para usar o calendário.</p>
        <Button onClick={redirectToGoogleAuth}>Conectar ao Google</Button>
      </div>
    );

  return (
    <>
      {CAL_CSS}
      <div className="p-6 rounded-lg bg-white shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          selectable
          dateClick={handleDateClick}
          events={appointments.map(e => ({
            title: e.summary,
            start: typeof e.start === 'string' ? e.start : e.start.dateTime,
            end: typeof e.end === 'string' ? e.end : e.end.dateTime,
          }))}
          height="auto"
          eventDisplay="block"
        />
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="text-[#4CAF50] font-semibold">Agendar Consulta em {selectedDate}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600">{error}</div>}
            <div>
              <label className="block font-medium">Paciente</label>
              <select
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                required
              >
                <option value="">Selecione...</option>
                {patients.map(p => (
                  <option key={p.SK} value={p.SK}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Resumo</label>
              <input
                type="text"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Descrição</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            </div>
            <div>
              <label className="block font-medium">Local</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Início</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Fim</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Agendando...' : 'Agendar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
