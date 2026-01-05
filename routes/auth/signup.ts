import { z } from "zod";
import bcrypt from "bcrypt"

import { SignupSchema } from "../../lib/zod/types";
import { UserModel } from "../../lib/db";

export const signup = async (req: Request) => {
       const body = await req.json() as z.infer<typeof SignupSchema>;
       const {username, password, email, role} = body;


       const validData = SignupSchema.safeParse({
        username,
        password,
        email,
        role
       })

       if (!validData.success) {
        return new Response(JSON.stringify({error: validData.error.message}), {status: 400})
       }

       const hashedPassword = await bcrypt.hash(password, 10)

       const data = await UserModel.create({
        username,
        password: hashedPassword,
        email,
        role,
        createdAt: new Date()
       })

       return new Response(JSON.stringify({
        "success": true,
        "data": {
          id: data._id,
          username: data.username,
          password: data.password,
          email: data.email,
          role: data.role
        }
       }))
}