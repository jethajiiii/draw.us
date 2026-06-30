"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { BACKEND_URL } from "../../config";

export default function CreateOrJoinPage() {
    const router = useRouter();
    const params = useParams();
    const mode = params?.mode as string;
    const isCallMode = mode === "draw-call";

    const [joinSlug, setJoinSlug] = useState("");
    const [roomName, setRoomName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const res = await fetch(`${BACKEND_URL}/room`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token || ""
                },
                body: JSON.stringify({ name: roomName || "Untitled Room" }) 
            });
            const data = await res.json();
            if (res.ok && data.room) {
                const modeParam = isCallMode ? "?mode=draw-call" : "";
                router.push(`/room/${data.room.slug}${modeParam}`);
            }
        } catch (e) {
            console.error("Failed to create room", e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinSlug.trim()) {
            router.push(`/room/${joinSlug.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-[#bef264] selection:text-black">
            
            {/* ═══ TOP NAV ═══ */}
            <nav className="border-b-[3px] border-black px-6 py-4 flex flex-wrap items-center justify-between bg-white z-50 sticky top-0 gap-4">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase relative">
                            DRAW.US
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#18181b]">
                        <button className="hover:text-zinc-500 transition-colors cursor-pointer">Rooms</button>
                        <button className="hover:text-zinc-500 transition-colors cursor-pointer">Gallery</button>
                        <button className="hover:text-zinc-500 transition-colors cursor-pointer">Community</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border-[2px] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white mr-4">
                        Mode: {isCallMode ? "Voice & Video" : "Draw Only"}
                    </span>
                    <button onClick={handleCreate} disabled={loading} className="bg-[#bef264] text-black px-6 py-2 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#a3e635] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-75">
                        New Canvas
                    </button>
                    <div className="w-8 h-8 rounded-full border-[2px] border-black bg-zinc-100 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>
            </nav>

            {/* ═══ SPLIT HERO ═══ */}
            <div className="flex flex-col md:flex-row border-b-[3px] border-black flex-1 w-full min-h-[500px]">
                
                {/* LEFT: START A CANVAS */}
                <div className="w-full md:w-1/2 bg-[#fce7f3] border-b-[3px] md:border-b-0 md:border-r-[3px] border-black p-10 md:p-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    {/* Background Star */}
                    <svg className="absolute w-[400px] h-[400px] text-pink-300 opacity-30 select-none z-0 rotate-12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>

                    <div className="absolute top-8 left-8">
                       <svg className="w-12 h-12 text-[#a855f7] -rotate-12 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                       </svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
                        <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 leading-[0.9] drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                            Start A<br/>Canvas
                        </h2>
                        <p className="text-[11px] font-bold text-black/70 max-w-[280px] leading-relaxed uppercase tracking-widest mb-10">
                            Don't think, just draw. Start a fresh whiteboard and invite your squad to make something beautiful... <br/>or terrible.
                        </p>
                        
                        <div className="w-full flex flex-col gap-4">
                            <input 
                                type="text"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="ENTER ROOM NAME" 
                                className="w-full border-[3px] border-black bg-white px-6 py-4 font-black text-xs uppercase tracking-widest placeholder:text-zinc-400 shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-y-[2px] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all text-center"
                            />
                            <button 
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full bg-[#bef264] text-black px-12 py-4 border-[3px] border-black font-black uppercase text-sm tracking-widest shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:bg-[#a3e635] hover:-translate-y-1 hover:shadow-[7px_7px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating..." : "Create Room"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ENTER THE VOID */}
                <div className="w-full md:w-1/2 bg-[#e9d5ff] p-10 md:p-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    {/* Background Star */}
                    <svg className="absolute w-[400px] h-[400px] text-purple-300 opacity-40 select-none z-0 -rotate-12 -bottom-20 -right-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>

                    <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[#18181b] drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]" style={{ WebkitTextStroke: "1.5px black", color: "#84828E" }}>
                            ENTER THE<br/>VOID
                        </h2>
                        <p className="text-[10px] font-bold text-black/70 max-w-[280px] leading-relaxed uppercase tracking-widest mb-10">
                            Got a secret code? Drop it below to warp directly into an active creative session.
                        </p>
                        
                        <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
                            <input 
                                type="text"
                                value={joinSlug}
                                onChange={(e) => setJoinSlug(e.target.value)}
                                placeholder="ENTER CODE HERE" 
                                className="w-full border-[3px] border-black bg-white px-6 py-4 font-black text-xs uppercase tracking-widest placeholder:text-zinc-300 shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-y-[2px] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all text-center"
                            />
                            <button 
                                type="submit"
                                className="w-full bg-white text-black px-12 py-4 border-[3px] border-black font-black uppercase text-sm tracking-widest shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 hover:-translate-y-1 hover:shadow-[7px_7px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                            >
                                Join Room
                            </button>
                        </form>
                    </div>
                </div>

            </div>

            {/* ═══ CURRENTLY MESSING AROUND ═══ */}
            <section className="bg-[#fafafa] py-16 px-6 relative border-b-[3px] border-black overflow-hidden flex flex-col items-center">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-center mb-16">
                    Currently Messing Around
                </h2>

                <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10 w-full max-w-6xl pb-8">
                    
                    {/* Polaroid 1 */}
                    <div className="bg-white p-4 pb-12 border-[3px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transform -rotate-3 hover:rotate-0 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-56 flex flex-col">
                        <div className="w-full aspect-square border-[2px] border-black mb-4 relative overflow-hidden bg-emerald-100 flex items-center justify-center">
                             {/* Abstract placeholder art */}
                             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,#a7f3d0_25%,#a7f3d0_50%,transparent_50%,transparent_75%,#a7f3d0_75%,#a7f3d0_100%)] bg-[length:10px_10px]" />
                             <svg className="w-full h-full text-pink-400 rotate-45 transform scale-150 absolute z-10 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="bg-[#e9d5ff] border-[1.5px] border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                #SKETCHY
                            </span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                12 Active
                            </span>
                        </div>
                    </div>

                    {/* Polaroid 2 */}
                    <div className="bg-white p-4 pb-12 border-[3px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transform rotate-2 hover:-rotate-1 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-56 flex flex-col -mt-4 lg:mt-0">
                        <div className="w-full aspect-square border-[2px] border-black mb-4 relative overflow-hidden bg-[#18181b] flex items-center justify-center">
                             <div className="w-20 h-10 border-[2px] border-white/50 rounded-lg transform -skew-x-12 absolute shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
                             <div className="w-6 h-6 rounded-full bg-cyan-400 opacity-80 absolute top-4 left-4 blur-md"></div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="bg-[#bef264] border-[1.5px] border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                #LOGODROP
                            </span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                5 Active
                            </span>
                        </div>
                    </div>

                    {/* Polaroid 3 */}
                    <div className="bg-white p-4 pb-12 border-[3px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transform -rotate-1 hover:rotate-1 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-56 flex flex-col mt-4 lg:mt-0">
                        <div className="w-full aspect-square border-[2px] border-black mb-4 relative overflow-hidden bg-[#bef264] flex items-center justify-center p-2">
                             <div className="w-16 h-16 rounded-full bg-pink-500 opacity-90 absolute left-2 top-2"></div>
                             <div className="w-24 h-12 bg-red-500 opacity-90 absolute bottom-4 right-0 rotate-12"></div>
                             <div className="w-10 h-10 border-[3px] border-yellow-400 absolute right-4 top-4 rotate-45"></div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="bg-[#fbcfe8] border-[1.5px] border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                #MESSY_VIBES
                            </span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                8 Active
                            </span>
                        </div>
                    </div>

                    {/* Polaroid 4 */}
                    <div className="bg-white p-4 pb-12 border-[3px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transform rotate-3 hover:rotate-0 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-56 flex flex-col">
                        <div className="w-full aspect-square border-[2px] border-black mb-4 relative overflow-hidden bg-[#09090b] flex items-center justify-center">
                             <div className="grid grid-cols-3 gap-2 p-4 w-full h-full rotate-45 transform scale-125">
                                 {[...Array(9)].map((_, i) => (
                                     <div key={i} className={`w-full h-full ${i % 2 === 0 ? 'bg-cyan-200' : 'bg-pink-200'} opacity-80 rounded-sm`}></div>
                                 ))}
                             </div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="bg-[#ccfbf1] border-[1.5px] border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                #INK_ONLY
                            </span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                24 Active
                            </span>
                        </div>
                    </div>

                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="bg-[#a855f7] px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t-[3px] border-black shadow-[inset_0_10px_20px_-10px_rgba(0,0,0,0.3)]">
                <div className="flex flex-col items-center md:items-start text-white">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-2">DRAW.US</h1>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80">
                        © 2026 draw.us. Keep it messy.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-white">
                    {["About", "Careers", "Privacy", "Terms", "Discord", "Instagram"].map(link => (
                        <span key={link} className="text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors cursor-pointer underline decoration-2 underline-offset-4">
                            {link}
                        </span>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.2 5l-2.4-2.4c-.4-.4-.9-.6-1.4-.6H6.6c-.5 0-1 .2-1.4.6L2.8 5c-.4.4-.6.9-.6 1.4v11c0 1.1.9 2 2 2h15.2c1.1 0 2-.9 2-2V6.4c0-.5-.2-1-.6-1.4zM12 16.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zM12 9c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5S13.4 9 12 9z"/></svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                        <span className="text-[14px] font-black leading-none">*</span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
