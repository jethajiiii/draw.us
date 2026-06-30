"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";

export default function ChooseModePage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<"solo" | "collab" | null>(null);

  // ── Mouse-tracking parallax ──
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // max ±12 degrees
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -10;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 10;
    setTilt({ x: rx, y: ry });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col overflow-hidden">

      {/* ─── NAV ─── */}
      <nav className="border-b-[3px] border-black px-8 py-3 flex items-center justify-between bg-white z-50 shrink-0">
        <div className="flex items-center gap-10">
          <div className="text-2xl font-black italic tracking-tighter uppercase cursor-pointer select-none" onClick={() => router.push("/")}>
            draw.us
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="text-black border-b-[2px] border-black pb-0.5 cursor-pointer">Explore</span>
            <span className="hover:text-black transition-colors cursor-pointer">Community</span>
            <span className="hover:text-black transition-colors cursor-pointer">Templates</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/create/draw")}
          className="bg-[#bef264] text-black px-6 py-2 border-[2px] border-black font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
        >
          New Canvas
        </button>
      </nav>

      {/* ─── MAIN ─── */}
      <main className="flex flex-col md:flex-row" style={{ minHeight: "calc(100vh - 112px)" }}>

        {/* LEFT */}
        <div className="flex flex-col justify-center px-12 md:px-16 lg:px-24 py-12 md:py-0 relative overflow-hidden bg-white w-full md:w-[42%] shrink-0">
          <div className="absolute top-10 right-8 select-none pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#bef264"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
          </div>
          <div className="absolute top-24 right-5 select-none pointer-events-none opacity-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#bef264"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
          </div>
          <div className="absolute bottom-16 left-5 select-none pointer-events-none opacity-15">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#a855f7"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="inline-block border-[2px] border-[#a855f7] px-3 py-1 mb-8">
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#a855f7]">Choose Your Pain</span>
            </div>
            <h1 className="text-6xl md:text-7xl xl:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] mb-8">
              The Void<br />Is <span className="text-[#a855f7]" style={{ fontStyle: "italic" }}>Calling</span>
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-[280px]">
              Don't overthink it. Grab your stylus, choose a mode, and let the pixels flow. Chaos is better when it's intentional.
            </p>
          </div>
        </div>

        {/* RIGHT: parallax zone */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center relative bg-white overflow-visible py-12 md:py-0"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: "1200px" }}
        >
          {/* Card stack — tilts with mouse */}
          <div
            style={{
              width: "min(580px, 90vw)",
              height: "min(580px, 82vh)",
              position: "relative",
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 0.12s ease-out",
              transformStyle: "preserve-3d",
            }}
          >

            {/* ═══ SOLO CARD ═══ */}
            <div
              className="absolute cursor-pointer"
              style={{
                width: "72%",
                top: "0%",
                left: "-2%",
                zIndex: hovered === "solo" ? 20 : 5,
                transform: hovered === "solo"
                  ? "rotate(-11deg) translateY(-5%) translateZ(40px)"
                  : "rotate(-8deg) translateZ(0px)",
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
                filter: hovered === "collab" ? "brightness(0.75)" : "brightness(1)",
              }}
              onMouseEnter={() => setHovered("solo")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push("/create/draw")}
            >
              <div
                className="bg-white border-[3px] border-black p-3 flex flex-col gap-3"
                style={{
                  boxShadow: hovered === "solo" ? "10px 10px 0px rgba(0,0,0,1)" : "6px 6px 0px rgba(0,0,0,1)",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                {/* Photo: same hands-reaching image as COLLAB card */}
                <div className="w-full relative overflow-hidden bg-zinc-900" style={{ aspectRatio: "4/3" }}>
                  <svg width="100%" height="100%" viewBox="0 0 340 255" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <rect width="340" height="255" fill="#0d0d0d"/>
                    <radialGradient id="sg2" cx="50%" cy="55%" r="38%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#000" stopOpacity="0"/>
                    </radialGradient>
                    <rect width="340" height="255" fill="url(#sg2)"/>
                    {/* Left hand */}
                    <path d="M0 255 Q50 180 90 130 Q105 112 118 120 Q108 136 95 152 Q78 172 65 205 Q38 240 0 255Z" fill="#222"/>
                    <path d="M90 130 L76 85 L91 78 L103 118" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M98 122 L87 74 L102 68 L110 108" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M106 118 L100 72 L115 67 L118 105" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M114 118 L112 76 L127 75 L126 110" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    {/* Right hand */}
                    <path d="M340 255 Q290 180 250 130 Q235 112 222 120 Q232 136 245 152 Q262 172 275 205 Q302 240 340 255Z" fill="#222"/>
                    <path d="M250 130 L264 85 L249 78 L237 118" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M242 122 L253 74 L238 68 L230 108" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M234 118 L240 72 L225 67 L222 105" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M226 118 L228 76 L213 75 L214 110" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    {/* Top hands */}
                    <path d="M120 0 Q130 40 138 80 Q140 95 132 100 Q122 92 118 76 Q112 54 108 28 Q110 10 120 0Z" fill="#222"/>
                    <path d="M148 0 Q152 42 154 82 Q155 97 148 100 Q140 94 140 78 Q138 55 138 28 Q140 10 148 0Z" fill="#222"/>
                    <path d="M165 0 Q166 42 165 82 Q165 97 158 98 Q152 90 153 74 Q154 50 155 24 Q158 8 165 0Z" fill="#222"/>
                    <path d="M182 0 Q180 42 176 80 Q174 95 168 96 Q162 88 165 72 Q168 48 172 22 Q176 6 182 0Z" fill="#222"/>
                    <path d="M200 0 Q196 40 190 76 Q187 91 182 92 Q176 84 180 68 Q185 44 190 18 Q195 4 200 0Z" fill="#1e1e1e"/>
                    {/* Center burst */}
                    <circle cx="170" cy="108" r="30" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.22"/>
                    <circle cx="170" cy="108" r="14" fill="#ffffff" opacity="0.1"/>
                    <circle cx="170" cy="108" r="6" fill="#ffffff" opacity="0.28"/>
                    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
                      const rad = a * Math.PI / 180;
                      return (
                        <line key={i}
                          x1={(170 + 18 * Math.cos(rad)).toFixed(2)} y1={(108 + 18 * Math.sin(rad)).toFixed(2)}
                          x2={(170 + 42 * Math.cos(rad)).toFixed(2)} y2={(108 + 42 * Math.sin(rad)).toFixed(2)}
                          stroke="white" strokeWidth="0.9" opacity="0.18"
                        />
                      );
                    })}
                  </svg>
                  {/* Lime/green tint overlay on hover */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(135deg, rgba(190,242,100,0.45) 0%, rgba(163,230,53,0.3) 100%)",
                    opacity: hovered === "solo" ? 1 : 0,
                    transition: "opacity 0.35s ease",
                    mixBlendMode: "screen",
                  }}/>
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse at 50% 43%, rgba(200,255,100,0.6) 0%, transparent 60%)",
                    opacity: hovered === "solo" ? 1 : 0,
                    transition: "opacity 0.35s ease",
                  }}/>

                  <div className="absolute top-2 left-2 bg-[#bef264] border-[2px] border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
                    SOLO
                  </div>
                </div>
                <div className="px-1 pb-1 flex flex-col gap-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-black leading-none">INK ALONE</h3>
                  <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Pure focus, zero noise. Just you and the canvas.</p>
                  <button
                    className="w-full mt-1 bg-[#bef264] text-black py-3 border-[3px] border-black font-black uppercase text-sm tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#a3e635] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); router.push("/create/draw"); }}
                  >FLY SOLO</button>
                </div>
              </div>
            </div>

            {/* ═══ COLLAB CHAOS CARD ═══ */}
            <div
              className="absolute cursor-pointer"
              style={{
                width: "76%",
                bottom: "0%",
                right: "-2%",
                zIndex: hovered === "collab" ? 20 : 10,
                transform: hovered === "collab"
                  ? "rotate(5deg) translateY(-5%) translateZ(40px)"
                  : "rotate(3deg) translateZ(0px)",
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
                filter: hovered === "solo" ? "brightness(0.75)" : "brightness(1)",
              }}
              onMouseEnter={() => setHovered("collab")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push("/create/draw-call")}
            >
              <div
                className="bg-white border-[3px] border-black p-3 flex flex-col gap-3"
                style={{
                  boxShadow: hovered === "collab" ? "12px 12px 0px rgba(0,0,0,1)" : "8px 8px 0px rgba(0,0,0,1)",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                {/* Hands-reaching image */}
                <div className="w-full relative overflow-hidden bg-zinc-900" style={{ aspectRatio: "4/3" }}>
                  <svg width="100%" height="100%" viewBox="0 0 340 255" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <rect width="340" height="255" fill="#0d0d0d"/>
                    <radialGradient id="cg2" cx="50%" cy="55%" r="38%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#000" stopOpacity="0"/>
                    </radialGradient>
                    <rect width="340" height="255" fill="url(#cg2)"/>
                    {/* Left hand */}
                    <path d="M0 255 Q50 180 90 130 Q105 112 118 120 Q108 136 95 152 Q78 172 65 205 Q38 240 0 255Z" fill="#222"/>
                    <path d="M90 130 L76 85 L91 78 L103 118" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M98 122 L87 74 L102 68 L110 108" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M106 118 L100 72 L115 67 L118 105" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M114 118 L112 76 L127 75 L126 110" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    {/* Right hand */}
                    <path d="M340 255 Q290 180 250 130 Q235 112 222 120 Q232 136 245 152 Q262 172 275 205 Q302 240 340 255Z" fill="#222"/>
                    <path d="M250 130 L264 85 L249 78 L237 118" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M242 122 L253 74 L238 68 L230 108" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M234 118 L240 72 L225 67 L222 105" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    <path d="M226 118 L228 76 L213 75 L214 110" fill="#2e2e2e" stroke="#444" strokeWidth="0.8"/>
                    {/* Top hands */}
                    <path d="M120 0 Q130 40 138 80 Q140 95 132 100 Q122 92 118 76 Q112 54 108 28 Q110 10 120 0Z" fill="#222"/>
                    <path d="M148 0 Q152 42 154 82 Q155 97 148 100 Q140 94 140 78 Q138 55 138 28 Q140 10 148 0Z" fill="#222"/>
                    <path d="M165 0 Q166 42 165 82 Q165 97 158 98 Q152 90 153 74 Q154 50 155 24 Q158 8 165 0Z" fill="#222"/>
                    <path d="M182 0 Q180 42 176 80 Q174 95 168 96 Q162 88 165 72 Q168 48 172 22 Q176 6 182 0Z" fill="#222"/>
                    <path d="M200 0 Q196 40 190 76 Q187 91 182 92 Q176 84 180 68 Q185 44 190 18 Q195 4 200 0Z" fill="#1e1e1e"/>
                    {/* Center burst */}
                    <circle cx="170" cy="108" r="30" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.22"/>
                    <circle cx="170" cy="108" r="14" fill="#ffffff" opacity="0.1"/>
                    <circle cx="170" cy="108" r="6" fill="#ffffff" opacity="0.28"/>
                    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
                      const rad = a * Math.PI / 180;
                      return (
                        <line key={i}
                          x1={(170 + 18 * Math.cos(rad)).toFixed(2)} y1={(108 + 18 * Math.sin(rad)).toFixed(2)}
                          x2={(170 + 42 * Math.cos(rad)).toFixed(2)} y2={(108 + 42 * Math.sin(rad)).toFixed(2)}
                          stroke="white" strokeWidth="0.9" opacity="0.18"
                        />
                      );
                    })}
                  </svg>

                  {/* Purple/magenta tint — appears on hover, matching the reference screenshot */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(168,85,247,0.45) 0%, rgba(236,72,153,0.3) 100%)",
                      opacity: hovered === "collab" ? 1 : 0,
                      transition: "opacity 0.35s ease",
                      mixBlendMode: "screen",
                    }}
                  />
                  {/* Radial glow burst on hover */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse at 50% 43%, rgba(255,180,255,0.6) 0%, transparent 60%)",
                      opacity: hovered === "collab" ? 1 : 0,
                      transition: "opacity 0.35s ease",
                    }}
                  />

                  <div className="absolute top-2 right-2 bg-[#e9d5ff] border-[2px] border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
                    CO-OP
                  </div>
                </div>

                <div className="px-1 pb-1 flex flex-col gap-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-black leading-none">COLLAB CHAOS</h3>
                  <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                    Draw + Call. Real-time collaboration with voice and video sync. Chaos is better with friends.
                  </p>
                  <button
                    className="w-full mt-1 bg-[#a855f7] text-white py-4 border-[3px] border-black font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#9333ea] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); router.push("/create/draw-call"); }}
                  >JOIN THE FRAY</button>
                </div>
              </div>
            </div>

          </div>

          {/* Deco */}
          <div className="absolute bottom-6 right-8 select-none pointer-events-none opacity-20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#a855f7"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
          </div>
          <div className="absolute bottom-8 right-24 w-7 h-7 rounded-full border-[2.5px] border-[#a855f7] opacity-20 select-none pointer-events-none"/>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#a855f7] border-t-[3px] border-black px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-white font-black italic text-2xl tracking-tighter uppercase select-none">draw.us</span>
          <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">© 2024 draw.us – Unleash the Chaos</span>
        </div>
        <div className="flex items-center gap-6">
          {["Terms", "Privacy", "Twitter", "Discord"].map(l => (
            <span key={l} className="text-white text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors cursor-pointer underline decoration-2 underline-offset-4">{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
