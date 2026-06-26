export type Tool = "selection" | "pencil" | "rect" | "roundrect" | "circle" | "line" | "triangle" | "arrow" | "text";

export type Point = { x: number; y: number };

export interface DrawElement {
  id: string;
  type: Tool;
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  endX?: number;
  endY?: number;
  strokeColor: string;
  strokeWidth?: number;
  text?: string;
}
