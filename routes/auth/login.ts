import bcrypt from "bcrypt";
import type z from "zod";

import { LoginSchema } from "../../lib/zod/types";
import { UserModel } from "../../lib/db";

export const login = async (req: Request) => {
  const body = (await req.json()) as z.infer<typeof LoginSchema>;
  const { username, password } = body;

  const validData = LoginSchema.safeParse({
    username,
    password,
  });

  if (!validData) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "invalid email or password",
      })
    );
  }

  const user = await UserModel.findOne({
    username,
  });

  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "user not found",
      })
    );
  }

  const isValid = await bcrypt.compare(password, user.password!);
  if (!isValid) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "invalid email or password",
      })
    );
  }
    

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        // "token": jwt token here
      },
    })
  );
};
