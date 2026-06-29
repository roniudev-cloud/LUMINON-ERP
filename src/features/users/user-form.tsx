"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createUserSchema, updateUserSchema, type CreateUserFormValues, type UpdateUserFormValues } from "@/lib/validations/users";
import { createUserAccount, updateUserAccount } from "@/actions/users";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RoleOption {
  id: string;
  name: string;
  description?: string | null;
}

interface UserFormProps {
  roles: RoleOption[];
  mode: "create" | "edit";
  userId?: string;
  initialData?: { email: string; fullName: string; phone?: string | null; roleIds: string[] };
}

export function UserForm({ roles, mode, userId, initialData }: UserFormProps) {
  const router = useRouter();
  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  const form = useForm({
    resolver: zodResolver(schema as typeof createUserSchema),
    defaultValues: {
      email: "",
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      roleIds: initialData?.roleIds || [],
    },
  });

  async function onSubmit(data: CreateUserFormValues | UpdateUserFormValues) {
    try {
      if (mode === "create") {
        const result = await createUserAccount(data as CreateUserFormValues);
        toast.success("Tạo tài khoản thành công", {
          description: `Mật khẩu tạm: ${result.tempPassword} — hãy gửi cho nhân viên và yêu cầu đổi mật khẩu khi đăng nhập lần đầu.`,
          duration: 15000,
        });
      } else if (userId) {
        await updateUserAccount(userId, data as UpdateUserFormValues);
        toast.success("Cập nhật tài khoản thành công");
      }
      router.push("/settings/users");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Tạo tài khoản đăng nhập thật trên Supabase Auth. Mật khẩu tạm sẽ được sinh tự động."
                : "Cập nhật thông tin và vai trò của nhân viên."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "create" && (
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input type="email" placeholder="nhanvien@luminon.vn" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            {mode === "edit" && (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input value={initialData?.email} disabled />
              </FormItem>
            )}

            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên *</FormLabel>
                <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl><Input placeholder="09xxxxxxxx" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vai trò</CardTitle>
            <CardDescription>Chọn một hoặc nhiều vai trò cho nhân viên này.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField control={form.control} name="roleIds" render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm border rounded-md p-2.5 cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={field.value?.includes(role.id)}
                        onCheckedChange={(checked) => {
                          const current: string[] = field.value || [];
                          field.onChange(checked ? [...current, role.id] : current.filter((id) => id !== role.id));
                        }}
                      />
                      <span className="capitalize">{role.name}</span>
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/settings/users")}>Hủy</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
