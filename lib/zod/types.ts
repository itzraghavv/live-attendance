import * as z from "zod"

export const SignupSchema = z.object({
    username: z.string(),
    password: z.string().min(8).max(16),
    email: z.email(),
    role: z.enum(["teacher", "student"])
})

export const LoginSchema = z.object({
    username: z.string(),
    password: z.string().min(8).max(16)
})