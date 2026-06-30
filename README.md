# DRAW.US — Collaborative Drawing Platform

> **The infinite canvas that respects your chaos.**
> A real-time, multiplayer whiteboard and collaborative drawing application built with a modern full-stack monorepo architecture.

---

## ✨ Features

### 🎨 Drawing Canvas

The core of draw.us is a high-performance HTML5 canvas with a rich set of drawing tools, all built from scratch without any third-party canvas library.

| Tool | Description |
|---|---|
| **Pencil** | Freehand drawing with smooth multi-point paths |
| **Line** | Straight lines with precise endpoint control |
| **Rectangle** | Axis-aligned rectangles |
| **Rounded Rectangle** | Rectangles with smooth, configurable corner radius |
| **Circle / Ellipse** | Perfect circles and ellipses |
| **Triangle** | Equilateral and custom triangles |
| **Arrow** | Lines with arrowheads for diagrams and flowcharts |
| **Text** | Inline editable text with dynamic textarea resizing, font scaling, and selection handles |
| **Selection Tool** | Click to select any element on the canvas |
| **Eraser** | Remove individual elements by clicking them |

**Canvas Capabilities:**
- **Infinite Pan**: Drag the canvas freely in any direction — no boundaries
- **Smooth Zoom**: Zoom in/out using scroll wheel or pinch gesture. All coordinate math is camera-aware
- **Selection & Transform**: Click any element to select it; drag the selection handles to resize; drag the body to move
- **Individual Deletion**: Select any element and press `Delete`/`Backspace` to remove it
- **Undo/Redo**: Full undo (`Ctrl+Z`) and redo (`Ctrl+Y`) with an action history stack
- **Stroke Color Picker**: Change the color of strokes using an integrated color palette
- **Stroke Width**: Adjustable stroke width for all shapes from thin to thick

---

### 🌐 Real-Time Collaboration

draw.us is built for real-time multiplayer collaboration. Multiple users can draw on the same canvas simultaneously and see each other's strokes appear live.

- **WebSocket Sync**: All drawing actions are broadcast over a persistent WebSocket connection to the `ws-backend` server
- **Persistent Canvas**: Existing strokes are loaded from the database when a user joins a room, so nothing is lost between sessions
- **Room-Based Architecture**: Each drawing session is isolated within a Room, identified by a unique slug. Users join a specific room by its URL
- **Chat Messages**: Live chat system using the same WebSocket channel for communicating within a room

---

### 📹 Video Calling (Draw + Call Mode)

draw.us offers two distinct modes for collaboration:

#### SOLO (Just Draw)
Standard canvas with real-time sync — no video/audio.

#### COLLAB (Draw + Call)
Full video conferencing integrated directly into the canvas:

- **Peer-to-Peer WebRTC**: Mesh-based video calling using the WebRTC API directly in the browser — no third-party SDK required
- **STUN Server**: Google's public STUN server (`stun.l.google.com:19302`) is used for ICE candidate gathering
- **Video/Audio Mute**: Toggle video and audio independently with in-call controls
- **ICE Candidate Queuing**: Handles out-of-order ICE candidate signaling gracefully
- **Mode Isolation**: WebRTC is **only** initialized when the user explicitly enters `draw-call` mode, preventing unnecessary camera/microphone permissions in solo mode

---

### 🏠 Discovery Dashboard (Homepage)

A Neobrutalist-styled discovery portal displaying all rooms.

- **Community Discovery Grid**: Showcases featured rooms with Van Gogh-style AI-generated thumbnail paintings
- **Your Rooms Section**: Dynamically loads and displays all rooms created by the authenticated user
- **Delete Room**: A neobrutalist-styled confirmation modal lets users delete their own rooms with a single click. Optimistic UI removes the card instantly
- **7 Unique Artwork Thumbnails**: Each room card cycles through 7 unique AI-generated Van Gogh-style paintings as thumbnails
- **Smooth Card Hover Animations**: Cards lift and re-shadow on hover with neobrutalist motion

---

### 🧭 Mode Selection Page — "Kinetic Chaos"

An animated, interactive page where users choose their collaboration mode before entering a session.

- **Mouse-Tracking Parallax**: The card stack follows the user's cursor with a 3D tilt (`perspective` + `rotateX/rotateY` transforms) for a live, dynamic feel
- **Hover Color Reveal**: Hovering a card reveals a radial color burst overlay — lime green for SOLO, purple/magenta for COLLAB
- **Z-Index Swapping**: The hovered card always pops above the other, creating a depth effect
- **SVG Card Art**: Both cards feature the same hand-reaching-toward-light SVG artwork with per-mode color tinting

