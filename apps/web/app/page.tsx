"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();


  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-lg font-bold">DrawBoard</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            // Clear cookie so middleware redirects on next request
            document.cookie = "token=; path=/; max-age=0";
            router.push("/login");
          }}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Choose your mode</h1>
            <p className="text-text-secondary">Pick how you want to collaborate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Draw Only Card */}
            <button
              onClick={() => router.push("/create/draw")}
              className="group bg-bg-card border border-border rounded-2xl p-8 text-left hover:border-accent/50 hover:bg-bg-card-hover transition-all cursor-pointer shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-accent/5"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Draw Only</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Collaborate on a shared canvas with real-time drawing and chat. Perfect for quick sketches and brainstorming.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm text-accent font-medium">
                <span>Get started</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Draw + Call Card */}
            <button
              onClick={() => router.push("/create/draw-call")}
              className="group bg-bg-card border border-border rounded-2xl p-8 text-left hover:border-accent/50 hover:bg-bg-card-hover transition-all cursor-pointer shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-accent/5"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Draw + Call</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Everything in Draw Only, plus voice and video calling. Ideal for design reviews and live collaboration.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm text-accent font-medium">
                <span>Get started</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
