import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { me } from "./routes/auth/me";
import { login } from "./routes/auth/login";
import type { JWTPayload } from "./lib/auth";
import { signup } from "./routes/auth/signup";
import { getStudents } from "./routes/class/get-students";
import { startAttendance } from "./routes/class/start-attendance";
import { clearSession, getActiveSession } from "./lib/attendance-state";
import { createClass } from "./routes/class/create-class";
import { addStudent } from "./routes/class/add-student";
import { AttendanceModel, ClassModel } from "./lib/db";

await mongoose.connect(process.env.MONGO_DB_URL!);

mongoose.connection.on("connected", () => {
  console.log("Mongo connected");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

type WSData = JWTPayload;

const server = Bun.serve({
  port: 3000,

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      try {
        const token = url.searchParams.get("token");

        if (!token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        console.log(user);

        if (!user) {
          return new Response("invalid token", { status: 401 });
        }

        if (
          server.upgrade(req, {
            data: {
              userId: user.userId,
              role: user.role,
            },
          })
        ) {
          return;
        }
        return new Response("Upgrade failed", { status: 400 });
      } catch (error: any) {
        console.log(error);
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
        );
      }
    }
  },

  routes: {
    "/": () => new Response("Hello"),
    "/auth/signup": signup,
    "/auth/login": login,
    "/auth/me": me,
    "/class": createClass,
    "/addStudent": addStudent,
    "/students": getStudents,
    "/attendance/start": startAttendance,
  },

  websocket: {
    data: {} as WSData,

    open: (ws) => {
      ws.subscribe("class-room");
      console.log("connected", ws.remoteAddress);
    },
    message: (ws, message) => {
      handleMessage(ws, message);
    },
  },
});

console.log(`Server is running on ${server.url}`);

async function handleMessage(ws, rawMessage) {
  const message = JSON.parse(rawMessage);
  console.log(message);
  console.log(ws.data);
  let activeSession = getActiveSession();

  if (!activeSession) {
    ws.send(
      JSON.stringify({
        event: "Error",
        data: {
          message: "no session",
        },
      }),
    );
    return;
  }

  if (message.event === "ATTENDANCE_MARKED") {
    if (ws.data.role != "teacher") {
      ws.send(
        JSON.stringify({
          event: "Error",
          data: {
            message: "unauthorized",
          },
        }),
      );
      return;
    }

    activeSession.attendance[message.data.studentId] = message.data.status;
    server.publish("class-room", JSON.stringify(message));
  }

  if (message.event === "TODAY_SUMMARY") {
    if (ws.data.role != "teacher") {
      ws.send(
        JSON.stringify({
          event: "Error",
          data: {
            message: "teacher role required",
          },
        }),
      );
      return;
    }

    const values = Object.values(activeSession.attendance);

    const stats = {
      present: values.filter((v) => v === "present").length,
      absent: values.filter((v) => v === "absent").length,
      total: values.length,
    };

    server.publish(
      "class-room",
      JSON.stringify({
        event: "TODAY_SUMMARY",
        data: stats,
      }),
    );
  }

  if (message.event === "MY_ATTENDANCE") {
    if (ws.data.role != "student") {
      ws.send(
        JSON.stringify({
          event: "Error",
          data: {
            message: "student role required",
          },
        }),
      );
      return;
    }

    const status =
      activeSession.attendance[ws.data.userId] ?? "not updated yet";

    ws.send(
      JSON.stringify({
        event: "MY_ATTENDANCE",
        data: {
          status,
        },
      }),
    );
  }

  if (message.event === "DONE") {
    if (ws.data.role != "teacher") {
      ws.send(
        JSON.stringify({
          event: "Error",
          data: {
            message: "teacher role required",
          },
        }),
      );
      return;
    }

    const { classId, attendance, startedAt } = activeSession;

    const studentsInClass =
      await ClassModel.findById(classId).select("studentIds");

    if (!studentsInClass) {
      ws.send(
        JSON.stringify({
          event: "Error",
          data: {
            message: "Class not found",
          },
        }),
      );
      return;
    }

    const students = studentsInClass?.studentIds.map(String);

    for (const studentId of students) {
      if (!attendance[studentId]) {
        attendance[studentId] = "absent";
      }
    }

    const attendanceDocs = Object.entries(activeSession.attendance).map(
      ([studentId, status]) => ({
        classId: activeSession.classId,
        studentId,
        status,
      }),
    );

    await AttendanceModel.insertMany(attendanceDocs);

    // await AttendanceModel.create({
    //   classId,
    //   studentId: students,
    // });

    const values = Object.values(attendance);

    const summary = {
      present: values.filter((v) => v === "present").length,
      absent: values.filter((v) => v === "absent").length,
      total: values.length,
    };

    clearSession();

    server.publish(
      "class-room",
      JSON.stringify({
        event: "DONE",
        data: {
          message: "Attendance persisted",
          ...summary,
        },
      }),
    );
  }
}
