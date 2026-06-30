"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRoom } from "./layout";
import { Toolbar } from "../../../components/canvas/Toolbar";
import { DrawElement, Tool } from "@repo/ui/components/canvas/types";
import { getBoundingBox, isHit, drawArrowInfo, drawTriangle, getResizeHandle } from "../../../components/canvas/utils";
import { BACKEND_URL } from "../../config";

type Action = "none" | "drawing" | "moving" | "resizing";
const HANDLE_SIZE = 8;

export default function RoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCallMode = searchParams.get("mode") === "draw-call";
  const { socket, loading, roomId, roomName } = useRoom();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [tool, setTool] = useState<Tool>("selection");
  const [action, setAction] = useState<Action>("none");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomUI, setZoomUI] = useState(1);
  const [redoStack, setRedoStack] = useState<DrawElement[]>([]);
  const [editingText, setEditingText] = useState<{ id: string, x: number; y: number; screenX: number; screenY: number; text: string; scale?: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentElementRef = useRef<DrawElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<DrawElement | null>(null);
  const resizeHandleRef = useRef<string | null>(null);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceCandidatesQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [hasMedia, setHasMedia] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  // ─── Load history from DB ────────────────────────────────────────────────
  useEffect(() => {
    // Wait until roomId is fully resolved to a number (not a slug) before fetching
    if (!roomId || isNaN(Number(roomId)) || loading) return;

    const token = localStorage.getItem("token") || "";
    fetch(`${BACKEND_URL}/chats/${roomId}`, {
      headers: {
        Authorization: token
      }
    })
      .then((r) => r.json())
      .then((data) => {
        const messages: { message: string }[] = data.messages || [];
        const parsed: DrawElement[] = messages
          .map((m) => {
            try {
              return JSON.parse(m.message) as DrawElement;
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .reverse() as DrawElement[]; // DB returns desc order
        setElements(parsed);
      })
      .catch(console.error);
  }, [roomId, loading]);

  // ─── Receive drawings from WS ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (ev: MessageEvent) => {
      // ignore the initial "something" string the server sends
      if (ev.data === "something") return;
      let data: { type: string; element?: DrawElement; elementId?: string; message?: string; socketId?: string; fromSocketId?: string; toSocketId?: string; payload?: any };
      try {
        data = JSON.parse(ev.data);
      } catch {
        return;
      }

      if (data.type === "draw" && data.element) {
        setElements(prev => {
          if (prev.some(e => e.id === data.element!.id)) return prev;
          return [...prev, data.element!];
        });
      }

      if (data.type === "update_element" && data.element) {
        setElements(prev =>
          prev.map(e => e.id === data.element!.id ? data.element! : e)
        );
      }

      if (data.type === "delete_element" && data.elementId) {
        setElements(prev => prev.filter(e => e.id !== data.elementId));
      }

      // Legacy chat messages (e.g. from initial db load or old clients)
      if (data.type === "chat" && data.message) {
        try {
          const el = JSON.parse(data.message) as DrawElement;
          setElements((prev) => {
            const idx = prev.findIndex((e) => e.id === el.id);
            if (idx !== -1) {
              const next = [...prev];
              next[idx] = el;
              return next;
            }
            return [...prev, el];
          });
        } catch {
          // ignore invalid
        }
      }

      // ─── WebRTC Handlers ─────────────────────────────────────────────────────
      if (data.type === "user_joined" && data.socketId) {
        createPeerConnection(data.socketId, true);
      }

      if (data.type === "user_left" && data.socketId) {
        const peer = peersRef.current.get(data.socketId);
        if (peer) {
          peer.close();
          peersRef.current.delete(data.socketId);
          setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[data.socketId!];
            return next;
          });
        }
      }

      const getPeer = (socketId: string) => {
        let peer = peersRef.current.get(socketId);
        if (!peer) peer = createPeerConnection(socketId, false);
        return peer;
      };

      if (data.type === "webrtc_offer" && data.payload && data.fromSocketId) {
        const peer = getPeer(data.fromSocketId);

        // Prevent glare / collision. If we are already negotiating, we might ignore this or just blindly overwrite.
        // Actually, setRemoteDescription handles Offers even in stable state (re-negotiation).
        peer.setRemoteDescription(new RTCSessionDescription(data.payload)).then(() => {
          return peer.createAnswer();
        }).then(answer => {
          return peer.setLocalDescription(answer);
        }).then(() => {
          socket.send(JSON.stringify({
            type: "webrtc_answer",
            roomId,
            toSocketId: data.fromSocketId,
            payload: peer.localDescription
          }));
          // Process any queued ICE candidates for this peer
          const queue = iceCandidatesQueueRef.current.get(data.fromSocketId!);
          if (queue) {
            queue.forEach(c => peer.addIceCandidate(new RTCIceCandidate(c)).catch(() => { }));
            iceCandidatesQueueRef.current.delete(data.fromSocketId!);
          }
        }).catch(err => console.error("Error handling offer", err));
      }

      if (data.type === "webrtc_answer" && data.payload && data.fromSocketId) {
        const peer = peersRef.current.get(data.fromSocketId);
        if (peer && peer.signalingState === "have-local-offer") {
          peer.setRemoteDescription(new RTCSessionDescription(data.payload)).then(() => {
            // Process any queued ICE candidates
            const queue = iceCandidatesQueueRef.current.get(data.fromSocketId!);
            if (queue) {
              queue.forEach(c => peer.addIceCandidate(new RTCIceCandidate(c)).catch(() => { }));
              iceCandidatesQueueRef.current.delete(data.fromSocketId!);
            }
          }).catch(err => console.error("Error handling answer", err));
        } else if (peer && peer.signalingState !== "have-local-offer") {
          console.warn(`[WebRTC] Ignored answer because state is: ${peer.signalingState}`);
        }
      }

      if (data.type === "webrtc_ice_candidate" && data.payload && data.fromSocketId) {
        const peer = getPeer(data.fromSocketId);
        if (peer.remoteDescription) {
          peer.addIceCandidate(new RTCIceCandidate(data.payload)).catch(err => console.error("Error adding ice candidate", err));
        } else {
          // Queue the candidate until remoteDescription is set
          let queue = iceCandidatesQueueRef.current.get(data.fromSocketId);
          if (!queue) {
            queue = [];
            iceCandidatesQueueRef.current.set(data.fromSocketId, queue);
          }
          queue.push(data.payload);
        }
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, roomId]);

  // ─── WebRTC Core Functions ───────────────────────────────────────────────
  const createPeerConnection = (targetSocketId: string, isInitiator: boolean) => {
    if (peersRef.current.has(targetSocketId)) {
      return peersRef.current.get(targetSocketId)!;
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current.set(targetSocketId, peer);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current!);
      });
    }

    peer.onicecandidate = (event) => {
      if (event.candidate && socket && socket.readyState === WebSocket.OPEN && roomId) {
        socket.send(JSON.stringify({
          type: "webrtc_ice_candidate",
          roomId,
          toSocketId: targetSocketId,
          payload: event.candidate
        }));
      }
    };

    peer.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams(prev => ({
          ...prev,
          [targetSocketId]: event.streams[0]!
        }));
      }
    };

    if (isInitiator) {
      peer.createOffer().then(offer => {
        return peer.setLocalDescription(offer);
      }).then(() => {
        if (socket && socket.readyState === WebSocket.OPEN && roomId) {
          socket.send(JSON.stringify({
            type: "webrtc_offer",
            roomId,
            toSocketId: targetSocketId,
            payload: peer.localDescription
          }));
        }
      }).catch(err => console.error("Error creating offer", err));
    }

    return peer;
  };

  const joinCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setHasMedia(true);

      // Add tracks to any existing peers
      peersRef.current.forEach(peer => {
        stream.getTracks().forEach(track => {
          // Check if sender already exists to avoid duplicates
          const senders = peer.getSenders();
          const trackExists = senders.some(s => s.track?.kind === track.kind);
          if (!trackExists) {
            peer.addTrack(track, stream);
          }
        });

        // Renegotiate offer
        peer.createOffer().then(offer => {
          return peer.setLocalDescription(offer);
        }).then(() => {
          // We need the socketId of this peer. We can find it by finding the key in peersRef that matches this peer.
          let targetId: string | null = null;
          peersRef.current.forEach((p, id) => { if (p === peer) targetId = id; });
          if (targetId && socket && socket.readyState === WebSocket.OPEN && roomId) {
            socket.send(JSON.stringify({
              type: "webrtc_offer",
              roomId,
              toSocketId: targetId,
              payload: peer.localDescription
            }));
          }
        }).catch(err => console.error("Error renegotiating", err));
      });

    } catch (err) {
      console.error("Failed to access media devices", err);
      alert("Failed to access camera/microphone. Please check permissions.");
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // ─── Keyboard delete ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        setElements((prev) => prev.filter((el) => el.id !== selectedId));
        if (socket && socket.readyState === WebSocket.OPEN && roomId) {
          socket.send(JSON.stringify({ type: "delete_element", roomId, elementId: selectedId }));
        }
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [selectedId, socket, roomId]);

  // ─── Draw canvas ──────────────────────────────────────────────────────────
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

    const all = [...elements];
    if (currentElementRef.current && action === "drawing") all.push(currentElementRef.current);

    const render =
      action === "moving" || action === "resizing"
        ? all.map((el) =>
          el.id === currentElementRef.current?.id ? currentElementRef.current! : el
        )
        : all;

    render.forEach((el) => {
      if (!el) return;
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth || 2;

      const isSelected = el.id === selectedId;
      if (isSelected) {
        ctx.globalAlpha = 0.4;
      }

      ctx.beginPath();

      if (el.type === "rect") ctx.strokeRect(el.x!, el.y!, el.width!, el.height!);
      else if (el.type === "roundrect") { ctx.roundRect(el.x!, el.y!, el.width!, el.height!, [15]); ctx.stroke(); }
      else if (el.type === "circle") { ctx.arc(el.x!, el.y!, el.radius!, 0, 2 * Math.PI); ctx.stroke(); }
      else if (el.type === "line") { ctx.moveTo(el.x!, el.y!); ctx.lineTo(el.endX!, el.endY!); ctx.stroke(); }
      else if (el.type === "arrow") { drawArrowInfo(ctx, el.x!, el.y!, el.endX!, el.endY!); ctx.stroke(); }
      else if (el.type === "triangle") { drawTriangle(ctx, el.x!, el.y!, el.endX!, el.endY!); ctx.stroke(); }
      else if (el.type === "pencil" && el.points?.length) {
        ctx.moveTo(el.points[0]!.x, el.points[0]!.y);
        el.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      else if (el.type === "text" && el.text) {
        ctx.fillStyle = el.strokeColor;
        const fontSize = (el.strokeWidth || 2) * 12;
        ctx.font = `${fontSize}px 'Caveat', cursive`;
        ctx.textBaseline = "top";
        const lines = el.text.split("\n");
        const lineHeight = fontSize * 1.25;
        lines.forEach((line, i) => {
          ctx.fillText(line, el.x!, el.y! + i * lineHeight);
        });
      }

      if (isSelected) {
        ctx.globalAlpha = 1.0;
        const box = getBoundingBox(el);

        // Draw Selection Outline (Thin Dashed Box)
        ctx.strokeStyle = "#a8a5ff";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1 / cam.zoom;
        ctx.strokeRect(box.x - 2 / cam.zoom, box.y - 2 / cam.zoom, box.w + 4 / cam.zoom, box.h + 4 / cam.zoom);
        ctx.setLineDash([]);

        // Draw Handles
        const hs = 8 / cam.zoom;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1 / cam.zoom;

        const handles = [
          { x: box.x - 2 / cam.zoom, y: box.y - 2 / cam.zoom },
          { x: box.x + box.w + 2 / cam.zoom, y: box.y - 2 / cam.zoom },
          { x: box.x - 2 / cam.zoom, y: box.y + box.h + 2 / cam.zoom },
          { x: box.x + box.w + 2 / cam.zoom, y: box.y + box.h + 2 / cam.zoom },
        ];

        handles.forEach(h => {
          ctx.beginPath();
          ctx.rect(h.x - hs / 2, h.y - hs / 2, hs, hs);
          ctx.fill();
          ctx.stroke();
        });
      }
    });

    ctx.restore();
  }, [elements, action, selectedId, tool, strokeColor, strokeWidth, editingText]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, elements, action, selectedId, editingText]);

  // ─── Zoom / Pan via wheel ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;
      if (e.ctrlKey || e.metaKey) {
        const f = e.deltaY > 0 ? 0.92 : 1.08;
        const nz = Math.min(Math.max(cam.zoom * f, 0.1), 5);
        cameraRef.current = {
          x: e.clientX - ((e.clientX - cam.x) / cam.zoom) * nz,
          y: e.clientY - ((e.clientY - cam.y) / cam.zoom) * nz,
          zoom: nz,
        };
        setZoomUI(nz);
      } else {
        cameraRef.current = { x: cam.x - e.deltaX, y: cam.y - e.deltaY, zoom: cam.zoom };
      }
      drawCanvas();
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [drawCanvas]);

  // ─── Resize canvas ────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        drawCanvas();
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawCanvas]);

  useEffect(() => { drawCanvas(); }, [elements, drawCanvas, selectedId]);

  const toScene = (cx: number, cy: number) => {
    const cam = cameraRef.current;
    return { x: (cx - cam.x) / cam.zoom, y: (cy - cam.y) / cam.zoom };
  };

  // ─── Broadcast helper (for chat fallback logic or other usages) ───────────
  const wsSend = useCallback((msg: object) => {
    if (socket && socket.readyState === WebSocket.OPEN && roomId) {
      socket.send(JSON.stringify({ ...msg, roomId }));
    }
  }, [socket, roomId]);

  // Legacy broadcast for DB persistence
  const broadcastDb = useCallback(
    (el: DrawElement) => {
      if (socket && socket.readyState === WebSocket.OPEN && roomId) {
        socket.send(JSON.stringify({ type: "chat", roomId, message: JSON.stringify(el) }));
      }
    },
    [socket, roomId]
  );


  // ─── Mouse handlers ───────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const sp = toScene(e.clientX, e.clientY);

    if (tool === "selection") {
      // Check handles first
      if (selectedId) {
        const selEl = elements.find(el => el.id === selectedId);
        if (selEl) {
          const handle = getResizeHandle(sp.x, sp.y, selEl, cameraRef.current.zoom);
          if (handle) {
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
        if (isHit(sp.x, sp.y, elements[i]!)) {
          setSelectedId(elements[i]!.id);
          setAction("moving");
          currentElementRef.current = JSON.parse(JSON.stringify(elements[i]));
          snapshotRef.current = JSON.parse(JSON.stringify(elements[i]));
          dragStartRef.current = { x: sp.x, y: sp.y };
          return;
        }
      }
      setSelectedId(null);
      return;
    }

    if (tool === "text") {
      if (editingText) {
        commitText();
      }
      e.preventDefault(); // Stop canvas from taking focus away from our spawning textarea!
      setEditingText({
        id: Date.now().toString(),
        x: sp.x,
        y: sp.y,
        screenX: e.clientX,
        screenY: e.clientY,
        text: "",
        scale: 2,
      });
      setTimeout(() => textareaRef.current?.focus(), 0);
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
      strokeWidth,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const sp = toScene(e.clientX, e.clientY);
    if (action === "none") return;

    if (action === "drawing" && currentElementRef.current) {
      const el = currentElementRef.current;
      if (tool === "rect" || tool === "roundrect") { el.width = sp.x - el.x!; el.height = sp.y - el.y!; }
      else if (tool === "circle") el.radius = Math.hypot(sp.x - el.x!, sp.y - el.y!);
      else if (tool === "line" || tool === "arrow" || tool === "triangle") { el.endX = sp.x; el.endY = sp.y; }
      else if (tool === "pencil") el.points!.push({ x: sp.x, y: sp.y });
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
      if (el.points && snap.points) el.points = snap.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      drawCanvas();
    } else if (action === "resizing" && currentElementRef.current && dragStartRef.current && snapshotRef.current) {
      const dx = sp.x - dragStartRef.current.x;
      const dy = sp.y - dragStartRef.current.y;

      // Ignore tiny jitters (less than 3px) to prevent accidental shrinking on click
      if (Math.hypot(dx, dy) < 3) return;

      const el = currentElementRef.current;
      const snap = snapshotRef.current;
      const handle = resizeHandleRef.current;

      if (el.type === "text") {
        const box = getBoundingBox(snap);
        // Use true scaling relative to box width instead of pointer distance
        const stretchAmount = handle?.includes("e") ? dx : -dx;
        const ratio = Math.max(0.2, 1 + stretchAmount / Math.max(10, box.w));
        el.strokeWidth = Math.max(0.5, (snap.strokeWidth || 2) * ratio);
      } else {
        // Shape resizing
        if (handle === "nw") {
          el.x = Math.min(snap.x! + dx, snap.x! + snap.width!);
          el.y = Math.min(snap.y! + dy, snap.y! + snap.height!);
          el.width = Math.abs(snap.width! - dx);
          el.height = Math.abs(snap.height! - dy);
        }
        if (handle === "ne") {
          el.y = Math.min(snap.y! + dy, snap.y! + snap.height!);
          el.width = Math.abs(snap.width! + dx);
          el.height = Math.abs(snap.height! - dy);
        }
        if (handle === "sw") {
          el.x = Math.min(snap.x! + dx, snap.x! + snap.width!);
          el.width = Math.abs(snap.width! - dx);
          el.height = Math.abs(snap.height! + dy);
        }
        if (handle === "se") {
          el.width = Math.max(5, snap.width! + dx);
          el.height = Math.max(5, snap.height! + dy);
        }
      }
      drawCanvas();
    }
  };

  const handleMouseUp = () => {
    if (action === "drawing" && currentElementRef.current) {
      setRedoStack([]);
      const el = currentElementRef.current;
      setElements((prev) => [...prev, el]);
      setSelectedId(el.id);
      wsSend({ type: "draw", element: el });
      broadcastDb(el); // Still save to DB
    } else if ((action === "moving" || action === "resizing") && currentElementRef.current) {
      const el = currentElementRef.current;
      setElements((prev) => prev.map((e) => (e.id === el.id ? el : e)));
      wsSend({ type: "update_element", element: el });
      broadcastDb(el); // Still save to DB
    }
    setAction("none");
    currentElementRef.current = null;
    dragStartRef.current = null;
    snapshotRef.current = null;
    resizeHandleRef.current = null;
  };

  // We don't use ResizeObserver on the textarea anymore because 
  // it conflicts with programmatic width/height changes (like typing multi-line text).
  // Text resizing is handled properly by canvas selection handles.

  // ─── Commit text helper ──────────────────────────────────────────────────
  const commitText = useCallback(() => {
    setEditingText((curr) => {
      if (!curr) return null;
      if (!curr.text.trim()) return null;

      const el: DrawElement = {
        id: curr.id,
        type: "text",
        x: curr.x,
        y: curr.y,
        strokeColor,
        strokeWidth: (strokeWidth || 2) * (curr.scale || 1),
        text: curr.text,
      };

      setRedoStack([]);
      setElements((prev) => [...prev, el]);
      wsSend({ type: "draw", element: el });
      broadcastDb(el);

      return null;
    });
  }, [strokeColor, strokeWidth, wsSend, broadcastDb]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-secondary bg-dots relative format-neubrutalism font-sans text-black">

      {/* Floating Top Nav */}
      <nav className="absolute top-6 left-6 right-6 flex items-center justify-between shrink-0 z-20">
        {/* Left Side: Logo & Links */}
        <div className="flex items-center gap-6 p-2 rounded-xl bg-white/50 backdrop-blur-sm border-[2px] border-transparent hover:border-black transition-colors">
          <div className="font-bold text-xl tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-4 h-4 bg-black rounded-sm relative shadow-sm" />
            draw.us
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold tracking-tight text-text-muted">
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Copied room URL to clipboard!"); }} className="hover:text-black transition-colors cursor-pointer">Share</button>
            <button onClick={() => {
              if (canvasRef.current) {
                const link = document.createElement("a");
                link.download = `draw-us-export.png`;
                link.href = canvasRef.current.toDataURL();
                link.click();
              }
            }} className="hover:text-black transition-colors cursor-pointer">Export</button>
          </div>
        </div>

        {/* Right Side: Mini Toolbar & Avatars Mock */}
        <div className="flex items-center gap-4 bg-white border-[3px] border-black rounded-full px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <button onClick={() => { setTool("pencil"); setSelectedId(null); }} className={`cursor-pointer hover:scale-110 transition-transform ${tool === 'pencil' ? 'scale-110 drop-shadow-md text-black' : 'opacity-40 text-black'}`} title="Pencil">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button onClick={() => { setTool("rect"); setSelectedId(null); }} className={`cursor-pointer hover:scale-110 transition-transform w-[18px] h-[18px] border-[2.5px] border-currentColor rounded-[4px] flex-shrink-0 ${tool === 'rect' ? 'bg-success scale-110 border-black shadow-[2px_2px_0px_#000] opacity-100' : 'opacity-40 text-black'}`} title="Rectangle"></button>
            <button onClick={() => { setTool("selection"); }} className={`cursor-pointer hover:scale-110 transition-transform font-bold font-serif leading-none flex-shrink-0 text-[18px] ${tool === 'selection' ? 'scale-110 text-accent opacity-100' : 'opacity-40 text-black'}`} title="Select">T</button>
            <button className="text-[18px] cursor-not-allowed opacity-40 text-black font-bold font-serif leading-none hover:scale-110 transition-transform flex-shrink-0" title="Magic Wand">🪄</button>
          </div>
          <div className="w-[2px] h-6 bg-black opacity-20"></div>
          {/* Mock Avatars */}
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full border-2 border-black bg-purple-400 flex items-center justify-center font-bold text-[10px]">A</div>
            <div className="w-7 h-7 rounded-full border-2 border-black bg-yellow-400 flex items-center justify-center font-bold text-[10px]">B</div>
            <div className="w-7 h-7 rounded-full border-2 border-black bg-white flex items-center justify-center font-bold text-[10px]">+2</div>
          </div>
        </div>
      </nav>

      {/* Canvas area */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={(e) => {
            const sp = toScene(e.clientX, e.clientY);
            for (let i = elements.length - 1; i >= 0; i--) {
              const el = elements[i]!;
              if (el.type === "text" && isHit(sp.x, sp.y, el)) {
                if (editingText) commitText();

                const screenX = el.x! * cameraRef.current.zoom + cameraRef.current.x;
                const screenY = el.y! * cameraRef.current.zoom + cameraRef.current.y;

                setEditingText({
                  ...el,
                  screenX,
                  screenY,
                  text: el.text || "",
                  scale: (el as any).scale || 1,
                } as any);

                // Hide from canvas while editing, will be re-added on blur
                setElements(prev => prev.filter(e => e.id !== el.id));

                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                    const len = textareaRef.current.value.length;
                    textareaRef.current.setSelectionRange(len, len);
                  }
                }, 0);
                return;
              }
            }
          }}
          className={`block touch-none w-full h-full ${tool === "text" ? "cursor-text" : tool === "selection" ? "cursor-default" : "cursor-crosshair"}`}
        />

        {/* Floating Text Editing Overlay */}
        {editingText && (
          <textarea
            key={editingText.id}
            ref={textareaRef}
            value={editingText.text}
            onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
            onBlur={commitText}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Escape") {
                setEditingText(null);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
            className="absolute z-50 focus:outline-none"
            style={{
              left: editingText.screenX,
              top: editingText.screenY,
              fontSize: `${(strokeWidth || 2) * (editingText.scale || 1) * 12 * zoomUI}px`,
              fontFamily: "'Caveat', cursive",
              color: strokeColor,
              background: "rgba(168, 165, 255, 0.05)",
              border: "1px dashed #a8a5ff",
              resize: "none",
              padding: "4px 6px",
              lineHeight: 1.25,
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              textAlign: "left" as const,
              width: `${Math.max(60, Math.max(...editingText.text.split('\n').map(l => l.length)) * (strokeWidth || 2) * (editingText.scale || 1) * 12 * 0.55 * zoomUI + 16)}px`,
              height: `${Math.max(((strokeWidth || 2) * (editingText.scale || 1) * 12 * 1.25 * zoomUI) + 10, editingText.text.split('\n').length * (strokeWidth || 2) * (editingText.scale || 1) * 12 * 1.25 * zoomUI + 10)}px`
            }}
          />
        )}
      </div>

      <Toolbar
        tool={tool}
        setTool={(t) => { setTool(t); if (t !== "selection") setSelectedId(null); }}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        onClear={() => {
          elements.forEach(el => {
            if (socket && socket.readyState === WebSocket.OPEN && roomId) {
              socket.send(JSON.stringify({ type: "delete_element", roomId, elementId: el.id }));
            }
          });
          setElements([]);
          setSelectedId(null);
        }}
      />

      {/* Floating Bottom Left Context Card */}
      <div className="absolute bottom-6 left-6 z-20 flex items-end gap-4 pointer-events-auto">
        <div className="bg-white border-[3px] border-black rounded-2xl p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col items-start w-72">

          <div className="flex justify-between items-start w-full">
            <span className="text-[10px] font-bold tracking-widest text-text-muted mb-1 uppercase mt-1">Current Space</span>
            {roomId && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Room URL copied to clipboard!");
                }}
                className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-2 py-1 rounded transition-colors flex gap-1.5 items-center font-bold border border-zinc-300 shadow-[1px_1px_0px_rgba(0,0,0,0.2)] active:translate-y-px active:shadow-none mb-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                Copy Link
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight mb-1 truncate w-full">{roomName || (roomId ? `Room #${roomId}` : "Loading…")}</h2>
          <div className="flex items-center gap-1.5 mb-4">
            <div className={`w-2 h-2 rounded-full border border-black ${socket ? "bg-success" : loading ? "bg-warning animate-pulse" : "bg-danger"}`} />
            <span className="text-xs font-semibold text-text-muted">
              {socket ? `Connected • ${Object.keys(remoteStreams).length + 1} online` : loading ? "Connecting…" : "Disconnected"}
            </span>
          </div>

          {isCallMode && (!hasMedia ? (
            <button onClick={joinCall} className="w-full bg-accent text-white font-bold text-sm px-6 py-2.5 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Join Call
            </button>
          ) : (
            <div className="flex gap-3 w-full">
              <button onClick={toggleAudio} className={`flex-1 font-bold text-sm py-2 rounded-lg border-[3px] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 ${isAudioMuted ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success-dark'}`}>
                {isAudioMuted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-4H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
                {isAudioMuted ? 'Muted' : 'Mic On'}
              </button>
              <button onClick={toggleVideo} className={`flex-1 font-bold text-sm py-2 rounded-lg border-[3px] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 ${isVideoMuted ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-white'}`}>
                {isVideoMuted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
                {isVideoMuted ? 'No Cam' : 'Cam On'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Video Streams Container (Right Side Stack) */}
      {isCallMode && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20 pointer-events-auto max-h-[80vh] overflow-y-auto p-2 scrollbar-hide">
          {hasMedia && (
            <div className="w-48 h-32 bg-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden relative shrink-0">
              <video
                autoPlay
                playsInline
                muted
                ref={(el) => {
                  if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                    el.srcObject = localStreamRef.current;
                  }
                }}
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isVideoMuted ? 'opacity-0' : 'opacity-100'}`}
              />
              {isVideoMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
              <div className="absolute bottom-1.5 right-1.5 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-zinc-700">You</div>
            </div>
          )}

          {Object.entries(remoteStreams).map(([socketId, stream]) => (
            <div key={socketId} className="w-48 h-32 bg-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden relative shrink-0">
              <video
                autoPlay
                playsInline
                ref={(el) => { if (el) el.srcObject = stream; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 right-1.5 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-zinc-700">Peer</div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Bottom Right Zoom Pill */}
      <div className="absolute bottom-6 right-6 z-20 bg-white border-[3px] border-black rounded-full px-5 py-2.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-4">
        <button onClick={() => {
          const cam = cameraRef.current;
          const nz = Math.max(cam.zoom * 0.8, 0.1);
          cameraRef.current = { ...cam, zoom: nz };
          setZoomUI(nz);
          drawCanvas();
        }} className="hover:scale-110 transition-transform font-bold cursor-pointer" title="Zoom Out">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
        </button>
        <span className="font-bold text-sm w-12 text-center tracking-tighter cursor-pointer" onClick={() => {
          cameraRef.current = { x: 0, y: 0, zoom: 1 };
          setZoomUI(1);
          drawCanvas();
        }}>{Math.round(zoomUI * 100)}%</span>
        <button onClick={() => {
          const cam = cameraRef.current;
          const nz = Math.min(cam.zoom * 1.2, 5);
          cameraRef.current = { ...cam, zoom: nz };
          setZoomUI(nz);
          drawCanvas();
        }} className="hover:scale-110 transition-transform font-bold cursor-pointer" title="Zoom In">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
        </button>
        <div className="w-[2px] h-4 bg-black opacity-20"></div>
        <button onClick={() => {
          setElements(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (!last) return prev;
            setRedoStack(r => [...r, last]);
            if (socket && socket.readyState === WebSocket.OPEN && roomId) {
              socket.send(JSON.stringify({ type: "delete_element", roomId, elementId: last.id }));
            }
            return prev.slice(0, -1);
          });
        }} className="hover:scale-110 transition-transform cursor-pointer flex-shrink-0" title="Undo">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </button>
        <button onClick={() => {
          setRedoStack(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (!last) return prev;
            setElements(els => {
              const nextEls = [...els, last];
              if (socket && socket.readyState === WebSocket.OPEN && roomId) {
                socket.send(JSON.stringify({ type: "draw", roomId, element: last }));
              }
              broadcastDb(last); // Save restoring action back to the database!
              return nextEls;
            });
            return prev.slice(0, -1);
          });
        }} className={`transition-transform scale-x-[-1] cursor-pointer flex-shrink-0 ${redoStack.length > 0 ? 'hover:scale-110 opacity-100' : 'opacity-40'}`} title="Redo" disabled={redoStack.length === 0}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </button>
      </div>

      {/* Floating Bottom Center Nav (Properties) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white border-[3px] border-black rounded-full px-5 py-2.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-4 min-w-max">
        {/* Colors */}
        <div className="flex items-center gap-2">
          {["#000000", "#8b5cf6", "#f43f5e", "#bcfd4c", "#facc15"].map((col) => (
            <button
              key={col}
              onClick={() => setStrokeColor(col)}
              className={`w-5 h-5 rounded-full border-[2.5px] transition-all cursor-pointer flex-shrink-0 ${strokeColor === col ? 'border-white outline outline-[3px] outline-black shadow-[2px_2px_0px_rgba(0,0,0,1)] scale-110' : 'border-black hover:scale-110'}`}
              style={{ backgroundColor: col }}
              title="Change color"
            />
          ))}
        </div>
        <div className="w-[3px] h-6 bg-black opacity-10 rounded-full mx-1"></div>
        {/* Thickness */}
        <div className="flex items-center gap-2">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer hover:bg-gray-100 flex-shrink-0 ${strokeWidth === w ? 'bg-gray-200 border-[2px] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''}`}
              title="Change thickness"
            >
              <div className="bg-black rounded-full" style={{ width: '16px', height: `${w}px` }}></div>
            </button>
          ))}
        </div>
        <div className="w-[3px] h-6 bg-black opacity-10 rounded-full mx-1"></div>
        {/* Properties Button */}
        <button className="flex items-center gap-1.5 font-bold tracking-tighter text-sm hover:scale-105 transition-transform cursor-pointer">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Properties
        </button>
      </div>

    </div>
  );
}
