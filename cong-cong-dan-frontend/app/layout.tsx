import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cổng Tiếp Công Dân - Quân Đội",
  description: "Hệ thống quản lý tiếp công dân trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* Thêm chữ suppressHydrationWarning vào thẻ body để chặn báo lỗi từ Extension */}
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}