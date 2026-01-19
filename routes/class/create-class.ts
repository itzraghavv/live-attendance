import type z from "zod";

import { ClassModel } from "../../lib/db";
import { getAuthUser } from "../../lib/auth";
import { ClassSchema } from "../../lib/zod/types";

export const createClass = async (req: Request) => {
  try {
    const body = (await req.json()) as z.infer<typeof ClassSchema>;
    const user = await getAuthUser(req);
    if (user.role != "teacher") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "forbidding, teacher access required",
        }),
        { status: 403 },
      );
    }

    const { className } = body;

    const isValidClass = ClassSchema.safeParse(className);
    if (!isValidClass.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid class name/type",
        }),
        { status: 400 },
      );
    }

    const data = await ClassModel.create({
      className: isValidClass.data.className,
      teacherId: user.userId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          _id: data._id,
          className: data.className,
          teacher: data.teacherId,
          students: data.studentIds,
        },
      }),
      { status: 200 },
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
