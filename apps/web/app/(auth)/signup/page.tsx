"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "../../config";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Signup failed"); return; }
      router.push("/login");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    border: "2px solid #000",
    padding: "13px 16px",
    fontSize: "15px",
    fontFamily: "monospace",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "box-shadow 0.15s",
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden" }}>

      {/* TOP NAV */}
      <nav style={{ background: "#e8e8e8", borderBottom: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 900, fontSize: "17px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }} onClick={() => router.push("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          DRAW.US
        </div>
        <button style={{ fontWeight: 800, fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", border: "2px solid #000", padding: "6px 18px", background: "#fff", cursor: "pointer", boxShadow: "2px 2px 0 #000" }}>
          HELP
        </button>
      </nav>

      {/* MAIN SPLIT */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT PANEL — Electric Indigo */}
        <div style={{
          width: "52%",
          flexShrink: 0,
          background: "#5b5bd6",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "52px",
        }}>
          {/* Yellow square */}
          <div style={{ position: "absolute", top: "44px", left: "52px", width: "60px", height: "60px", background: "#d4ff4f", border: "2.5px solid #000", boxShadow: "4px 4px 0 #000", transform: "rotate(8deg)" }} />

          {/* Access badge */}
          <div style={{ position: "absolute", top: "36px", right: "56px", fontSize: "11px", fontWeight: 900, background: "#ff3b8f", border: "2px solid #000", color: "#fff", padding: "5px 12px", boxShadow: "3px 3px 0 #000", letterSpacing: "1px", transform: "rotate(3deg)", textTransform: "uppercase" }}>
            NEW USER
          </div>

          {/* Hatch shape top-center */}
          <div style={{ position: "absolute", top: "105px", left: "38%", transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 4px", background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 8px, transparent 8px, transparent 16px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%" }} />
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>Novus<br />Canvas</div>
          </div>

          {/* Bottom-right decoration */}
          <div style={{ position: "absolute", bottom: "100px", right: "44px", width: "80px", height: "80px", background: "repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 10px, transparent 10px, transparent 20px)", border: "2px solid rgba(255,255,255,0.2)", transform: "rotate(-12deg)" }} />

          {/* Small orange accent dot */}
          <div style={{ position: "absolute", bottom: "200px", left: "80px", width: "20px", height: "20px", background: "#ff6b35", border: "2px solid #000", borderRadius: "50%" }} />

          {/* Hero text */}
          <h1 style={{ fontWeight: 900, fontSize: "clamp(44px, 5.5vw, 68px)", lineHeight: 1, color: "#fff", textTransform: "uppercase", fontStyle: "italic", marginBottom: "22px", textShadow: "3px 3px 0 rgba(0,0,0,0.5)", letterSpacing: "-1px", position: "relative", zIndex: 2 }}>
            CREATE &<br />CONQUER
          </h1>
          <div style={{ background: "#d4ff4f", color: "#000", display: "inline-block", padding: "14px 18px", fontWeight: 800, fontSize: "14px", lineHeight: 1.5, maxWidth: "290px", position: "relative", zIndex: 2, border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
            Your canvas.<br />Your rules. No limits.
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, background: "#f0f0eb", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 40px" }}>
          <div style={{ width: "100%", maxWidth: "500px" }}>

            {/* Card */}
            <div style={{ background: "#fff", border: "2.5px solid #000", boxShadow: "8px 8px 0 #000", padding: "40px 40px 32px" }}>

              <h2 style={{ fontWeight: 900, fontSize: "40px", textTransform: "uppercase", letterSpacing: "-1.5px", lineHeight: 1, marginBottom: "6px" }}>
                FORGE YOUR<br />IDENTITY
              </h2>
              <div style={{ width: "44px", height: "3px", background: "#5b5bd6", marginBottom: "24px" }} />

              {error && (
                <div style={{ background: "#ffe4e4", border: "2px solid #f43f5e", padding: "10px 14px", marginBottom: "16px", fontWeight: 700, fontSize: "13px", color: "#f43f5e" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Handle / Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "7px", color: "#666" }}>HANDLE</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="your_alias"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.boxShadow = "3px 3px 0 #5b5bd6")}
                    onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                  />
                </div>

                {/* Identity / Email */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "7px", color: "#666" }}>IDENTITY</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="architect@chaos.io"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.boxShadow = "3px 3px 0 #5b5bd6")}
                    onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                  />
                </div>

                {/* Secret Key / Password */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "7px", color: "#666" }}>SECRET KEY</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••"
                      style={{ ...inputStyle, padding: "13px 44px 13px 16px" }}
                      onFocus={e => (e.currentTarget.style.boxShadow = "3px 3px 0 #5b5bd6")}
                      onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}>
                      {showPassword
                        ? <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <button type="submit" disabled={loading}
                  style={{ width: "100%", background: "#5b5bd6", color: "#fff", border: "2.5px solid #000", padding: "16px", fontWeight: 900, fontSize: "16px", letterSpacing: "2.5px", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", boxShadow: "4px 4px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "'Space Grotesk', sans-serif", opacity: loading ? 0.7 : 1, transition: "transform 0.1s, box-shadow 0.1s" }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
                  onMouseDown={e => { if (!loading) { e.currentTarget.style.transform = "translate(4px,4px)"; e.currentTarget.style.boxShadow = "1px 1px 0 #000"; } }}
                  onMouseUp={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}>
                  {loading ? "CREATING..." : "INITIATE CANVAS"}
                  {!loading && (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0 16px", color: "#aaa", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" }}>
                <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
                OR JOIN VIA
                <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
              </div>

              {/* OAuth Buttons */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "GOOGLE", icon: <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                  { label: "GITHUB", icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> },
                ].map(({ label, icon }) => (
                  <button key={label}
                    style={{ flex: 1, border: "2px solid #000", background: "#fff", padding: "12px", fontWeight: 800, fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", boxShadow: "3px 3px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontFamily: "'Space Grotesk', sans-serif", transition: "transform 0.1s, box-shadow 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #000"; }}
                    onMouseDown={e => { e.currentTarget.style.transform = "translate(3px,3px)"; e.currentTarget.style.boxShadow = "0px 0px 0 #000"; }}
                    onMouseUp={e => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}>
                    {icon}{label}
                  </button>
                ))}
              </div>

              {/* Login link */}
              <div style={{ textAlign: "center", fontSize: "13px" }}>
                <span style={{ color: "#777" }}>Already in the chaos? </span>
                <Link href="/login" style={{ color: "#5b5bd6", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                  Resume session.
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#111", color: "#fff", borderTop: "2px solid #000", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "7px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            DRAW.US
          </div>
          <div style={{ fontSize: "10px", color: "#888", marginTop: "2px", letterSpacing: "1px" }}>© 2024 DRAW.US — NO RESTRAINT</div>
        </div>
        <div style={{ display: "flex", gap: "24px", fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>
          {["TERMS", "PRIVACY"].map(l => (
            <a key={l} href="#" style={{ color: "#aaa", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "#aaa")}>{l}</a>
          ))}
          <a href="#" style={{ color: "#ff3b8f", textDecoration: "none", fontWeight: 900 }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "#ff3b8f")}>CHAOS MANIFESTO</a>
        </div>
      </footer>
    </div>
  );
}
