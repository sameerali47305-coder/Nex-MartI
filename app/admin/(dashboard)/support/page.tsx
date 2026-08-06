"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Send, Search, UserPlus, X, User, Check, CheckCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { fetchUsers, type AdminUser } from "@/helpers/adminApi";
import {
  ensureConversation,
  subscribeToConversations,
  subscribeToMessages,
  sendChatMessage,
  markConversationRead,
  type ConversationSummary,
  type ChatMessage,
} from "@/lib/chat";

function formatTime(date: Date | null) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AdminSupportPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToConversations(setConversations), []);

  useEffect(() => {
    if (!activeId) return;
    return subscribeToMessages(activeId, (msgs) => {
      setMessages(msgs);
      markConversationRead(activeId, "admin").catch(() => {});
    });
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

  function openPicker() {
    setIsPickerOpen(true);
    if (allUsers.length === 0) {
      fetchUsers().then((res) => res.data && setAllUsers(res.data.users));
    }
  }

  async function startChat(u: AdminUser) {
    await ensureConversation(u.id, u.name, u.email);
    setActiveId(u.id);
    setIsPickerOpen(false);
    setPickerSearch("");
  }

  const existingIds = useMemo(() => new Set(conversations.map((c) => c.id)), [conversations]);
  const pickerResults = allUsers.filter(
    (u) =>
      !existingIds.has(u.id) &&
      (u.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  const filteredConversations = conversations.filter(
    (c) =>
      !search ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={26} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Chat Support</h1>
            <p className="text-sm text-gray-500">
              {conversations.length} active chat{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={openPicker}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <UserPlus size={16} />
          New Chat
        </button>
      </div>

      <div className="flex h-[36rem] overflow-hidden rounded-2xl border-2 border-blue-100 bg-white shadow-sm">
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r-2 border-blue-100 bg-blue-50/30">
          <div className="relative border-b border-blue-100 bg-white p-3">
            <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-blue-200 py-2 pl-8 pr-2 text-sm outline-none focus:border-blue-600"
            />
          </div>

          {filteredConversations.length === 0 && (
            <p className="p-4 text-sm text-gray-400">No conversations found.</p>
          )}
          {filteredConversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`flex w-full items-center gap-3 border-b border-blue-100 p-3 text-left transition hover:bg-white ${
                activeId === c.id ? "bg-white ring-2 ring-inset ring-blue-400" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-50 text-blue-500">
                <User size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">{c.customerName}</p>
                  <span className="shrink-0 text-[10px] text-gray-400">{formatTime(c.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-gray-500">{c.lastMessage || "Say hello 👋"}</p>
                  {c.unreadByAdmin && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col bg-white">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
              <MessageSquare size={32} />
              <p className="text-sm">Select a conversation, or start a new one.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b-2 border-blue-100 px-5 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-50 text-blue-500">
                  <User size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{active.customerName}</p>
                  <p className="text-xs text-gray-500">{active.customerEmail}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-blue-50/30 p-5">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400">No messages yet — say hello!</p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        m.senderRole === "admin"
                          ? "rounded-br-sm bg-blue-600 text-white"
                          : "rounded-bl-sm border border-blue-100 bg-white text-gray-800"
                      }`}
                    >
                      <p>{m.text}</p>
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                          m.senderRole === "admin" ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {formatTime(m.createdAt)}
                        {m.senderRole === "admin" &&
                          (active.unreadByCustomer ? (
                            <Check size={13} />
                          ) : (
                            <CheckCheck size={13} className="text-white" />
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-2 border-t-2 border-blue-100 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your reply to the user..."
                  className="flex-1 rounded-full border-2 border-blue-200 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleSend}
                  className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Reply
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border-2 border-blue-100 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Start a New Chat</h2>
              <button onClick={() => setIsPickerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search users..."
              autoFocus
              className="mb-3 w-full rounded-lg border-2 border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {pickerResults.length === 0 && (
                <p className="p-3 text-center text-sm text-gray-400">No users found.</p>
              )}
              {pickerResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startChat(u)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-blue-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-50 text-blue-500">
                    <User size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}