import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().optional().nullable(),
  roleIds: z.array(z.string().uuid()).min(1, "Vui lòng chọn ít nhất 1 vai trò"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().optional().nullable(),
  roleIds: z.array(z.string().uuid()).min(1, "Vui lòng chọn ít nhất 1 vai trò"),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const roleFormSchema = z.object({
  name: z.string().min(1, "Tên vai trò là bắt buộc"),
  description: z.string().optional().nullable(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
