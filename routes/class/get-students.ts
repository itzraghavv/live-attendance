import { getAuthUser } from "../../lib/auth";
import { UserModel } from "../../lib/db";

export const getStudents = async (req: Request) => {
  try {
    const user = await getAuthUser(req);

    if (user.role !== "teacher") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "forbidden, teacher access required",
        }),
        { status: 403 }
      );
    }

    const students = await UserModel.find(
      { role: "student" },
      "_id username email"
    );

    const formattedStudents = students.map((student) => ({
      _id: student._id,
      name: student.username,
      email: student.email,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: formattedStudents,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "unauthorized",
      }),
      { status: 401 }
    );
  }
};

