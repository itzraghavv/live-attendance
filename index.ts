import mongoose from "mongoose";
import { login } from "./routes/auth/login";
import { signup } from "./routes/auth/signup";

await mongoose.connect(process.env.MONGO_DB_URL!);

mongoose.connection.on("connected", () => {
  console.log("Mongo connected");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => new Response("Hello"),
    "/signup": signup,
    "/login": login,
  },
});

console.log(`Server is running on ${server.url}`);
