'use client';

import { useEffect, useState, FormEvent } from 'react';
import Head from 'next/head';
import api from '@/lib/axios';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // estado do formul�rio
  const [nome, setNome]                       = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [email, setEmail]                     = useState('');
  const [dataNascimento, setDataNascimento]   = useState('');
  const [observacoes, setObservacoes]         = useState('');
  const [submitting, setSubmitting]           = useState(false);

  // carrega pacientes ao montar
  useEffect(() => {
    api.get<Patient[]>('/patients')
      .then(({ data }) => setPatients(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // handler do submit
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
      const res = await api.post<{ message: string; paciente: Patient }>('/patients', payload);
      setPatients(curr => [...curr, res.data.paciente]);
      // limpa form
      setNome('');
      setTelefoneWhatsapp('');
      setEmail('');
      setDataNascimento('');
      setObservacoes('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao criar paciente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pacientes</title>
      </Head>

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Gest�o de Pacientes</h1>

        {/* Formul�rio de cadastro */}
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-lg">
          {error && <div className="text-red-600">{error}</div>}

          <div>
            <label className="block font-medium">Nome</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Telefone WhatsApp</label>
            <input
              type="tel"
              className="w-full border rounded p-2"
              value={telefoneWhatsapp}
              onChange={e => setTelefoneWhatsapp(e.target.value)}
              placeholder="+5511999998888"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Data de Nascimento</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={dataNascimento}
              onChange={e => setDataNascimento(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Observa��es</label>
            <textarea
              className="w-full border rounded p-2"
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Cadastrando...' : 'Cadastrar Paciente'}
          </button>
        </form>

        {/* Tabela de pacientes */}
        {loading ? (
          <div>Carregando pacientes...</div>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Nome</th>
                <th className="border px-4 py-2">WhatsApp</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Nascimento</th>
                <th className="border px-4 py-2">Criado Em</th>
                <th className="border px-4 py-2">Observa��es</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.SK}>
                  <td className="border px-4 py-2">{p.nome}</td>
                  <td className="border px-4 py-2">{p.telefone_whatsapp}</td>
                  <td className="border px-4 py-2">{p.email}</td>
                  <td className="border px-4 py-2">{p.dataNascimento || '-'}</td>
                  <td className="border px-4 py-2">
                    {new Date(p.criadoEm).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">{p.observacoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
