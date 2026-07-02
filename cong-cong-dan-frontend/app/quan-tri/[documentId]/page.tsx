"use client";
import React, { useState, useEffect, use } from "react";
import { fetchSubmissionById, updateSubmissionStatusAndReply, TncdttEntry } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TRANG_THAI_CHON = [
  { value: "moi", label: "🟡 Mới", color: "border-amber-500 bg-amber-50 text-amber-800" },
  { value: "dang_xu_ly", label: "🔵 Đang xử lý", color: "border-blue-500 bg-blue-50 text-blue-800" },
  { value: "da_giai_quyet", label: "🟢 Đã giải quyết", color: "border-emerald-500 bg-emerald-50 text-emerald-800" },
  { value: "tu_choi", label: "🔴 Từ chối", color: "border-red-500 bg-red-50 text-red-800" },
];

export default function PhanHoiPage({ params }: { params: Promise<{ documentId: string }> }) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.documentId;
  const router = useRouter();

  const [entry, setEntry] = useState<TncdttEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [trangThai, setTrangThai] = useState<"moi" | "dang_xu_ly" | "da_giai_quyet" | "tu_choi">("moi");
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    async function loadDetail() {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchSubmissionById(documentId);
        setEntry(data);
        setTrangThai(data.trangThai);
        setReplyContent(data.phanHoi || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải chi tiết đơn.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [documentId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      await updateSubmissionStatusAndReply(documentId, trangThai, replyContent);
      setSuccessMsg("Đã cập nhật trạng thái và lưu phản hồi thành công!");
      
      // Tải lại dữ liệu mới nhất
      const updated = await fetchSubmissionById(documentId);
      setEntry(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="animate-spin h-10 w-10 text-qd-green" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-semibold text-slate-600">Đang tải dữ liệu đơn...</p>
        </div>
      </main>
    );
  }

  if (error && !entry) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 border border-slate-200 text-center">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-slate-800 mt-2">Đã xảy ra lỗi</h2>
          <p className="text-xs text-red-600 mt-2">{error}</p>
          <Link
            href="/quan-tri"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-qd-green hover:underline"
          >
            Quay lại trang danh sách
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Nút quay lại */}
        <div className="mb-4">
          <Link
            href="/quan-tri"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-qd-green hover:text-qd-light-green transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại trang quản trị
          </Link>
        </div>

        {/* Tiêu đề */}
        <div className="bg-qd-green rounded-2xl p-6 text-white mb-6 border-b-4 border-qd-yellow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative">
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
              Xử lý phản ánh & Trả lời kiến nghị
            </h1>
            <p className="text-xs md:text-sm font-semibold text-qd-yellow tracking-wide uppercase mt-1">
              Mã tra cứu: {entry?.maTraCuu} — Cổng Tiếp công dân trực tuyến
            </p>
          </div>
        </div>

        {/* Layout Hai cột */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột 1: Thông tin chi tiết đơn (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5 mb-4">
                Thông tin người gửi kiến nghị
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Họ và tên:</span>
                  <span className="font-bold text-slate-800 text-sm">{entry?.hoTen}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Số điện thoại:</span>
                  <span className="font-mono font-semibold text-slate-800 text-sm">{entry?.soDienThoai}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Ngày sinh:</span>
                  <span className="font-semibold text-slate-800">{formatDate(entry?.ngaySinh || null)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Địa chỉ thường trú:</span>
                  <span className="font-semibold text-slate-800">
                    {entry?.xaPhuong}, {entry?.tinhThanh}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5 mb-4">
                Thông tin quân ngũ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Ngày nhập ngũ:</span>
                  <span className="font-semibold text-slate-800">{formatDate(entry?.ngayNhapNgu || null)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Đơn vị công tác trước đây:</span>
                  <span className="font-semibold text-slate-800">{entry?.donViCongTac || "—"}</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5 mb-3">
                Nội dung kiến nghị / Yêu cầu hỗ trợ
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {entry?.noiDung}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 text-right">
                Được tiếp nhận lúc: {formatDateTime(entry?.createdAt || null)}
              </div>
            </div>
          </div>

          {/* Cột 2: Form phản hồi và Trạng thái (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Hộp cập nhật phản hồi */}
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-emerald-600 pl-2.5">
                Xử lý & Phản hồi từ cơ quan quân sự
              </h3>

              {/* Thông báo lỗi/thành công */}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800 animate-fadeIn">
                  <span>✅</span>
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-800 animate-fadeIn">
                  <span>⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Trạng thái xử lý */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Trạng thái giải quyết đơn *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TRANG_THAI_CHON.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTrangThai(opt.value as any)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all duration-200 outline-none ${
                        trangThai === opt.value
                          ? `${opt.color} shadow-sm border-2 font-bold`
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nội dung phản hồi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nội dung phản hồi công dân *
                </label>
                <textarea
                  rows={6}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập nội dung phản hồi, văn bản trả lời chính thức, hướng dẫn thủ tục hoặc lịch hẹn chi tiết đối với công dân..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green p-3 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400 resize-none leading-relaxed"
                  required
                ></textarea>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  📢 <strong>Chú ý:</strong> Nội dung phản hồi này sẽ được hiển thị ngay lập tức khi công dân thực hiện tra cứu bằng mã số của họ trên cổng thông tin trực tuyến.
                </p>
              </div>

              {/* Lưu */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-qd-green hover:bg-qd-light-green disabled:bg-slate-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang lưu phản hồi...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Cập Nhật & Gửi Phản Hồi
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
