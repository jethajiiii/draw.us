"use client";

import { useState, useEffect, useRef } from "react";
import { BACKEND_URL } from "../app/config";

interface Message {
  id?: number;
  message: string;
  roomId?: number;
}

interface ChatRoomProps {
  socket: WebSocket | null;
  roomId: string;
}

export default function ChatRoom({ socket, roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${BACKEND_URL}/chats/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages?.reverse() || []);
        }
      } catch {
        // Backend might not be running
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [roomId]);

  // Listen for incoming WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          setMessages((prev) => [...prev, { message: data.message, roomId: data.roomId }]);
        }
      } catch {
        // Ignore non-JSON messages (e.g. initial "something")
      }
    };

    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId,
        message: input.trim(),
      })
    );

    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">Chat</h2>
        <p className="text-xs text-text-muted">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-text-muted animate-pulse">
              Loading messages…
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xs text-text-muted">No messages yet</p>
              <p className="text-xs text-text-muted mt-0.5">
                Say something to get started!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className="bg-bg-input rounded-xl px-3 py-2 text-sm text-text-primary break-words"
            >
              {msg.message}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-3 py-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={socket ? "Type a message…" : "Connecting…"}
            disabled={!socket}
            className="flex-1 bg-bg-input border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-glow transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!socket || !input.trim()}
            className="bg-accent hover:bg-accent-hover text-white rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
