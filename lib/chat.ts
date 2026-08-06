"use client";

import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firestore-client";  

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: "customer" | "admin";
  text: string;
  createdAt: Date | null;
}

export interface ConversationSummary {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadByAdmin: boolean;
}

export async function ensureConversation(userId: string, name: string, email: string) {
  await setDoc(
    doc(db, "conversations", userId),
    { customerId: userId, customerName: name, customerEmail: email },
    { merge: true }
  );
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderRole: "customer" | "admin",
  text: string
) {
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    senderRole,
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    ...(senderRole === "customer" ? { unreadByAdmin: true } : { unreadByCustomer: true }),
  });
}

export function subscribeToMessages(conversationId: string, cb: (msgs: ChatMessage[]) => void) {
  const q = query(collection(db, "conversations", conversationId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId,
          senderRole: data.senderRole,
          text: data.text,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        };
      })
    );
  });
}

export function subscribeToConversations(cb: (convos: ConversationSummary[]) => void) {
  const q = query(collection(db, "conversations"), orderBy("lastMessageAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          customerName: data.customerName ?? "Customer",
          customerEmail: data.customerEmail ?? "",
          lastMessage: data.lastMessage ?? "",
          lastMessageAt: data.lastMessageAt instanceof Timestamp ? data.lastMessageAt.toDate() : null,
          unreadByAdmin: Boolean(data.unreadByAdmin),
        };
      })
    );
  });
}

export async function markConversationRead(conversationId: string, role: "customer" | "admin") {
  await updateDoc(
    doc(db, "conversations", conversationId),
    role === "admin" ? { unreadByAdmin: false } : { unreadByCustomer: false }
  );
}