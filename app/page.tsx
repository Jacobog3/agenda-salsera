import EventsFeed from "./components/EventsFeed";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[700px] px-4 py-6">
      <header className="mb-5">
        <h1 className="text-[36px] font-extrabold tracking-[-0.02em]">
          Agenda{" "}
          <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2 py-0.5 text-white">
            Salsera
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-neutral-600">
          Eventos Salseros por fecha para encontrar rápido qué hacer este fin de semana.
        </p>
      </header>

      <EventsFeed />

      {/* FAB: bottom-right */}
      <a
        href="https://forms.gle/5D1XinPgBf8uaL9r7"
        target="_blank"
        aria-label="Enviar evento"
        className="fixed bottom-5 right-5 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-800"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </a>
    </main>
  );
}