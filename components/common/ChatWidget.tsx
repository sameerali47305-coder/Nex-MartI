"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ensureConversation, sendChatMessage, subscribeToMessages, type ChatMessage } from "@/lib/chat";

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    ensureConversation(user.id, user.name, user.email);
    const unsubscribe = subscribeToMessages(user.id, setMessages);
    return unsubscribe;
  }, [isOpen, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated || !user) return null;

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !user) return;
    setText("");
    await sendChatMessage(user.id, user.id, "customer", trimmed);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">NexMart Support</p>
              <p className="text-xs text-blue-100">We typically reply in minutes</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/10">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3">
            {messages.length === 0 && (
              <p className="mt-6 text-center text-xs text-gray-400">Send us a message and we&apos;ll get back to you.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderRole === "customer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    m.senderRole === "customer" ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-gray-100 p-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <button
              onClick={handleSend}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}