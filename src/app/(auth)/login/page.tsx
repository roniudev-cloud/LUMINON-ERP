"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { Metadata } from "next";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Đăng nhập thất bại", {
        description:
          error.message === "Invalid login credentials"
            ? "Email hoặc mật khẩu không đúng."
            : error.message,
      });
      setLoading(false);
      return;
    }

    toast.success("Đăng nhập thành công!");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg mb-4">
          <span className="text-primary-foreground font-bold text-2xl">L</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">LUMINON ERP</h1>
        <p className="text-muted-foreground mt-2">
          Hệ thống quản lý doanh nghiệp
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin tài khoản để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@luminon.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Tài khoản demo: admin@luminon.vn / Admin@123456
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
