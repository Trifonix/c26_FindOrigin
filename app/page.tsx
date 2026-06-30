export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">FindOrigin</h1>
      <p className="mt-4 text-gray-600">
        Telegram-бот для поиска источников информации.
      </p>
      <p className="mt-2 text-sm text-gray-400">
        Webhook: <code>/api/telegram/webhook</code>
      </p>
    </main>
  );
}
