"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2, Trash2 } from "lucide-react";

import { getToken } from "@/helpers/authApi";

interface AiMessage {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "Show me some headphones",
  "What's on sale right now?",
  "Help me find a gift under $50",
];

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isLoading]);

  async function sendText(value: string) {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;

    setError("");
    const nextMessages: AiMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setText("");
    setIsLoading(true);

    try {
      const token = getToken();
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: trimmed, history: messages.slice(-10) }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Something went wrong");

      setMessages([...nextMessages, { role: "model", text: body.data.reply }]);
      if (!isOpen) setHasNew(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get a response");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleOpen() {
    setIsOpen((o) => !o);
    setHasNew(false);
  }

  return (
    <div className="fixed bottom-24 right-5 z-50">
      {isOpen && (
        <div className="mb-3 flex h-[30rem] w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Sparkles size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">NexMart Assistant</p>
                <p className="text-[10px] text-blue-100">Online • Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} aria-label="Clear chat" className="text-blue-100 hover:text-white">
                  <Trash2 size={15} />
                </button>
              )}
              <button onClick={toggleOpen} aria-label="Close assistant" className="text-blue-100 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-400">
                  Ask me about products, your orders, or anything else!
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendText(s)}
                      className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-left text-xs text-blue-700 transition hover:bg-blue-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-1.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "model" && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Sparkles size={12} />
                  </span>
                )}
                <div
                  className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-blue-600 text-white"
                      : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Sparkles size={12} />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-2 text-sm text-gray-400 shadow-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-end gap-2 border-t border-gray-100 p-2.5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText(text);
                }
              }}
              placeholder="Ask something..."
              disabled={isLoading}
              rows={1}
              className="max-h-24 flex-1 resize-none rounded-2xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-blue-600 disabled:opacity-60"
            />
            <button
              onClick={() => sendText(text)}
              disabled={isLoading || !text.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleOpen}
        aria-label="Toggle AI assistant"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl transition hover:scale-105"
      >
        <Sparkles size={22} />
        {hasNew && <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />}
      </button>
    </div>
  );
}
