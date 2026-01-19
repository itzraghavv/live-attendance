import { json, success } from "zod";
import { getAuthUser } from "../../lib/auth";
import { UserModel } from "../../lib/db";

export const myAttendence = async (req: Request) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "unauthorized",
        }),
        { status: 401 },
      );
    }

    if (user.role != "student") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "need student access",
        }),
        { status: 401 },
      );
    }

    const { pathname } = new URL(req.url);
    const parts = pathname.split("/");
    const classId = parts[1];

    const student = await UserModel.findOne({});
  } catch (error: any) {
    // use proper err types ig
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 401 },
    );
  }
};
