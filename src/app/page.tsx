export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-800">
      <header className="w-full px-6 py-4 flex justify-between items-center shadow-sm bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-green-600">Agendazap</h1>
        <a href="/login" className="text-green-600 font-medium hover:underline">Entrar</a>
      </header>

      <main className="px-6 py-16 max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold">Confirmações de consulta automáticas</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Agendazap ajuda nutricionistas a reduzir faltas, automatizar confirmações por WhatsApp e manter a agenda sempre cheia.
          </p>
          <a
            href="/register"
            className="inline-block bg-green-600 text-white text-lg font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition"
          >
            Criar Conta Grátis
          </a>
        </section>

        <section className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Agenda Integrada</h3>
            <p className="text-sm text-gray-600">Visualize e gerencie seus agendamentos com facilidade em um calendário intuitivo.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Confirmações Automáticas</h3>
            <p className="text-sm text-gray-600">Envie mensagens automáticas por WhatsApp 7 e 2 dias antes das consultas.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Relatórios de Envio</h3>
            <p className="text-sm text-gray-600">Tenha visibilidade sobre todas as mensagens enviadas e seus status.</p>
          </div>
        </section>

        <section className="bg-green-100 rounded-2xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-green-700">Pronto para reduzir faltas nas consultas?</h3>
          <a
            href="/register"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition"
          >
            Comece Agora
          </a>
        </section>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Agendazap. Todos os direitos reservados.
      </footer>
    </div>
  );
}
