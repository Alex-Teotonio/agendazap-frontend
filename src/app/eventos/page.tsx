'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import api from '@/lib/axios';

// plugins do FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Appointment = {
  summary: string;
  start:   string;
  end:     string;
};

// carrega o FullCalendar só no client (evita SSR)
const FullCalendar = dynamic(
  () => import('@fullcalendar/react').then(mod => mod.default),
  { ssr: false }
);

// injeta o CSS via CDN
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

export default function EventosPage() {
  const [events, setEvents] = useState<Appointment[]>([]);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    api.get<Appointment[]>('/appointments')
      .then(({ data }) => setEvents(data))
      .catch(err => setError(err.message));
  }, []);

  // quando clica num dia vazio
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateClick = (arg: any) => {
    const title = prompt('Título do novo evento:');
    if (title) {
      setEvents(curr => [
        ...curr,
        { summary: title, start: arg.dateStr, end: arg.dateStr }
      ]);
    }
  };

  // quando clica num evento existente
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (arg: any) => {
    alert(
      `Evento: ${arg.event.title}\n` +
      `Início: ${arg.event.start?.toLocaleString()}\n` +
      `Fim: ${arg.event.end?.toLocaleString()}`
    );
  };

  return (
    <>
      {CAL_CSS}
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Consultas Agendadas</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left:  'prev,next today',
            center:'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          selectable={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={events.map(e => ({
            title: e.summary,
            start: e.start,
            end:   e.end
          }))}
          height="auto"
        />
      </div>
    </>
  );
}
