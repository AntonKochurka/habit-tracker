import { z } from "zod";

export const folderCreateSchema = z.object({
  title: z.string(),
  color: z.string().default("#ffffff").nonoptional(),
});

export type FolderCreateValues = z.infer<typeof folderCreateSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "At least 6 characters"),
  newPassword: z.string().min(6, "At least 6 characters"),
  confirmPassword: z.string().min(6, "At least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