---

### 🏗️ Room Creation

A clean form-based flow for creating a new named room.

- **Named Rooms**: Users provide a human-readable name for their room
- **Composite Slug**: A URL-safe slug is generated as `{room-name}-{8-char-uuid}` ensuring uniqueness
- **Mode Routing**: The create flow remembers the selected mode (draw/draw-call) and passes it to the room as a URL query parameter (`?mode=draw-call`)

---

### 🔐 Authentication

Secure, token-based authentication guarding all routes.

- **Sign Up / Sign In**: Email and password authentication with `bcrypt` hashed passwords
- **JWT Tokens**: JSON Web Tokens are issued on login and stored in both `localStorage` and a browser `cookie`
- **Next.js Middleware**: A server-side middleware (`middleware.ts`) intercepts every request and redirects unauthenticated users to `/login` before the page even renders
- **Dual Token Storage**: Uses both `localStorage` for API calls and `document.cookie` for server-side middleware validation

---

## 🏛️ Architecture

This project is a **Turborepo** monorepo with `pnpm` as the package manager.

```
myApp/
├── apps/
│   ├── web/              # Next.js 15 frontend (App Router)
│   ├── http-backend/     # Express.js REST API (Port 3001)
│   └── ws-backend/       # WebSocket server (Port 8080)
└── packages/
    ├── db/               # Prisma ORM + PostgreSQL schema
    ├── common/           # Zod validation schemas (shared)
    ├── backend-common/   # JWT secret + shared backend config
    ├── ui/               # Shared TypeScript types & canvas utilities
    ├── eslint-config/    # Shared ESLint rules
    └── typescript-config/# Shared tsconfig presets
```

### Frontend — `apps/web`

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with a strict Neobrutalist design system (thick borders, heavy shadows, bold typography)
- **Canvas**: Pure HTML5 Canvas 2D API — no Fabric.js, no Konva
- **Routing**:
  - `/` — Discovery Dashboard
  - `/login` — Sign In
  - `/signup` — Sign Up
  - `/create` — Kinetic Chaos Mode Selection
  - `/create/[mode]` — Room Creation form
  - `/room/[slug]` — Collaborative Canvas

### HTTP Backend — `apps/http-backend`

A lightweight Express.js REST API.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | No | Register a new user |
| `POST` | `/signin` | No | Login; returns a JWT token |
| `POST` | `/room` | ✅ | Create a new drawing room |
| `GET` | `/rooms` | ✅ | Get all rooms owned by the current user |
| `GET` | `/room/:slug` | ✅ | Get a single room's details |
| `DELETE` | `/room/:roomId` | ✅ | Delete a room (owner only) |
| `GET` | `/chats/:roomId` | ✅ | Load prior chat messages for a room |

### WebSocket Server — `apps/ws-backend`

Handles real-time bidirectional communication.

- **Drawing Sync**: Broadcasts canvas draw events to all users in the same room
- **WebRTC Signaling**: Relays SDP offer/answer and ICE candidates between peers for video calling
- **Room Management**: Tracks which WebSocket connections belong to which rooms

### Database — `packages/db`

- **ORM**: Prisma
- **Database**: PostgreSQL
- **Models**: `User`, `Room`, `Chat`

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- pnpm v8+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd myApp

# Install all dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@host:5432/drawus"
JWT_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
```

### Database Setup

```bash
# Run Prisma migrations
pnpm --filter @repo/db run db:push
```

### Run in Development

```bash
# Start all services concurrently (web, http-backend, ws-backend)
pnpm run dev
```

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| HTTP Backend | http://localhost:3001 |
| WebSocket Backend | ws://localhost:8080 |

---

## 🎨 Design System

draw.us follows a strict **Neobrutalism** design language:

- **Borders**: `3px solid black` on all interactive components
- **Shadows**: Offset hard box-shadows (`6px 6px 0px rgba(0,0,0,1)`)
- **Typography**: All-caps, heavy `font-black` weight, tight tracking
- **Color Palette**: High-contrast combinations — lime `#bef264`, hot pink `#fbcfe8`, indigo `#e9d5ff` on stark white backgrounds
- **Hover States**: Cards translate up (`-translate-y-1`) and shadows grow on hover
- **Active States**: Elements translate down and shadows shrink on click

---

## 📄 License

MIT © 2026 DRAW.US
