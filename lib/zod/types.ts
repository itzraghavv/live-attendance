import * as z from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string().min(6).max(12),
  email: z.email(),
  role: z.enum(["teacher", "student"]),
});

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string().min(6).max(12),
});

export const ClassSchema = z.object({
  className: z.string(),
});

export const StudentSchema = z.object({
  studentId: z.string(),
});
