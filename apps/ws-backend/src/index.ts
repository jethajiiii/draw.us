import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
import { prismaClient } from "@repo/db/client"
import dotenv from "dotenv"

dotenv.config({
    path: "../../.env"
})

const wss = new WebSocketServer({port: 8080});

interface User{
    ws: WebSocket,
    userId: string,
    rooms: string[]
}

const users: User[] = []


function checkUser(token: string) : string | null{
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if(typeof decoded == "string"){
            return null;
        }

        if(!decoded || !decoded.userId){
            return null;
        }
        return decoded.userId;
    } catch (error) {
        return null;
    }
}



wss.on('connection',  function connection(ws, request){

    const url = request.url;
    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url?.split('?')[1]);

    const token = queryParams.get('token');

    if(!token){
        return;
    }

    const userId = checkUser(token);

    if(!userId){
        ws.close();
        return;
    }

    users.push({
        ws,
        userId,
        rooms: []
    })

    ws.on('error', console.error);

    ws.on('message', async function message(data){
        const parsedData = JSON.parse(data as unknown as string);

        if(parsedData.type === "join_room"){
            const user = users.find(x => x.ws === ws);
            if(user) {
                user.rooms.push(parsedData.roomId)
            }
        }

        if(parsedData.type === "leave_room"){
            const user = users.find(x => x.ws === ws);
            if(user) {
                user.rooms = user.rooms.filter(x => x !== parsedData.roomId)
            }
        }

        // ── Canvas sync events ──────────────────────────────────────────────

        if(parsedData.type === "draw"){
            const roomId = String(parsedData.roomId);
            const element = parsedData.element;
            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({ type: "draw", element, roomId }));
                }
            });
        }

        if(parsedData.type === "update_element"){
            const roomId = String(parsedData.roomId);
            const element = parsedData.element;
            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({ type: "update_element", element, roomId }));
                }
            });
        }

        if(parsedData.type === "delete_element"){
            const roomId = String(parsedData.roomId);
            const elementId = parsedData.elementId;
            
            // Purge the element from the DB so it doesn't reappear on refresh
            await prismaClient.chat.deleteMany({
                where: {
                    roomId: parseInt(roomId),
                    message: {
                        contains: elementId
                    }
                }
            });

            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({ type: "delete_element", elementId, roomId }));
                }
            });
        }

        // ── Chat ────────────────────────────────────────────────────────────

        if(parsedData.type === "chat"){
            const roomId = parseInt(parsedData.roomId);
            const message = parsedData.message;

            await prismaClient.chat.create({
                data: {
                    roomId,
                    message,
                    userId
                }
            })

            users.forEach(user => {
                if(user.rooms.includes(String(roomId))){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    })

    ws.send('something');
})