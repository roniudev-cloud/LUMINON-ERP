import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Dùng getSession() ở middleware: đọc JWT từ cookie, chỉ gọi mạng tới Supabase
  // Auth khi token đã hết hạn cần refresh — còn lại đọc local, không tốn round-trip.
  // getUser() luôn gọi mạng để revalidate, đúng cho nơi cần tin tưởng tuyệt đối
  // danh tính (đã dùng trong getCurrentUser() ở src/actions/auth.ts cho mọi page/
  // action thật sự truy cập data — KHÔNG đổi, vẫn xác thực đầy đủ qua mạng ở đó).
  // Middleware chỉ cần biết "có đăng nhập hay không" để redirect — gọi getUser()
  // thêm 1 lần nữa ở đây là dư, tốn thêm ~800ms-1s mỗi lần chuyển trang.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/api/migrate-db", "/api/seed", "/api/public"];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthCallback = request.nextUrl.pathname.startsWith("/api/auth");

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute && !isAuthCallback) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
