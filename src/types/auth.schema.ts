import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const authResponseSchema = z.object({
  user: z.object({
    _id: z.string(),
    email: z.string(),
    name: z.string(),
    createdAt: z.string(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
