import bcrypt from "bcrypt";
import type z from "zod";
import jwt from "jsonwebtoken";

import { LoginSchema } from "../../lib/zod/types";
import { UserModel } from "../../lib/db";
import { success } from "zod";
import type { AnyConnectionBulkWriteModel } from "mongoose";

export const login = async (req: Request) => {
  try {
    const body = (await req.json()) as z.infer<typeof LoginSchema>;
    const { username, password } = body;
    console.log(username, password);

    const validData = LoginSchema.safeParse({
      username,
      password,
    });

    if (!validData.success) {
      console.log(validData.error.format());
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid email or password",
        }),
        { status: 400 },
      );
    }

    const user = await UserModel.findOne({
      username,
    }).select("password");

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "user not found",
        }),
      );
    }

    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid email or password",
        }),
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "3h" },
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          token: token,
        },
      }),
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 401 },
    );
  }
};
