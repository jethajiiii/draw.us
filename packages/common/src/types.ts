import {z} from "zod";


export const CreateUSerSchema = z.object({
    email: z.string().min(3).max(50),
    password: z.string().min(3).max(20),
    name: z.string().min(3).max(20)
})

export const SignInSchema = z.object({
    email: z.string().min(3).max(50),
    password: z.string()
})

export const CreateRoomSchema = z.object({
    name: z.string()  
})
