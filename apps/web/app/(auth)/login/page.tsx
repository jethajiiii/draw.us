"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "../../config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      // Also set cookie so middleware can protect routes server-side
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      router.push("/");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg-secondary bg-dots format-neubrutalism font-sans text-black relative">
      {/* Top Left Logo Nav */}
      <nav className="absolute top-6 left-6 right-6 flex items-center shrink-0 z-20">
        <div className="flex items-center gap-6 p-2 rounded-xl">
          <div className="font-bold text-xl tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-4 h-4 bg-accent rounded-sm border border-black shadow-[2px_2px_0px_#000]" />
            draw.us
          </div>
        </div>
      </nav>

      <div className="w-full max-w-md z-10 relative mt-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight bg-white inline-block border-[3px] border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-2">
            Welcome back
          </h1>
          <p className="text-lg font-medium mt-6">Sign in to your drawing board</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-[3px] border-black rounded-2xl p-8 space-y-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col relative"
        >
          {error && (
            <div className="bg-danger/20 border-2 border-danger rounded-xl px-4 py-3 text-sm font-bold text-danger pb-[13px] shadow-[2px_2px_0px_#f43f5e]">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-bold uppercase tracking-widest text-text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full font-medium bg-white border-2 border-black rounded-xl px-4 py-3.5 placeholder:text-text-muted/60 focus:outline-none focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-bold uppercase tracking-widest text-text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full font-medium bg-white border-2 border-black rounded-xl px-4 py-3.5 placeholder:text-text-muted/60 focus:outline-none focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-accent text-white font-bold tracking-wide rounded-xl px-4 py-4 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] text-base uppercase"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center font-semibold text-lg mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:text-black transition-colors underline underline-offset-4 decoration-2">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
