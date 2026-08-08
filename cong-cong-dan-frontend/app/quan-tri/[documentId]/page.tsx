"use client";
import React, { useState, useEffect, use, useRef } from "react";
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
  const [zoomLink, setZoomLink] = useState("");

  // Speech Recognition States
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const initialTextRef = useRef<string>("");
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    silenceTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 5000);
  };

  const clearSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasSpeechSupport(true);
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "vi-VN";

        rec.onresult = (event: any) => {
          resetSilenceTimeout();
          
          let sessionTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript;
          }
          const baseText = initialTextRef.current;
          setReplyContent(baseText + (baseText ? " " : "") + sessionTranscript.trim());
        };

        rec.onend = () => {
          setIsListening(false);
          clearSilenceTimeout();
        };

        rec.onerror = (err: any) => {
          console.error("Speech recognition error", err);
          setIsListening(false);
          clearSilenceTimeout();
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      clearSilenceTimeout();
    } else {
      initialTextRef.current = replyContent;
      setIsListening(true);
      resetSilenceTimeout();
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    async function loadDetail() {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchSubmissionById(documentId);
        setEntry(data);
        setTrangThai(data.trangThai);
        setReplyContent(data.phanHoi || "");
        setZoomLink(data.zoomLink || "");
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
      await updateSubmissionStatusAndReply(documentId, trangThai, replyContent, zoomLink);
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
            {/* Nếu là gửi hộ, hiển thị thông tin người gửi hộ */}
            {entry?.isGuiHo && (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5 mb-4">
                    Thông tin người gửi hộ (Đại diện)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Họ và tên người gửi hộ:</span>
                      <span className="font-bold text-slate-800 text-sm">{entry?.guiHo_hoTen}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Số điện thoại người gửi hộ:</span>
                      <span className="font-mono font-semibold text-slate-800 text-sm">{entry?.guiHo_soDienThoai}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Nơi ở hiện tại:</span>
                      <span className="font-semibold text-slate-800">{entry?.guiHo_diaChi}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Quan hệ với người nhờ gửi đơn:</span>
                      <span className="font-semibold text-slate-800">{entry?.guiHo_quanHe}</span>
                    </div>
                  </div>
                </div>
                <hr className="border-slate-100" />
              </>
            )}

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5 mb-4">
                {entry?.isGuiHo ? "Thông tin người nhờ gửi đơn" : "Thông tin người gửi kiến nghị"}
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
                  <span className="text-slate-500 block mb-0.5">Số thẻ CCCD:</span>
                  <span className="font-mono font-semibold text-slate-800 text-sm">{entry?.soCCCD || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Ngày sinh:</span>
                  <span className="font-semibold text-slate-800">{formatDate(entry?.ngaySinh || null)}</span>
                </div>
                <div className="sm:col-span-2">
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
                  <span className="text-slate-500 block mb-0.5">Số hiệu sĩ quan:</span>
                  <span className="font-mono font-semibold text-slate-800">{entry?.soHieuSiQuan || "—"}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block mb-0.5">Đơn vị công tác trước đây:</span>
                  <span className="font-semibold text-slate-800">{entry?.donViCongTac || "—"}</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Loại yêu cầu & Tiêu đề */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5 mb-4">
                Phân loại & Tiêu đề đơn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Loại yêu cầu:</span>
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    entry?.loaiYeuCau === "kien_nghi_phan_anh" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    entry?.loaiYeuCau === "che_do_chinh_sach" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    entry?.loaiYeuCau === "xac_nhan_cong_tac" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    entry?.loaiYeuCau === "dat_lich_hen" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    "bg-slate-50 text-slate-600 border-slate-200"
                  }`}>
                    {entry?.loaiYeuCau === "kien_nghi_phan_anh" ? "📋 Kiến nghị / Phản ánh" :
                     entry?.loaiYeuCau === "che_do_chinh_sach" ? "🎖️ Chế độ chính sách" :
                     entry?.loaiYeuCau === "xac_nhan_cong_tac" ? "💂 Tuyển quân, tuyển sinh" :
                     entry?.loaiYeuCau === "dat_lich_hen" ? "📅 Đặt lịch hẹn" :
                     entry?.loaiYeuCau}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Tiêu đề đơn:</span>
                  <span className="font-bold text-slate-800">{entry?.tieuDe || "—"}</span>
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

            {/* Tài liệu đính kèm */}
            {entry?.taiLieuDinhKem && entry.taiLieuDinhKem.length > 0 && (
              <>
                <hr className="border-slate-100" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-blue-500 pl-2.5 mb-3">
                    📎 Tài liệu đính kèm ({entry.taiLieuDinhKem.length} tệp)
                  </h3>
                  <div className="space-y-2">
                    {entry.taiLieuDinhKem.map((file) => {
                      const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
                      const fileUrl = file.url.startsWith("http") ? file.url : `${STRAPI_URL}${file.url}`;
                      const icon = file.mime.startsWith("image/") ? "🖼️" : file.mime.startsWith("video/") ? "🎬" : file.mime === "application/pdf" ? "📄" : "📎";
                      return (
                        <a
                          key={file.id}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                        >
                          <span className="text-base">{icon}</span>
                          <span className="font-medium text-slate-700 group-hover:text-blue-700 truncate flex-1">{file.name}</span>
                          <span className="text-slate-400 text-[10px] flex-shrink-0">
                            {(file.size / 1024).toFixed(0)} KB
                          </span>
                          <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Thông tin đặt lịch hẹn */}
            {entry?.loaiYeuCau === "dat_lich_hen" && (
              <>
                <hr className="border-slate-100" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-purple-500 pl-2.5 mb-4">
                    📅 Thông tin đặt lịch hẹn
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-0.5">Ngày hẹn mong muốn:</span>
                        <span className="font-bold text-purple-700 text-sm">{formatDate(entry?.ngayHenMongMuon || null)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Giờ hẹn mong muốn:</span>
                        <span className="font-bold text-purple-700 text-sm">{entry?.gioHenMongMuon || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Hình thức tiếp:</span>
                        <span className="font-bold text-purple-700">
                          {entry?.hinhThucTiep === "truc_tiep" ? "🏢 Trực tiếp tại cơ quan" :
                           entry?.hinhThucTiep === "truc_tuyen" ? "💻 Trực tuyến (video call)" : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nội dung phản hồi công dân *
                  </label>
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={toggleListen}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all duration-300 cursor-pointer ${
                        isListening
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                          </span>
                          <span>Đang nghe...</span>
                        </>
                      ) : (
                        <>
                          <span>🎤</span>
                          <span>Nói để phản hồi</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
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

              {/* Đường dẫn họp trực tuyến (Zoom / Jitsi) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Đường dẫn họp trực tuyến (Zoom / Jitsi / Meet)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={zoomLink}
                    onChange={(e) => setZoomLink(e.target.value)}
                    placeholder="Dán link phòng họp Zoom hoặc Google Meet..."
                    className="flex-grow bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green p-3 rounded-xl text-xs transition-all duration-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (entry) {
                        const newLink = `https://meet.ffmuc.net/TCDTT_QK2_${entry.maTraCuu}`;
                        setZoomLink(newLink);
                        try {
                          setIsSaving(true);
                          setError("");
                          setSuccessMsg("");
                          await updateSubmissionStatusAndReply(documentId, trangThai, replyContent, newLink);
                          setSuccessMsg("Đã tạo nhanh phòng họp Jitsi và lưu lại thành công!");
                          const updated = await fetchSubmissionById(documentId);
                          setEntry(updated);
                        } catch (err) {
                          setError("Lỗi khi tự động lưu phòng họp trực tuyến.");
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl text-[10px] whitespace-nowrap transition-colors duration-200"
                  >
                    Tạo nhanh Jitsi
                  </button>
                </div>
                
                {zoomLink && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        Đường dẫn đã được thiết lập
                      </span>
                      <a
                        href={zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-200 hover:scale-105"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Vào phòng họp trực tuyến (Cán bộ)
                      </a>
                    </div>
                    <p className="text-[10px] text-red-600 font-extrabold block">
                      ⚠️ Trước khi tham gia cuộc họp hãy đảm bảo đã nhấn nút cập nhật và phản hồi bên dưới
                    </p>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  💡 <strong>Gợi ý:</strong> Bạn có thể tự dán link Zoom của mình hoặc bấm <strong>"Tạo nhanh Jitsi"</strong> để tạo phòng họp mở miễn phí tức thì và tự động lưu.
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
