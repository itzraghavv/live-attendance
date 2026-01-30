import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { me } from "./routes/auth/me";
import { login } from "./routes/auth/login";
import type { JWTPayload } from "./lib/auth";
import { signup } from "./routes/auth/signup";
import { getStudents } from "./routes/class/get-students";
import { startAttendance } from "./routes/class/start-attendance";
import { getActiveSession } from "./lib/attendance-state";
import { createClass } from "./routes/class/create-class";
import { addStudent } from "./routes/class/add-student";

await mongoose.connect(process.env.MONGO_DB_URL!);

mongoose.connection.on("connected", () => {
  console.log("Mongo connected");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const httpServer = Bun.serve({
  port: 3000,
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
});

console.log(`Server is running on ${httpServer.url}`);

type WSData = JWTPayload;

const wss = Bun.serve({
  port: 8080,

  fetch(req, server) {
    const url = new URL(req.url);
    console.log(url);
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
  },

  websocket: {
    data: {} as WSData,
    open(ws) {
      ws.subscribe("class-room");
      console.log("subscribed", ws.remoteAddress);
      console.log("WS connected");
    },

    message(ws, message) {
      handleMessage(ws, message);
    },

    // close(ws) {
    //   handleDisconnect(ws);
    // },
  },
});

function handleMessage(ws, rawMessage) {
  const message = JSON.parse(rawMessage);
  console.log(message);
  console.log(ws.data);
  if (message.event === "ATTENDANCE_MARKED") {
    if (ws.data.role != "teacher") {
      ws.send(
        JSON.stringify({
          error: "something went wrong",
          message: "unauthorized",
        }),
      );
      return;
    }

    let activeSession = getActiveSession();

    if (!activeSession) {
      ws.send(
        JSON.stringify({
          error: "invalid session",
          message: "no session",
        }),
      );
      return;
    }

    activeSession.attendance[message.data.studentId] = message.data.status;
    console.log("Publishing to class-room:", message);
    wss.publish("class-room", JSON.stringify(message));
  }
}
