import { z } from "zod";

export const signInSchema = z.object({
  username: z.string(),
  password: z.string().min(6, "At least 6 characters"),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    username: z.string().min(3, "At least 3 characters").max(32),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string().min(6, "At least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignUpValues = z.infer<typeof signUpSchema>;
