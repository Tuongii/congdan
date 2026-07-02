import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gửi Yêu Cầu Hỗ Trợ — Cổng Tiếp Công Dân",
  description:
    "Gửi kiến nghị, phản ánh hoặc đặt lịch hẹn trực tuyến với cơ quan quân sự. Hệ thống tiếp nhận và phản hồi 24/7.",
};

// Bạn hãy thay thế đường link Google Form của bạn vào đây
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdvY2tO2aUux-k1_pQj17Y3F-u2D5gR4l8qV4u7u0vB6QWd-A/viewform?embedded=true";

export default function HoTroPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      {/* Nút quay lại trang chủ & Mở tab mới */}
      <div className="max-w-4xl mx-auto w-full mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-qd-green hover:text-qd-light-green transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại trang chủ
        </Link>

        <a
          href={GOOGLE_FORM_URL.replace("?embedded=true", "")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-qd-red hover:underline"
        >
          Mở biểu mẫu trong tab mới ↗
        </a>
      </div>

      {/* Vùng nội dung nhúng Google Form */}
      <div className="flex-grow flex items-center justify-center py-2 w-full">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
          {/* Header Banner */}
          <div className="bg-qd-green p-6 text-center text-white relative border-b-4 border-qd-yellow">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-white drop-shadow-sm">
              Gửi Yêu Cầu Hỗ Trợ & Phản Ánh
            </h2>
            <p className="text-xs md:text-sm font-semibold text-qd-yellow tracking-wide uppercase mt-1">
              Cổng Tiếp Công Dân Trực Tuyến - Quân khu 2
            </p>
          </div>

          {/* Iframe Google Form */}
          <div className="w-full bg-slate-50 p-1 sm:p-3 flex justify-center">
            <iframe
              src={GOOGLE_FORM_URL}
              width="100%"
              height="800"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="rounded-xl w-full min-h-[600px] sm:min-h-[800px] bg-white border border-slate-200"
            >
              Đang tải biểu mẫu...
            </iframe>
          </div>
        </div>
      </div>

      {/* Footer chính quy bảo mật */}
      <footer className="mt-8 text-center text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold uppercase tracking-wider text-slate-500">Hệ thống Tiếp công dân trực tuyến Quân đội nhân dân Việt Nam</p>
        <p>Bảo mật thông tin đầu cuối qua hạ tầng an toàn của Google Forms</p>
        <p>© 2026 Bản quyền thuộc về Bộ Quốc phòng</p>
      </footer>
    </main>
  );
}
