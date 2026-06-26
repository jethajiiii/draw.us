"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WS_URL } from "../../config";

interface RoomContextType {
  socket: WebSocket | null;
  loading: boolean;
  roomId: string;
  roomName: string;
}

const RoomContext = createContext<RoomContextType>({
  socket: null,
  loading: true,
  roomId: "",
  roomName: "",
});

export function useRoom() {
  return useContext(RoomContext);
}

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomIdStr, setRoomIdStr] = useState<string>("");

  const [roomName, setRoomName] = useState<string>("");

  useEffect(() => {
    let wsInstance: WebSocket;
    const token = localStorage.getItem("token");

    // Load integer ID from HTTP backend
    fetch(`http://localhost:3001/room/${slug}`, {
      headers: {
        Authorization: token || ""
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.room) return;
        const mappedRoomId = data.room.id.toString();
        setRoomIdStr(mappedRoomId);
        
        // Derive name from slug (e.g. "meeting-a1b2c3d4" -> "meeting")
        const derivedName = slug.split('-').slice(0, -1).join(' ');
        setRoomName(derivedName || slug);
        
        wsInstance = new WebSocket(`${WS_URL}?token=${token}`);

        wsInstance.onopen = () => {
          setSocket(wsInstance);
          setLoading(false);

          // Join the room using integer ID!
          wsInstance.send(
            JSON.stringify({
              type: "join_room",
              roomId: mappedRoomId,
            })
          );
        };

        wsInstance.onerror = () => {
          setLoading(false);
        };
      })
      .catch((err) => {
        console.error("Failed to load room id", err);
        setLoading(false);
      });

    return () => {
      if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.send(
          JSON.stringify({
            type: "leave_room",
            roomId: roomIdStr, // ensure it uses the integer ID on leave
          })
        );
        wsInstance.close();
      }
    };
  }, [slug]);

  return (
    <RoomContext.Provider value={{ socket, loading, roomId: roomIdStr || slug, roomName }}>
      {children}
    </RoomContext.Provider>
  );
}
