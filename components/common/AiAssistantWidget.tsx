"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";

import { getToken } from "@/helpers/authApi";

interface AiMessage {
  role: "user" | "model";
  text: string;
}

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isLoading]);

  async function handleSend() {
    const trimmed = text.trim();
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
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-10),
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Something went wrong");

      setMessages([...nextMessages, { role: "model", text: body.data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get a response");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-5 z-50">
      {isOpen && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">NexMart Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close assistant">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-gray-400">
                Ask me about products, your orders, or anything else!
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
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
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-2 text-sm text-gray-400 shadow-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-gray-100 p-2.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something..."
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-blue-600 disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Toggle AI assistant"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl transition hover:scale-105"
      >
        <Sparkles size={22} />
      </button>
    </div>
  );
}