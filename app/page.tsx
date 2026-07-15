export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">FindOrigin</h1>
      <p className="mt-4 text-gray-600">
        Telegram-бот для поиска источников информации.
      </p>
      <a
        href="/mini-app"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Открыть Mini App
      </a>
      <p className="mt-4 text-sm text-gray-400">
        Webhook: <code>/api/webhook</code> · Mini App: <code>/mini-app</code>
      </p>
    </main>
  );
}
