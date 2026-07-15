import Script from "next/script";
import type { Metadata, Viewport } from "next";
import "../globals.css";
import "./mini-app.css";

export const metadata: Metadata = {
  title: "FindOrigin",
  description: "Поиск первоисточника информации",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="tma-body">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
