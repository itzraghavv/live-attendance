import { getActiveSession, startSession } from "../../lib/attendance-state";
import { getAuthUser } from "../../lib/auth";
import { StartAttendanceSchema } from "../../lib/zod/types";

export const startAttendance = async (req: Request) => {
  try {
    const user = await getAuthUser(req);

    if (user.role != "teacher") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "unauthorized, only for teachers",
        }),
        { status: 403 },
      );
    }

    const body = await req.json();
    const validData = StartAttendanceSchema.safeParse(body);

    if (!validData.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid request",
        }),
        { status: 400 },
      );
    }

    let activeSession = getActiveSession();

    if (activeSession) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "session already active",
        }),
        { status: 400 },
      );
    }

    startSession(validData.data.classId);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          classId: validData.data.classId,
          startedAt: new Date().toISOString(),
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
