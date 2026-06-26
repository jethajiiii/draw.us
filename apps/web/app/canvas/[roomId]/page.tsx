"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Toolbar } from "../../../components/canvas/Toolbar";
import { DrawElement, Tool } from "@repo/ui/components/canvas/types";
import { getBoundingBox, isHit, drawArrowInfo, drawTriangle } from "../../../components/canvas/utils";
import { WS_URL } from "../../config";

type Action = "none" | "drawing" | "moving" | "resizing";
const HANDLE_SIZE = 8;

export default function CanvasPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [elements, setElements] = useState<DrawElement[]>([]);
  const [tool, setTool] = useState<Tool>("selection");
  const [action, setAction] = useState<Action>("none");
  const [strokeColor, setStrokeColor] = useState("#e8e8f0");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentElementRef = useRef<DrawElement | null>(null);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const snapshotRef = useRef<DrawElement | null>(null);
  const resizeHandleRef = useRef<number | null>(null);

  // Camera state uses ref to avoid unneeded React renders on scroll/pan
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  // Resolved integer room ID (WS backend uses int IDs, URL param is a slug)
  const numericRoomIdRef = useRef<string | null>(null);

  // ── WebSocket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !roomId) return;

    let ws: WebSocket;

    // First: resolve slug → integer room ID
    fetch(`http://localhost:3001/room/${roomId}`, {
      headers: {
        Authorization: token || ""
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.room) return;
        const intRoomId = data.room.id.toString();
        numericRoomIdRef.current = intRoomId;

        ws = new WebSocket(`${WS_URL}?token=${token}`);
        socketRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "join_room", roomId: intRoomId }));
        };

        ws.onmessage = (event) => {
          if (event.data === "something") return;
          let msg: { type: string; element?: DrawElement; elementId?: string };
          try {
            msg = JSON.parse(event.data);
          } catch {
            return;
          }

          if (msg.type === "draw" && msg.element) {
            setElements(prev => {
              if (prev.some(e => e.id === msg.element!.id)) return prev;
              return [...prev, msg.element!];
            });
          }

          if (msg.type === "update_element" && msg.element) {
            setElements(prev =>
              prev.map(e => e.id === msg.element!.id ? msg.element! : e)
            );
          }

          if (msg.type === "delete_element" && msg.elementId) {
            setElements(prev => prev.filter(e => e.id !== msg.elementId));
          }
        };
      })
      .catch(err => console.error("Failed to resolve room:", err));

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave_room", roomId: numericRoomIdRef.current ?? roomId }));
        ws.close();
      }
    };
  }, [roomId]);

  // ── Helper to send WS message (always uses the integer room ID) ────────────
  const wsSend = useCallback((msg: object) => {
    const ws = socketRef.current;
    const rid = numericRoomIdRef.current ?? roomId;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ ...msg, roomId: rid }));
    }
  }, [roomId]);

  // ── Keyboard: delete selected element ─────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setElements(prev => prev.filter(el => el.id !== selectedId));
        wsSend({ type: "delete_element", elementId: selectedId });
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, wsSend]);

  // ── Canvas draw ────────────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const cam = cameraRef.current;
    ctx.translate(cam.x, cam.y);
    ctx.scale(cam.zoom, cam.zoom);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;

    const allElements = [...elements];
    if (currentElementRef.current && action === "drawing") {
      allElements.push(currentElementRef.current);
    }
    const renderElements = action === "moving" || action === "resizing"
      ? allElements.map(el => el.id === currentElementRef.current?.id ? currentElementRef.current : el)
      : allElements;

    renderElements.forEach((el) => {
      if (!el) return;
      ctx.strokeStyle = el.strokeColor;
      ctx.beginPath();

      if (el.type === "rect") {
        ctx.strokeRect(el.x!, el.y!, el.width!, el.height!);
      } else if (el.type === "roundrect") {
        ctx.roundRect(el.x!, el.y!, el.width!, el.height!, [15]);
        ctx.stroke();
      } else if (el.type === "circle") {
        ctx.arc(el.x!, el.y!, el.radius!, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === "line") {
        ctx.moveTo(el.x!, el.y!);
        ctx.lineTo(el.endX!, el.endY!);
        ctx.stroke();
      } else if (el.type === "arrow") {
        drawArrowInfo(ctx, el.x!, el.y!, el.endX!, el.endY!);
        ctx.stroke();
      } else if (el.type === "triangle") {
        drawTriangle(ctx, el.x!, el.y!, el.endX!, el.endY!);
        ctx.stroke();
      } else if (el.type === "pencil" && el.points && el.points.length > 0) {
        ctx.moveTo(el.points[0]!.x, el.points[0]!.y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i]!.x, el.points[i]!.y);
        }
        ctx.stroke();
      }

      if (el.id === selectedId) {
        const _lw = ctx.lineWidth;
        const _ss = ctx.strokeStyle;
        ctx.strokeStyle = "#a8a5ff";
        ctx.lineWidth = 1 / cam.zoom;
        const box = getBoundingBox(el);
        const pad = 6;
        ctx.strokeRect(box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2);
        ctx.lineWidth = _lw;
        ctx.strokeStyle = _ss;
      }
    });

    ctx.restore();
  }, [elements, action, selectedId]);

  // ── Wheel (zoom/pan) ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
        const nextZoom = Math.min(Math.max(cam.zoom * zoomFactor, 0.1), 5);
        const nextX = e.clientX - ((e.clientX - cam.x) / cam.zoom) * nextZoom;
        const nextY = e.clientY - ((e.clientY - cam.y) / cam.zoom) * nextZoom;
        cameraRef.current = { x: nextX, y: nextY, zoom: nextZoom };
      } else {
        cameraRef.current = { x: cam.x - e.deltaX, y: cam.y - e.deltaY, zoom: cam.zoom };
      }

      drawCanvas();
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [drawCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        drawCanvas();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawCanvas]);

  useEffect(() => { drawCanvas(); }, [elements, drawCanvas, selectedId]);

  // ── Pointer helpers ────────────────────────────────────────────────────────
  const getScenePointer = (clientX: number, clientY: number) => {
    const cam = cameraRef.current;
    return {
      x: (clientX - cam.x) / cam.zoom,
      y: (clientY - cam.y) / cam.zoom
    };
  };

  const getHandleHit = (x: number, y: number, el: DrawElement) => {
    const box = getBoundingBox(el);
    const pad = 5;
    const hs = HANDLE_SIZE / cameraRef.current.zoom;
    const handles = [
      { id: 0, x: box.x - pad, y: box.y - pad },
      { id: 1, x: box.x + box.w + pad, y: box.y - pad },
      { id: 2, x: box.x + box.w + pad, y: box.y + box.h + pad },
      { id: 3, x: box.x - pad, y: box.y + box.h + pad }
    ];
    for (const h of handles) {
      if (x >= h.x - hs && x <= h.x + hs && y >= h.y - hs && y <= h.y + hs) return h.id;
    }
    return null;
  };

  // ── Mouse events ───────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const sp = getScenePointer(e.clientX, e.clientY);

    if (tool === "selection") {
      if (selectedId) {
        const selEl = elements.find(el => el.id === selectedId);
        if (selEl) {
          const handle = getHandleHit(sp.x, sp.y, selEl);
          if (handle !== null) {
            setAction("resizing");
            resizeHandleRef.current = handle;
            currentElementRef.current = JSON.parse(JSON.stringify(selEl));
            snapshotRef.current = JSON.parse(JSON.stringify(selEl));
            dragStartRef.current = { x: sp.x, y: sp.y };
            return;
          }
        }
      }

      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (!el) continue;
        if (isHit(sp.x, sp.y, el)) {
          setSelectedId(el.id);
          setAction("moving");
          currentElementRef.current = JSON.parse(JSON.stringify(el));
          snapshotRef.current = JSON.parse(JSON.stringify(el));
          dragStartRef.current = { x: sp.x, y: sp.y };
          return;
        }
      }
      setSelectedId(null);
      return;
    }

    setSelectedId(null);
    setAction("drawing");
    currentElementRef.current = {
      id: Date.now().toString(),
      type: tool,
      x: sp.x, y: sp.y,
      width: 0, height: 0, radius: 0,
      endX: sp.x, endY: sp.y,
      points: [{ x: sp.x, y: sp.y }],
      strokeColor,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const sp = getScenePointer(e.clientX, e.clientY);

    if (tool === "selection" && action === "none") return;

    if (action === "drawing" && currentElementRef.current) {
      const el = currentElementRef.current;
      if (tool === "rect" || tool === "roundrect") {
        el.width = sp.x - el.x!;
        el.height = sp.y - el.y!;
      } else if (tool === "circle") {
        el.radius = Math.sqrt(Math.pow(sp.x - el.x!, 2) + Math.pow(sp.y - el.y!, 2));
      } else if (tool === "line" || tool === "arrow" || tool === "triangle") {
        el.endX = sp.x;
        el.endY = sp.y;
      } else if (tool === "pencil") {
        el.points!.push({ x: sp.x, y: sp.y });
      }
      drawCanvas();
    } else if (action === "moving" && currentElementRef.current && dragStartRef.current && snapshotRef.current) {
      const dx = sp.x - dragStartRef.current.x;
      const dy = sp.y - dragStartRef.current.y;
      const el = currentElementRef.current;
      const snap = snapshotRef.current;

      if (el.x !== undefined) el.x = snap.x! + dx;
      if (el.y !== undefined) el.y = snap.y! + dy;
      if (el.endX !== undefined) el.endX = snap.endX! + dx;
      if (el.endY !== undefined) el.endY = snap.endY! + dy;
      if (el.points && snap.points) {
        el.points = snap.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      drawCanvas();
    } else if (action === "resizing" && currentElementRef.current && dragStartRef.current && snapshotRef.current) {
      const dx = sp.x - dragStartRef.current.x;
      const dy = sp.y - dragStartRef.current.y;
      const el = currentElementRef.current;
      const snap = snapshotRef.current;

      if (el.type === "rect" || el.type === "roundrect") {
        el.width = snap.width! + dx;
        el.height = snap.height! + dy;
      } else if (el.type === "circle") {
        el.radius = snap.radius! + Math.max(dx, dy) / 2;
        if (el.radius < 5) el.radius = 5;
      } else if (el.type === "line" || el.type === "arrow" || el.type === "triangle") {
        el.endX = snap.endX! + dx;
        el.endY = snap.endY! + dy;
      } else if (el.type === "pencil" && el.points && snap.points) {
        const originX = snap.points[0]!.x;
        const originY = snap.points[0]!.y;
        const scaleX = 1 + (dx / 100);
        const scaleY = 1 + (dy / 100);
        el.points = snap.points.map(p => ({
          x: originX + (p.x - originX) * Math.max(scaleX, 0.1),
          y: originY + (p.y - originY) * Math.max(scaleY, 0.1)
        }));
      }
      drawCanvas();
    }
  };

  const handleMouseUp = () => {
    if (action === "drawing" && currentElementRef.current) {
      const el = currentElementRef.current;
      setElements(prev => [...prev, el]);
      setSelectedId(el.id);
      setTool("selection");
      // Broadcast the new shape to other users
      wsSend({ type: "draw", element: el });
    } else if ((action === "moving" || action === "resizing") && currentElementRef.current) {
      const updated = currentElementRef.current;
      setElements(prev => prev.map(el => el.id === updated.id ? updated : el));
      // Broadcast the updated shape to other users
      wsSend({ type: "update_element", element: updated });
    }

    setAction("none");
    currentElementRef.current = null;
    dragStartRef.current = null;
    snapshotRef.current = null;
    resizeHandleRef.current = null;
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-bg-secondary relative select-none">
      <Toolbar
        tool={tool}
        setTool={(t) => {
          setTool(t);
          if (t !== "selection") setSelectedId(null);
        }}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        onClear={() => {
          // Broadcast delete for each element
          elements.forEach(el => wsSend({ type: "delete_element", elementId: el.id }));
          setElements([]);
          setSelectedId(null);
        }}
      />
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`block touch-none ${tool === "selection" ? "cursor-default" : "cursor-crosshair"}`}
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 bg-bg-card border border-border px-3 py-1.5 rounded-lg shadow-lg text-xs font-mono text-text-secondary z-10 pointer-events-none">
        Zoom / Pan enabled
      </div>
    </div>
  );
}
