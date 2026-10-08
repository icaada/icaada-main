import { z } from "zod";
import { emailSchema } from "@/Schemas/common.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200)
  .regex(/[a-z]/i, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");
