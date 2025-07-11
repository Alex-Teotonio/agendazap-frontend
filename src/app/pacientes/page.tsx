'use client';

import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import api from '@/lib/axios';
import { X, Plus } from 'lucide-react';

type Patient = {
  PK: string;
  SK: string;
  nome: string;
  telefone_whatsapp: string;
  email: string;
  dataNascimento: string | null;
  observacoes: string;
  criadoEm: string;
};

export default function PacientesPage() {
  const [patients, setPatients]     = useState<Patient[]>([]);
  const [filtered, setFiltered]     = useState<Patient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [nome, setNome]                       = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [email, setEmail]                     = useState('');
  const [dataNascimento, setDataNascimento]   = useState('');
  const [observacoes, setObservacoes]         = useState('');

  const [search, setSearch] = useState('');

  // Fetch pacientes
  useEffect(() => {
    api.get<Patient[]>('/patients')
      .then(({ data }) => {
        setPatients(data);
        setFiltered(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtra ao digitar
  useEffect(() => {
    if (!search) return setFiltered(patients);
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    ));
  }, [search, patients]);

  // Submissão do form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nome,
        telefone_whatsapp: telefoneWhatsapp,
        email,
        dataNascimento: dataNascimento || undefined,
        observacoes
      };
      const res = await api.post<{ paciente: Patient }>('/patients', payload);
      const novo = res.data.paciente;
      setPatients(curr => [...curr, novo]);
      setFiltered(curr => [...curr, novo]);
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao criar paciente');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    // limpa form
    setNome('');
    setTelefoneWhatsapp('');
    setEmail('');
    setDataNascimento('');
    setObservacoes('');
    setError(null);
  };

  return (
    <>
      <Head>
        <title>Pacientes</title>
      </Head>

      <div className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            <Plus size={16}/> Novo Paciente
          </button>
        </header>

        {/* Busca */}
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Card com tabela */}
        <div className="bg-white rounded shadow overflow-auto">
          {loading 
            ? <div className="p-6 text-center">Carregando pacientes...</div>
            : (
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Nome</th>
                    <th className="px-4 py-2 text-left font-medium">WhatsApp</th>
                    <th className="px-4 py-2 text-left font-medium">Email</th>
                    <th className="px-4 py-2 text-left font-medium">Nascimento</th>
                    <th className="px-4 py-2 text-left font-medium">Criado Em</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={5} className="p-6 text-center">Nenhum paciente encontrado.</td></tr>
                    : filtered.map(p => (
                      <tr key={p.SK} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{p.nome}</td>
                        <td className="px-4 py-2">{p.telefone_whatsapp}</td>
                        <td className="px-4 py-2">{p.email}</td>
                        <td className="px-4 py-2">{p.dataNascimento || '-'}</td>
                        <td className="px-4 py-2">
                          {new Date(p.criadoEm).toLocaleDateString()}<br/>
                          <span className="text-xs text-gray-500">{new Date(p.criadoEm).toLocaleTimeString()}</span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Novo Paciente</h2>
              <button onClick={closeModal}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="text-red-600">{error}</div>}

              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <input
                  type="tel"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={telefoneWhatsapp}
                  onChange={e => setTelefoneWhatsapp(e.target.value)}
                  placeholder="(31) 9999-8888"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Nasc.</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dataNascimento}
                  onChange={e => setDataNascimento(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-3 px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting
                    ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"/></svg>
                    : 'Salvar'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
