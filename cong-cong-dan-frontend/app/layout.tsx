import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Cổng Tiếp Công Dân Điện Tử - Quân Khu 2",
    default: "Cổng Tiếp Công Dân Điện Tử - Quân Khu 2",
  },
  description: "Hệ thống quản lý và tiếp công dân trực tuyến, tiếp nhận phản ánh, khiếu nại, tố cáo của lực lượng vũ trang Quân khu 2 - Bộ Quốc phòng.",
  keywords: ["tiếp công dân", "quân khu 2", "bộ quốc phòng", "khiếu nại quân đội", "phản ánh trực tuyến", "lịch tiếp dân"],
  authors: [{ name: "Thanh tra Quân khu 2" }],
  openGraph: {
    title: "Cổng Tiếp Công Dân Điện Tử - Quân Khu 2",
    description: "Hệ thống tiếp nhận phản ánh trực tuyến của Quân khu 2.",
    url: "https://tiepcongdan.qk2.bqp.vn",
    siteName: "Cổng Tiếp Công Dân Quân Khu 2",
    locale: "vi_VN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
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