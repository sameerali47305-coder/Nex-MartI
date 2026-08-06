"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Search } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendChatMessage,
  markConversationRead,
  type ConversationSummary,
  type ChatMessage,
} from "@/lib/chat";

export default function AdminSupportPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToConversations(setConversations), []);

  useEffect(() => {
    if (!activeId) return;
    markConversationRead(activeId, "admin").catch(() => {});
    return subscribeToMessages(activeId, setMessages);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !activeId || !user) return;
    setText("");
    await sendChatMessage(activeId, user.id, "admin", trimmed);
  }

  const filteredConversations = conversations.filter(
    (c) =>
      !search ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <MessageSquare size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-sm text-gray-500">Respond to customer messages in real time</p>
        </div>
      </div>

      <div className="flex h-[32rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-gray-100">
          <div className="relative border-b border-gray-100 p-2">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-blue-600"
            />
          </div>

          {filteredConversations.length === 0 && (
            <p className="p-4 text-sm text-gray-400">No conversations found.</p>
          )}
          {filteredConversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`block w-full border-b border-gray-50 p-3 text-left transition hover:bg-gray-50 ${
                activeId === c.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{c.customerName}</p>
                {c.unreadByAdmin && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />}
              </div>
              <p className="truncate text-xs text-gray-500">{c.lastMessage || "No messages yet"}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col">
          {!active ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Select a conversation to start replying.
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{active.customerName}</p>
                <p className="text-xs text-gray-500">{active.customerEmail}</p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                        m.senderRole === "admin" ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleSend}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}