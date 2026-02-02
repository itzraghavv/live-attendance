import jwt from "jsonwebtoken";

export type JWTPayload = {
  userId: string;
  role: "teacher" | "student";
};

export const getAuthUser = async (req: Request) => {
  const authHeaders = req.headers.get("Authorization");

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    throw new Error("invalid auth header");
  }

  const token = authHeaders.split(" ")[1];
  if (!token) {
    throw new Error("missing token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

  return decoded;
};
