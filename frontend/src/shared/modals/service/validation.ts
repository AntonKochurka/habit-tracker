import { z } from "zod";

export const folderCreateSchema = z.object({
  title: z.string().min(3, "Title is required"),
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

export const habitCreateSchema = z.object({
  title: z.string().min(3, "Title is required"),
  folder_ids: z.array(z.number()).min(1, "At least one folder is required"),
  description: z.string().optional(),
  habit_type: z.enum(['default', 'timer', 'counter']),
  target_value: z.number().optional(),
  active_days: z.array(z.number()).min(1, "At least one day is required"),
}).refine((data) => {
  if (data.habit_type !== 'default' && !data.target_value) {
    return false;
  }
  return true;
}, {
  message: "Target value is required for timer and counter habits",
  path: ["target_value"],
});

export type HabitCreateValues = z.infer<typeof habitCreateSchema>;