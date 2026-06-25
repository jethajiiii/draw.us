import { DrawElement } from "@repo/ui/components/canvas/types";

export function getBoundingBox(el: DrawElement) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  if (el.type === "rect" || el.type === "roundrect") {
    minX = Math.min(el.x!, el.x! + el.width!);
    maxX = Math.max(el.x!, el.x! + el.width!);
    minY = Math.min(el.y!, el.y! + el.height!);
    maxY = Math.max(el.y!, el.y! + el.height!);
  } else if (el.type === "circle") {
    minX = el.x! - el.radius!;
    maxX = el.x! + el.radius!;
    minY = el.y! - el.radius!;
    maxY = el.y! + el.radius!;
  } else if (el.type === "line" || el.type === "arrow" || el.type === "triangle") {
    minX = Math.min(el.x!, el.endX!);
    maxX = Math.max(el.x!, el.endX!);
    minY = Math.min(el.y!, el.endY!);
    maxY = Math.max(el.y!, el.endY!);
  } else if (el.type === "pencil" && el.points) {
    el.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
  } else if (el.type === "text" && el.text) {
    const fontSize = (el.strokeWidth || 2) * 12;
    const lines = el.text.split("\n");
    const lineHeight = fontSize * 1.25;
    minX = el.x!;
    minY = el.y!;
    maxX = el.x! + Math.max(...lines.map((l: string) => l.length)) * fontSize * 0.6;
    maxY = el.y! + lines.length * lineHeight;
  }

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function isHit(x: number, y: number, el: DrawElement) {
  const box = getBoundingBox(el);
  const buffer = 5; // allow 5px buffer for easier clicking
  return (
    x >= box.x - buffer &&
    x <= box.x + box.w + buffer &&
    y >= box.y - buffer &&
    y <= box.y + box.h + buffer
  );
}

export function getResizeHandle(x: number, y: number, el: DrawElement, zoom: number) {
  const box = getBoundingBox(el);
  const handleSize = 8 / zoom;
  const half = handleSize / 2;

  const handles = [
    { name: "nw", x: box.x, y: box.y },
    { name: "ne", x: box.x + box.w, y: box.y },
    { name: "sw", x: box.x, y: box.y + box.h },
    { name: "se", x: box.x + box.w, y: box.y + box.h },
  ];

  for (const h of handles) {
    if (x >= h.x - half && x <= h.x + half && y >= h.y - half && y <= h.y + half) {
      return h.name;
    }
  }
  return null;
}

export function drawArrowInfo(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const headlen = 15; // length of head in pixels
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
}

export function drawTriangle(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.moveTo(x1 + (x2 - x1) / 2, y1);
  ctx.lineTo(x1, y2);
  ctx.lineTo(x2, y2);
  ctx.closePath();
}
