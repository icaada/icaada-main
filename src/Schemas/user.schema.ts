import { z } from "zod";
import { passwordSchema } from "@/Schemas/auth.schema";
import { accountStatusSchema, emailSchema, optionalCloudinaryUrl, optionalText, paginationQuerySchema, roleSchema, text } from "@/Schemas/common.schema";

export const userPreferencesSchema = z.object({
  digest: z.enum(["Daily", "Weekly", "Never"]).default("Weekly"),
  density: z.enum(["Comfortable", "Compact"]).default("Comfortable"),
  messageAlerts: z.enum(["On", "Off"]).default("On"),
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// ADMIN-only user management
export const userCreateSchema = z.object({
  name: text(120, "Name"),
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.default("EDITOR"),
  roleTitle: optionalText(120),
});
export const userUpdateSchema = z.object({
  name: text(120, "Name").optional(),
  role: roleSchema.optional(),
  status: accountStatusSchema.optional(),
  roleTitle: optionalText(120).optional(),
  /** Admin-set password reset. */
  password: passwordSchema.optional(),
});
export const userListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(200).optional(),
  role: roleSchema.optional(),
  status: accountStatusSchema.optional(),
});

// Own profile (any signed-in user). Email/role/status are not self-editable.
export const profileUpdateSchema = z.object({
  name: text(120, "Name").optional(),
  roleTitle: optionalText(120).optional(),
  avatarUrl: optionalCloudinaryUrl.optional(),
  preferences: userPreferencesSchema.partial().optional(),
});
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(200),
  newPassword: passwordSchema,
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
