import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import { CreateUSerSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

// app.get('/', (req, res) => {
//     res.json({
//         message: "Hello World"
//     })
// })

app.post('/signin', async (req, res) => {

    const parseData = SignInSchema.safeParse(req.body);

    if (!parseData.success) {
        return res.status(400).json({
            message: "Invalid input"
        })
    }

    const user = await prismaClient.user.findUnique({
        where: {
            email: parseData.data.email
        }
    })

    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }

    const passwordMatch = await bcrypt.compare(parseData.data.password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({ token })
})


app.post('/signup', async (req, res) => {
    const parsedData = CreateUSerSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid input"
        })
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);


    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                name: parsedData.data.name
            }

        })
        return res.json({
            user
        });

    } catch (e) {
        //@ts-ignore
        if (e.code === 'P2002') {
            return res.status(409).json({
                message: "Email already exists"
            })
        }
        console.log(e);
        return res.status(411).json({
            message: "Invalid input"
        })
    }

})


app.post('/room', middleware, async (req, res) => {

    const parseData = CreateRoomSchema.safeParse(req.body);

    if (!parseData.success) {
        return res.status(411).json({
            message: "Invalid input"
        })
    }
    //@ts-ignore
    const userId = req.userId;

    const generatedSlug = randomUUID().substring(0, 8);
    const compositeSlug = `${parseData.data.name.replace(/\s+/g, '-')}-${generatedSlug}`;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: compositeSlug,
                adminId: userId
            }
        });

        return res.json({
            room
        });
    } catch (error) {
        console.error("DEBUG PRI: Error creating room:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: String(error)
        });
    }
})


app.get('/room/:slug', middleware, async (req, res) => {
    const slug = req.params.slug as string;
    const room = await prismaClient.room.findUnique({
        where: {
            slug
        }
    });

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    return res.json({
        room
    });
});

app.get('/rooms', middleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    try {
        const rooms = await prismaClient.room.findMany({
            where: {
                adminId: userId
            }
        });
        return res.json({
            rooms
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

app.delete('/room/:roomId', middleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const roomId = Number(req.params.roomId);

    if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
    }

    try {
        // Verify ownership
        const room = await prismaClient.room.findUnique({
            where: { id: roomId }
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.adminId !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this room" });
        }

        await prismaClient.room.delete({
            where: { id: roomId }
        });

        return res.json({ message: "Room deleted successfully" });
    } catch (e) {
        console.error("Error deleting room:", e);
        return res.status(500).json({ message: "Internal Server Error", error: String(e) });
    }
});

app.get("/chats/:roomId", middleware, async (req, res) => {
    const roomId = Number(req.params.roomId);
    if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
    }
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        }
    })
    res.json({
        messages
    })
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});