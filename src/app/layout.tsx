import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "LUMINON ERP",
    template: "%s | LUMINON ERP",
  },
  description:
    "Hệ thống ERP quản lý bán hàng, quảng cáo, nội thất và thi công cho doanh nghiệp.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
