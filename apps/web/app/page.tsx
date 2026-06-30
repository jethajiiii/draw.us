"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "./config";

interface Room {
    id: number;
    slug: string;
    createdAt: string;
    adminId: string;
}

export default function HomePage() {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
    
    useEffect(() => {
        const token = localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (token) {
            fetch(`${BACKEND_URL}/rooms`, {
                headers: {
                    Authorization: token
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.rooms) {
                    setRooms(data.rooms);
                }
            })
            .catch(console.error);
        }
    }, []);

    const scrollToCommunity = () => {
        const el = document.getElementById("community-section");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
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
                        <button 
                            onClick={scrollToCommunity}
                            className="hover:text-zinc-500 transition-colors cursor-pointer text-black underline decoration-[3px] decoration-[#bef264] underline-offset-8"
                        >
                            Community
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search" 
                            className="pl-9 pr-4 py-1.5 text-xs font-bold uppercase border-[2px] border-black bg-white w-48 shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0"
                        />
                    </div>
                    <button className="bg-[#bef264] text-black px-6 py-2 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#a3e635] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b-[3px] border-black">
                {/* Left Hero - Pink */}
                <div className="bg-[#fbcfe8] md:border-r-[3px] md:border-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[450px]">
                    <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
                        <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <span className="bg-[#bef264] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-[2px] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            Season: Year Zero
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase mt-8 tracking-tighter leading-none max-w-sm">
                            The Infinite Canvas Protocol
                        </h2>
                    </div>
                    
                    {/* Inner Widget */}
                    <div className="mt-12 bg-white border-[3px] border-black p-4 w-full max-w-md shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-all flex flex-col relative z-10 group cursor-default">
                        <div className="absolute top-3 left-4 flex gap-1 items-center">
                            <div className="w-5 h-5 rounded-full bg-[#bef264] border-[1.5px] border-black" />
                            <div className="w-5 h-5 rounded-full bg-pink-300 border-[1.5px] border-black -ml-2" />
                            <div className="w-5 h-5 rounded-full bg-purple-300 border-[1.5px] border-black -ml-2" />
                        </div>
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 font-black text-[10px]">
                            <svg className="w-3.5 h-3.5 fill-current text-black" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/></svg>
                            7.4K
                        </div>
                        <div className="h-32 mt-6 flex items-center justify-center bg-[#f4f4f5] border-[2px] border-black border-dashed relative">
                            <div className="w-24 h-24 rounded-full bg-[#bef264] border-[3px] border-black flex items-center justify-center relative shadow-[3px_3px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform duration-500">
                                <div className="w-12 h-3 bg-white border-[2px] border-black rotate-45 absolute" />
                                <div className="w-12 h-3 bg-[#a855f7] border-[2px] border-black -rotate-45 absolute" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 font-black text-[9px] tracking-widest uppercase border-[1.5px] border-black shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                                Live Now
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Hero - Purple */}
                <div className="bg-[#e9d5ff] p-8 md:p-12 flex flex-col justify-center items-center text-center">
                    <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 tracking-tighter leading-tight max-w-sm">
                        Ready to Collaborate?
                    </h2>
                    <p className="text-xs font-bold max-w-[280px] mb-10 text-black/80 leading-relaxed uppercase tracking-wider">
                        Jump into a global workspace where ideas collide in real-time. No sign-up required for instant sketching.
                    </p>
                    <div className="w-full max-w-sm flex flex-col gap-4">
                        <button 
                            onClick={() => router.push("/create")}
                            className="bg-[#bef264] text-black w-full py-4 border-[3px] border-black font-black uppercase text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#a3e635] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex justify-center items-center gap-2"
                        >
                            Start A Session &rarr;
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-white text-black py-3 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex justify-center items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Join Room
                            </button>
                            <button className="bg-white text-black py-3 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex justify-center items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Import
                            </button>
                        </div>
                    </div>
                    <p className="mt-8 text-[9px] font-black text-black/60 tracking-widest flex items-center gap-2 uppercase">
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Trusted by 50K+ designers weekly
                    </p>
                </div>
            </div>

            {/* ═══ INFO PANELS ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-zinc-50 border-b-[3px] border-black shadow-[inset_0_-20px_20px_-20px_rgba(0,0,0,0.1)]">
                {/* Card 1 */}
                <div className="bg-[#fbcfe8] border-[3px] border-black p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden h-40 flex flex-col justify-between cursor-default">
                    <h3 className="font-black text-base uppercase tracking-tighter w-min leading-none">Vector Precision</h3>
                    <p className="text-[9px] font-bold text-black/70 max-w-[12rem] uppercase tracking-wider">Scale your canvases to infinity without losing a single pixel of character.</p>
                    <svg className="absolute bottom-2 right-2 w-16 h-16 text-black opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                {/* Card 2 */}
                <div className="bg-[#bef264] border-[3px] border-black p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all relative flex flex-col items-center justify-center h-40 cursor-default">
                     <h2 className="text-7xl font-black italic tracking-tighter uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">24/7</h2>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Uptime</span>
                </div>
                {/* Card 3 */}
                <div className="bg-[#e9d5ff] border-[3px] border-black p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden h-40 flex flex-col justify-between cursor-default">
                     <h3 className="font-black text-base uppercase tracking-tighter leading-none w-min">Live Feed</h3>
                     <p className="text-[9px] font-bold text-black/70 max-w-[12rem] uppercase tracking-wider">Watch the mania unfold.</p>
                     <svg className="absolute bottom-4 right-4 w-12 h-12 text-black opacity-15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>

            {/* ═══ COMMUNITY DISCOVERY ═══ */}
            <section id="community-section" className="bg-white py-16 px-8 border-b-[3px] border-black relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b-[2px] border-dashed border-zinc-200 pb-6">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Community Discovery</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">The most influential canvases of the hour.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <button className="bg-white border-[2px] border-black w-10 h-10 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7.5 10v6l-3-3v-3L3 4z" /></svg>
                            </button>
                            <button className="bg-black text-white px-8 py-3 border-[2px] border-black font-black uppercase text-[10px] tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,0.2)] transition-all cursor-pointer">
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {/* Dummy 1 */}
                        <RoomCard 
                            title="Liquid Geometry" 
                            author="@prismatic_savant" 
                            badge="Staff Pick" 
                            views="18.2K" 
                            likes="4.9K" 
                            accentColor="bg-[#f0fdf4]"
                            avatarColor="bg-green-500"
                            paintingUrl="/artwork/community1.png"
                        />
                        {/* Dummy 2 */}
                        <RoomCard 
                            title="Street Art Sandbox" 
                            author="@graffiti_lane" 
                            badge="" 
                            views="12.5K" 
                            likes="3.1K" 
                            accentColor="bg-white"
                            avatarColor="bg-purple-500"
                            paintingUrl="/artwork/community2.png"
                        />
                        {/* Dummy 3 — inline SVG mind-map */}
                        <RoomCard 
                            title="Mind Map" 
                            author="@synapse_link" 
                            badge="" 
                            views="9.8K" 
                            likes="2.2K" 
                            accentColor="bg-[#fef3c7]"
                            avatarColor="bg-red-500"
                            customThumbnail={
                                <svg width="100%" height="100%" viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="280" height="210" fill="#fef3c7"/>
                                    {/* grid dots */}
                                    {[0,1,2,3,4,5,6].map(x => [0,1,2,3,4,5].map(y => (
                                        <circle key={`${x}-${y}`} cx={20 + x*40} cy={20 + y*35} r="1.5" fill="#d97706" opacity="0.2"/>
                                    )))}
                                    {/* center node */}
                                    <rect x="105" y="82" width="70" height="46" rx="6" fill="#a855f7" stroke="#000" strokeWidth="2.5"/>
                                    <text x="140" y="109" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif">CORE IDEA</text>
                                    {/* branch lines */}
                                    <line x1="105" y1="105" x2="50" y2="65" stroke="#000" strokeWidth="2" strokeDasharray="4 3"/>
                                    <line x1="105" y1="105" x2="48" y2="145" stroke="#000" strokeWidth="2" strokeDasharray="4 3"/>
                                    <line x1="175" y1="105" x2="230" y2="65" stroke="#000" strokeWidth="2" strokeDasharray="4 3"/>
                                    <line x1="175" y1="105" x2="232" y2="145" stroke="#000" strokeWidth="2" strokeDasharray="4 3"/>
                                    <line x1="140" y1="82" x2="140" y2="35" stroke="#000" strokeWidth="2" strokeDasharray="4 3"/>
                                    <line x1="140" y1="128" x2="140" y2="175" stroke="#000" strokeWidth="2" strokeDasharray="4 3"/>
                                    {/* satellite nodes */}
                                    <rect x="15" y="45" width="52" height="34" rx="5" fill="#bef264" stroke="#000" strokeWidth="2"/>
                                    <text x="41" y="66" textAnchor="middle" fill="#000" fontSize="9" fontWeight="800" fontFamily="sans-serif">DESIGN</text>
                                    <rect x="13" y="125" width="52" height="34" rx="5" fill="#fbcfe8" stroke="#000" strokeWidth="2"/>
                                    <text x="39" y="146" textAnchor="middle" fill="#000" fontSize="9" fontWeight="800" fontFamily="sans-serif">EXPLORE</text>
                                    <rect x="213" y="45" width="52" height="34" rx="5" fill="#a5f3fc" stroke="#000" strokeWidth="2"/>
                                    <text x="239" y="66" textAnchor="middle" fill="#000" fontSize="9" fontWeight="800" fontFamily="sans-serif">BUILD</text>
                                    <rect x="215" y="125" width="52" height="34" rx="5" fill="#fca5a5" stroke="#000" strokeWidth="2"/>
                                    <text x="241" y="146" textAnchor="middle" fill="#000" fontSize="9" fontWeight="800" fontFamily="sans-serif">SHIP</text>
                                    <rect x="110" y="8" width="60" height="30" rx="5" fill="#e9d5ff" stroke="#000" strokeWidth="2"/>
                                    <text x="140" y="27" textAnchor="middle" fill="#000" fontSize="9" fontWeight="800" fontFamily="sans-serif">RESEARCH</text>
                                    <rect x="110" y="172" width="60" height="30" rx="5" fill="#fdba74" stroke="#000" strokeWidth="2"/>
                                    <text x="140" y="191" textAnchor="middle" fill="#000" fontSize="9" fontWeight="800" fontFamily="sans-serif">ITERATE</text>
                                </svg>
                            }
                        />

                        {/* Mapped Dynamic Rooms */}
                        {rooms.map(room => (
                            <RoomCard 
                                key={room.id}
                                title={room.slug.split('-').slice(0, -1).join(' ')} 
                                author="You" 
                                badge="Your Room" 
                                views="New" 
                                likes="-" 
                                accentColor="bg-pink-100"
                                avatarColor="bg-black"
                                onClick={() => router.push(`/room/${room.slug}`)}
                                onDelete={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    setRoomToDelete(room.id);
                                }}
                                paintingUrl={`/artwork/${(room.id % 7) + 1}.png`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ BOTTOM CTA ═══ */}
            <section className="bg-[#18181b] py-24 px-8 relative overflow-hidden flex flex-col items-center border-b-[3px] border-black text-center shadow-[inset_0_20px_20px_-20px_rgba(0,0,0,1)]">
                <svg className="absolute -right-20 -top-10 w-96 h-96 text-zinc-800 opacity-30 rotate-12 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-10 max-w-2xl relative z-10 leading-tight">
                    Your first stroke is the hardest. <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-white">Let's make it easy.</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    <button 
                        onClick={() => router.push("/create")}
                        className="bg-[#bef264] text-black px-10 py-4 border-[3px] border-black shadow-[4px_4px_0px_rgba(255,255,255,0.7)] font-black text-xs uppercase tracking-widest hover:-translate-y-1 hover:bg-[#a3e635] hover:shadow-[7px_7px_0px_rgba(255,255,255,0.7)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(255,255,255,0.5)] transition-all cursor-pointer"
                    >
                        Create Workspace
                    </button>
                    <button 
                        onClick={scrollToCommunity}
                        className="bg-white text-black px-10 py-4 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] font-black text-xs uppercase tracking-widest hover:-translate-y-1 hover:bg-zinc-100 hover:shadow-[7px_7px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                    >
                        Browse Gallery
                    </button>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="bg-[#e4e4e7] px-10 py-16 flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="max-w-xs">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2 text-black">DRAW.US</h1>
                    <p className="text-[9px] font-bold text-zinc-500 leading-relaxed max-w-[200px] uppercase tracking-wider mb-8">
                        © 2026 DRAW.US. Keep sketching. A place for creative minds to mesh and mashup in thread.
                    </p>
                    <div className="flex gap-4">
                        <button className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:text-white active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]"><span className="text-[12px] font-black leading-none">*</span></button>
                        <button className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:text-white active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]"><span className="text-[12px] font-black leading-none">&lt;</span></button>
                        <button className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:text-white active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]"><span className="text-[12px] font-black leading-none">&gt;</span></button>
                    </div>
                </div>

                <div className="flex gap-20">
                    <div>
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#84cc16] mb-5">Platform</h4>
                        <ul className="space-y-4 text-[9px] font-bold text-black uppercase tracking-widest">
                            <li className="hover:text-black/60 cursor-pointer transition-colors">Terms</li>
                            <li className="hover:text-black/60 cursor-pointer transition-colors">Privacy</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#84cc16] mb-5">Explore</h4>
                        <ul className="space-y-4 text-[9px] font-bold text-black uppercase tracking-widest">
                            <li className="hover:text-black/60 cursor-pointer transition-colors">Cookbook</li>
                            <li className="hover:text-black/60 cursor-pointer transition-colors">Careers</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#84cc16] mb-5">Social</h4>
                        <ul className="space-y-4 text-[9px] font-bold text-black uppercase tracking-widest">
                            <li className="hover:text-black/60 cursor-pointer transition-colors">Twitter</li>
                            <li className="hover:text-black/60 cursor-pointer transition-colors">Instagram</li>
                        </ul>
                    </div>
                </div>

                <div className="w-64 h-28 bg-white border-[3px] border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[7px_7px_0px_rgba(0,0,0,1)] overflow-hidden p-3 relative hidden lg:block transition-all cursor-default">
                    <div className="w-full h-full border-[1.5px] border-dashed border-zinc-300 relative flex items-center justify-center">
                        <div className="absolute top-1 left-1 w-2 h-2 bg-black opacity-20" />
                        <div className="absolute top-1 right-1 w-2 h-2 bg-black opacity-20" />
                        <div className="absolute bottom-1 left-1 w-2 h-2 bg-black opacity-20" />
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-black opacity-20" />
                        <div className="w-16 h-4 bg-[#bef264] border-[1.5px] border-black absolute left-6 top-8 shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                        <div className="w-20 h-4 bg-[#e9d5ff] border-[1.5px] border-black absolute right-4 bottom-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                        <div className="w-12 h-4 bg-[#fbcfe8] border-[1.5px] border-black absolute right-12 top-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                    </div>
                </div>
            </footer>

            {/* CUSTOM DELETE MODAL OVERLAY */}
            {roomToDelete !== null && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#f4f4f5] border-[3px] border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col relative">
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#bef264] border-[2px] border-black rounded-full" />
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#fbcfe8] border-[2px] border-black" />
                        
                        <h3 className="font-black text-2xl uppercase tracking-tighter mb-2 text-black leading-none mt-1">Delete Canvas?</h3>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-8 leading-relaxed">
                            This action cannot be undone. All strokes and shapes will be lost in the void permanently.
                        </p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setRoomToDelete(null)}
                                className="flex-1 bg-white border-[2px] border-black py-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                            >
                                Keep It
                            </button>
                            <button 
                                onClick={async () => {
                                    const id = roomToDelete;
                                    setRoomToDelete(null);
                                    
                                    const token = localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                                    try {
                                        const res = await fetch(`${BACKEND_URL}/room/${id}`, {
                                            method: "DELETE",
                                            headers: { Authorization: token || "" }
                                        });
                                        if (res.ok) {
                                            setRooms(rooms => rooms.filter(r => r.id !== id));
                                        }
                                    } catch (err) {
                                        console.error("Failed to delete room:", err);
                                    }
                                }}
                                className="flex-1 bg-[#ef4444] text-white border-[2px] border-black py-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#dc2626] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
                            >
                                Destroy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Reusable card component
function RoomCard({ title, author, badge, views, likes, accentColor, avatarColor, isImage, hasGrid, onClick, paintingUrl, onDelete, customThumbnail }: any) {
    return (
        <div onClick={onClick} className="bg-white border-[3px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col group min-h-[300px] relative">
            
            {/* DELETE BUTTON */}
            {onDelete && (
                <button 
                    onClick={onDelete}
                    className="absolute top-3 right-3 z-30 w-7 h-7 bg-[#ef4444] text-white border-[2px] border-black flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#dc2626] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_rgba(0,0,0,0.5)] transition-all"
                    title="Delete Room"
                >
                    <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            <div className={`w-full h-56 border-b-[3px] border-black ${accentColor} relative overflow-hidden flex items-center justify-center p-6 bg-[length:20px_20px] ${hasGrid ? 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]' : ''}`}>
                {badge && (
                    <div className="absolute top-3 left-3 bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] z-20">
                        {badge}
                    </div>
                )}
                {customThumbnail ? (
                    <div className="w-full h-full absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                        {customThumbnail}
                    </div>
                ) : paintingUrl ? (
                    <div className="w-full h-full absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${paintingUrl})` }} />
                ) : isImage ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 group-hover:scale-105 transition-transform duration-500 absolute inset-0" />
                ) : (
                    <div className="w-28 h-28 bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] transform group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300 relative z-10 flex items-center justify-center">
                        <div className="w-12 h-12 bg-purple-300 rounded-full blur-xl absolute" />
                        <div className="w-16 h-8 bg-black rounded-full absolute -right-4 -bottom-2 z-10 opacity-20" />
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-1 bg-white">
                <h3 className="font-black text-sm uppercase tracking-tighter mb-3 leading-none truncate">{title}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-4 h-4 rounded-full border-[1.5px] border-black ${avatarColor}`} />
                    <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase truncate">by {author}</span>
                </div>
                <div className="flex-1" />
                <div className="flex items-center justify-between text-zinc-400 font-bold text-[9px] uppercase tracking-widest mt-2 pt-4 border-t-[2px] border-dashed border-zinc-200">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {views}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            {likes}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
