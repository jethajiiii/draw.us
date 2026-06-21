import {z} from "zod";


export const CreateUSerSchema = z.object({
    username: z.string(),
    password: z.string(),
    name: z.string()
})

export const SignInSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const CreateRoomSchema = z.object({
    name: z.string()  
})
