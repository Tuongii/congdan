import CitizenForm from "../CitizenForm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gửi Yêu Cầu Hỗ Trợ — Cổng Tiếp Công Dân",
  description:
    "Gửi kiến nghị, phản ánh hoặc đặt lịch hẹn trực tuyến với cơ quan quân sự. Hệ thống tiếp nhận và phản hồi 24/7.",
};

export default function HoTroPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Nút quay lại trang chủ */}
      <div className="max-w-2xl mx-auto w-full mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-qd-green hover:text-qd-light-green transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại trang chủ
        </Link>
      </div>

      {/* Vùng nội dung chính */}
      <div className="flex-grow flex items-center justify-center py-2">
        <CitizenForm />
      </div>

      {/* Footer chính quy bảo mật */}
      <footer className="mt-8 text-center text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold uppercase tracking-wider text-slate-500">Hệ thống Tiếp công dân trực tuyến Quân đội nhân dân Việt Nam</p>
        <p>Bảo mật thông tin mã hóa đầu cuối dữ liệu công dân quốc gia theo tiêu chuẩn thông tin quân sự</p>
        <p>© 2026 Bản quyền thuộc về Bộ Quốc phòng</p>
      </footer>
    </main>
  );
}
