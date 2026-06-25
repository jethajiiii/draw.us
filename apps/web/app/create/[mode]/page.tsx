"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BACKEND_URL } from "../../config";

export default function CreateRoomPage() {
  const router = useRouter();
  const params = useParams();
  const mode = params.mode as string;
  const isCallMode = mode === "draw-call";

  const [tab, setTab] = useState<"create" | "join">("create");
  const [roomName, setRoomName] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: roomName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create room");
        return;
      }

      router.push(`/room/${data.room.slug}`);
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinSlug.trim()) {
      setError("Please enter a room slug");
      return;
    }
    router.push(`/room/${joinSlug.trim()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-bold">
          {isCallMode ? "Draw + Call" : "Draw Only"}
        </span>
        {isCallMode && (
          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
            Video enabled
          </span>
        )}
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1">
              {tab === "create" ? "Create a room" : "Join a room"}
            </h1>
            <p className="text-text-secondary text-sm">
              {tab === "create"
                ? "Give your room a unique name to get started"
                : "Enter the room slug to join an existing session"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-bg-card border border-border rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setTab("create");
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                tab === "create"
                  ? "bg-accent text-white shadow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => {
                setTab("join");
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                tab === "join"
                  ? "bg-accent text-white shadow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Join Room
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={tab === "create" ? handleCreate : handleJoin}
            className="bg-bg-card border border-border rounded-2xl p-6 space-y-5 shadow-lg shadow-black/20"
          >
            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {tab === "create" ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="room-name"
                  className="block text-sm font-medium text-text-secondary"
                >
                  Room name
                </label>
                <input
                  id="room-name"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  placeholder="my-awesome-room"
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-glow transition-all"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor="join-slug"
                  className="block text-sm font-medium text-text-secondary"
                >
                  Room slug
                </label>
                <input
                  id="join-slug"
                  type="text"
                  value={joinSlug}
                  onChange={(e) => setJoinSlug(e.target.value)}
                  required
                  placeholder="existing-room-name"
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-glow transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30"
            >
              {loading
                ? "Creating…"
                : tab === "create"
                  ? "Create & Enter Room"
                  : "Join Room"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
