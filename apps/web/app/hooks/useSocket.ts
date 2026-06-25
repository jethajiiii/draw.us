import { useState, useEffect } from "react";
import {WS_URL} from "../config"

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null)    
    const [loading, setLoading] = useState(true) 

    useEffect(() => {
        const token = localStorage.getItem("token");
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);  
        }
    }, [])

    return {
        socket,
        loading
    }
}