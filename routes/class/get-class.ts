import { getAuthUser } from "../../lib/auth";
import { ClassModel } from "../../lib/db";

export const getClass = async (req: Request) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "unauthorized",
        }),
        { status: 401 }
      );
    }

    const { pathname } = new URL(req.url);
    const parts = pathname.split("/");
    const classId = parts[1];

    const data = await ClassModel.findOne(
      user.role === "teacher"
        ? {
            _id: classId,
            teacherId: user.userId,
          }
        : {
            _id: classId,
            studentIds: user.userId,
          }
    ).populate("studentIds", "_id username email role");

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Class not found or access denied" }),
        { status: 403 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 401 }
    );
  }
};
