import type z from "zod";

import { StudentSchema } from "../../lib/zod/types";
import { getAuthUser } from "../../lib/auth";
import { ClassModel } from "../../lib/db";

export const addStudent = async (req: Request) => {
  try {
    const body = (await req.json()) as z.infer<typeof StudentSchema>;
    const user = await getAuthUser(req);

    if (user.role != "teacher") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "forbidden, teacher access required",
        }),
        { status: 403 },
      );
    }

    const { studentId } = body;

    const isValidStudentId = StudentSchema.safeParse(studentId);
    if (!isValidStudentId.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid student",
        }),
        { status: 400 },
      );
    }

    const { pathname } = new URL(req.url);
    const parts = pathname.split("/");
    const classId = parts[2];

    const updatedClass = await ClassModel.findOneAndUpdate(
      {
        _id: classId,
        teacherId: user.userId,
      },
      {
        $addToSet: { studentIds: studentId },
      },
      { new: true },
    );

    if (!updatedClass) {
      return new Response(
        JSON.stringify({
          success: true,
          data: updatedClass,
        }),
        { status: 200 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedClass,
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
