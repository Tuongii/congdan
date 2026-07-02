"use client";
import React, { useState } from "react";
import { lookupByTrackCode, TncdttEntry } from "../lib/api";
import Link from "next/link";

const TRANG_THAI_CHON = {
  moi: { label: "🟡 Mới tiếp nhận", color: "bg-amber-50 text-amber-800 border-amber-200" },
  dang_xu_ly: { label: "🔵 Đang xử lý", color: "bg-blue-50 text-blue-800 border-blue-200" },
  da_giai_quyet: { label: "🟢 Đã giải quyết", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  tu_choi: { label: "🔴 Từ chối", color: "bg-red-50 text-red-800 border-red-200" },
};

export default function TraCuuPage() {
  const [trackCode, setTrackCode] = useState("");
  const [entry, setEntry] = useState<TncdttEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    setIsLoading(true);
    setError("");
    setEntry(null);
    setSearched(true);

    try {
      const data = await lookupByTrackCode(trackCode.trim().toUpperCase());
      if (data) {
        setEntry(data);
      } else {
        setError("Không tìm thấy đơn yêu cầu với mã số này. Vui lòng kiểm tra lại.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình tra cứu.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto w-full mb-4">
        {/* Quay lại trang chủ */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-qd-green hover:text-qd-light-green transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại trang chủ
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center py-2">
        <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-qd-green p-6 text-center text-white relative border-b-4 border-qd-yellow">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-white drop-shadow-sm">
              Tra Cứu Tiến Độ Xử Lý Đơn
            </h2>
            <p className="text-xs md:text-sm font-semibold text-qd-yellow tracking-wide uppercase mt-1">
              Cơ Quan Quân Sự - Bộ Quốc Phòng
            </p>
          </div>

          {/* Form tìm kiếm */}
          <form onSubmit={handleSearch} className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="Nhập mã tra cứu (Ví dụ: QD-1234)"
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-qd-green hover:bg-qd-light-green disabled:bg-slate-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang tra cứu...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tra Cứu
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Vùng kết quả */}
          <div className="p-6 bg-white min-h-[200px] flex flex-col justify-center">
            {!searched && (
              <div className="text-center text-slate-400 py-6">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-sm font-semibold">Nhập mã số tra cứu ở trên</p>
                <p className="text-xs text-slate-400 mt-1">Mã số này đã được cung cấp sau khi gửi phản ánh thành công</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center text-slate-400 py-6">
                <svg className="animate-spin h-8 w-8 text-qd-green mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-xs">Đang tìm kiếm thông tin đơn của bạn...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <span className="text-2xl block mb-1">⚠️</span>
                <p className="text-sm font-semibold text-red-800">Lỗi tra cứu</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            )}

            {entry && !isLoading && (
              <div className="space-y-6 animate-fadeIn">
                {/* Khối 1: Tóm tắt trạng thái */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Trạng thái hiện tại</span>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mt-1 ${
                      TRANG_THAI_CHON[entry.trangThai]?.color || "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {TRANG_THAI_CHON[entry.trangThai]?.label || entry.trangThai}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Thời gian tiếp nhận</span>
                    <span className="text-xs font-semibold text-slate-700 mt-1 block">
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Khối 2: Chi tiết phản hồi từ cơ quan */}
                {entry.phanHoi ? (
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🏛️</span> Phản hồi chính thức từ cơ quan quân sự:
                    </h3>
                    <div className="text-sm text-emerald-900 whitespace-pre-line leading-relaxed pl-5">
                      {entry.phanHoi}
                    </div>
                    <div className="text-[10px] text-emerald-600/80 text-right mt-1.5">
                      Cập nhật lúc: {formatDateTime(entry.updatedAt)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 space-y-2">
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⏳</span> Trạng thái xử lý:
                    </h3>
                    <p className="text-xs text-amber-800 leading-relaxed pl-5">
                      Yêu cầu của ông/bà đã được ghi nhận trên hệ thống và đang được trình Thủ trưởng đơn vị phê duyệt. Thông báo kết quả sẽ được cập nhật tại đây và gửi qua SMS/Zalo ngay khi có quyết định giải quyết.
                    </p>
                  </div>
                )}

                {/* Khối 3: Tóm tắt thông tin đã gửi */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thông tin đơn đã gửi</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Người gửi:</span>
                      <span className="font-semibold text-slate-800">{entry.hoTen}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Số điện thoại:</span>
                      <span className="font-semibold text-slate-800">{entry.soDienThoai}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block mb-0.5">Nội dung kiến nghị:</span>
                      <p className="font-semibold text-slate-700 whitespace-pre-line">{entry.noiDung}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold uppercase tracking-wider text-slate-500">Hệ thống Tiếp công dân trực tuyến Quân đội nhân dân Việt Nam</p>
        <p>© 2026 Bản quyền thuộc về Bộ Quốc phòng</p>
      </footer>
    </main>
  );
}
