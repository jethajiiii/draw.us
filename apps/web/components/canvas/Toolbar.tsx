"use client";

import { Tool } from "./types";

interface ToolbarProps {
  tool: Tool;
  setTool: (t: Tool) => void;
  strokeColor: string;
  setStrokeColor: (c: string) => void;
  onClear: () => void;
}

export function Toolbar({ tool, setTool, strokeColor, setStrokeColor, onClear }: ToolbarProps) {
  return (
    <div className="absolute left-6 top-24 flex flex-col items-center gap-3 bg-pinkish border-[3px] border-black px-2.5 py-4 rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] z-10 w-16">
      
      {/* Top tools block */}
      <div className="flex flex-col items-center gap-2 w-full">
        <ToolButton active={tool === "selection"} onClick={() => setTool("selection")} label="Select" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        } />
        
        <ToolButton active={tool === "pencil"} onClick={() => setTool("pencil")} label="Pencil" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        } />

        <ToolButton active={tool === "rect"} onClick={() => setTool("rect")} label="Shapes" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6m0 0l-3-3m3 3l3-3" />
          </svg>
        } />
        
        <ToolButton active={tool === "circle"} onClick={() => setTool("circle")} label="Circle" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <circle cx="12" cy="12" r="8" />
          </svg>
        } />
        
        <ToolButton active={tool === "line"} onClick={() => setTool("line")} label="Line" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20L20 4" />
          </svg>
        } />
        
        <ToolButton active={tool === "arrow"} onClick={() => setTool("arrow")} label="Arrow" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        } />
        
        <ToolButton active={tool === "triangle"} onClick={() => setTool("triangle")} label="Triangle" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
          </svg>
        } />

        <ToolButton active={tool === "roundrect"} onClick={() => setTool("roundrect")} label="Rounded" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="4" y="4" width="16" height="16" rx="6" />
          </svg>
        } />

        <ToolButton active={tool === "text"} onClick={() => setTool("text")} label="Text" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 6v2m16-2v2M9 6v12m0 0H7m2 0h2" />
          </svg>
        } />
        
        <button onClick={onClear} title="Eraser / Clear All" className="flex flex-col items-center justify-center p-1.5 w-full hover:-translate-y-0.5 active:translate-y-0 transition-transform bg-transparent text-black">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-[9px] font-bold mt-1 tracking-tighter">Eraser</span>
        </button>
      </div>




    </div>
  );
}

function ToolButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-[2px] border-transparent transition-all cursor-pointer w-full ${
        active 
          ? "bg-[#658e37] text-white border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] -translate-y-0.5" 
          : "bg-transparent text-black hover:-translate-y-0.5"
      }`}
    >
      {icon}
      <span className="text-[9px] font-bold mt-1 tracking-tighter leading-tight">{label}</span>
    </button>
  );
}
