import { z } from "zod";
import { emailSchema } from "@/Schemas/common.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(200),
  /** false → browser-session cookie; true/omitted → persistent for the session lifetime. */
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200)
  .regex(/[a-z]/i, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export const passwordResetRequestSchema = z.object({ email: emailSchema });
export const passwordTokenSchema = z.object({ token: z.string().min(20).max(200) });
export const passwordResetConfirmSchema = passwordTokenSchema.extend({ password: passwordSchema });
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
