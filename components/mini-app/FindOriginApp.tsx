"use client";

import { useCallback, useEffect, useState } from "react";
import type { RankedSourceResult, SearchApiResponse } from "@/lib/types/telegram-webapp";

type AppState = "idle" | "loading" | "success" | "error";

function confidenceLabel(confidence: number): string {
  if (confidence >= 75) return "Высокая";
  if (confidence >= 55) return "Средняя";
  return "Низкая";
}

function confidenceColor(confidence: number): string {
  if (confidence >= 75) return "var(--tma-success)";
  if (confidence >= 55) return "var(--tma-warning)";
  return "var(--tma-muted)";
}

export function FindOriginApp() {
  const [text, setText] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [sources, setSources] = useState<RankedSourceResult[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [inTelegram, setInTelegram] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
    setInTelegram(true);
  }, []);

  const search = useCallback(async () => {
    const trimmed = text.trim();
    if (trimmed.length < 20) {
      setError("Минимум 20 символов — вставьте новость или ссылку на пост.");
      setState("error");
      window.Telegram?.WebApp.HapticFeedback.notificationOccurred("error");
      return;
    }

    setState("loading");
    setError("");
    setSources([]);
    window.Telegram?.WebApp.HapticFeedback.impactOccurred("light");

    try {
      const response = await fetch("/api/mini-app/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(window.Telegram?.WebApp.initData
            ? { "X-Telegram-Init-Data": window.Telegram.WebApp.initData }
            : {}),
        },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = (await response.json()) as SearchApiResponse;

      if (!data.ok) {
        throw new Error(data.error ?? "Ошибка поиска");
      }

      setQuery(data.query ?? trimmed);
      setSources(data.sources ?? []);
      setState("success");
      window.Telegram?.WebApp.HapticFeedback.notificationOccurred(
        data.sources?.length ? "success" : "warning",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(message);
      setState("error");
      window.Telegram?.WebApp.HapticFeedback.notificationOccurred("error");
    }
  }, [text]);

  return (
    <div className="tma-shell">
      <header className="tma-header">
        <div className="tma-logo">FO</div>
        <div>
          <h1 className="tma-title">FindOrigin</h1>
          <p className="tma-subtitle">Поиск первоисточника информации</p>
        </div>
      </header>

      {!inTelegram && (
        <div className="tma-banner">
          Откройте через Telegram-бота для полного доступа
        </div>
      )}

      <section className="tma-card">
        <label htmlFor="query" className="tma-label">
          Текст новости или ссылка t.me/…
        </label>
        <textarea
          id="query"
          className="tma-textarea"
          placeholder="Вставьте текст новости, цитату или ссылку на Telegram-пост…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          disabled={state === "loading"}
        />
        <p className="tma-hint">{text.trim().length} / 20 символов минимум</p>

        <button
          type="button"
          className="tma-button"
          onClick={search}
          disabled={state === "loading"}
        >
          {state === "loading" ? "Ищу источники…" : "Найти источник"}
        </button>
      </section>

      {state === "loading" && (
        <div className="tma-loading">
          <div className="tma-spinner" />
          <p>Поиск в интернете и анализ смысла…</p>
        </div>
      )}

      {state === "error" && error && (
        <section className="tma-card tma-card-error">
          <p>{error}</p>
        </section>
      )}

      {state === "success" && (
        <section className="tma-results">
          <h2 className="tma-results-title">Результаты</h2>
          {query && (
            <p className="tma-query-preview">
              {query.length > 160 ? `${query.slice(0, 160)}…` : query}
            </p>
          )}

          {sources.length === 0 ? (
            <div className="tma-card tma-card-empty">
              <p>Надёжный источник не найден. Попробуйте добавить больше контекста.</p>
            </div>
          ) : (
            <ul className="tma-source-list">
              {sources.map((source, index) => (
                <li key={source.url} className="tma-source-card">
                  <div className="tma-source-header">
                    <span className="tma-source-index">{index + 1}</span>
                    <span
                      className="tma-confidence"
                      style={{ color: confidenceColor(source.confidence) }}
                    >
                      {source.confidence}% · {confidenceLabel(source.confidence)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="tma-source-link"
                    onClick={() => {
                      if (window.Telegram?.WebApp) {
                        window.Telegram.WebApp.openLink(source.url);
                      } else {
                        window.open(source.url, "_blank");
                      }
                    }}
                  >
                    {source.title}
                  </button>
                  <p className="tma-source-reason">{source.reasoning}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
