"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  fetchAllSubmissions, 
  TncdttEntry, 
  fetchVanBanPhapQuy, 
  createVanBanPhapQuy, 
  deleteVanBanPhapQuy, 
  uploadFile,
  VanBanPhapQuyEntry,
  fetchTinNoiBat,
  createTinNoiBat,
  deleteTinNoiBat,
  TinNoiBatEntry,
  STRAPI_URL 
} from "../lib/api";
import * as XLSX from "xlsx";
import Link from "next/link";

const TRANG_THAI_LABELS: Record<string, string> = {
  moi: "🟡 Mới",
  dang_xu_ly: "🔵 Đang xử lý",
  da_giai_quyet: "🟢 Đã giải quyết",
  tu_choi: "🔴 Từ chối",
};

const LOAI_YEU_CAU_LABELS: Record<string, { label: string; color: string }> = {
  kien_nghi_phan_anh: { label: "📋 Kiến nghị", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  che_do_chinh_sach: { label: "🎖️ Chính sách", color: "bg-amber-50 text-amber-700 border-amber-200" },
  xac_nhan_cong_tac: { label: "💂 Xác nhận", color: "bg-blue-50 text-blue-700 border-blue-200" },
  dat_lich_hen: { label: "📅 Đặt lịch", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var json = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tạo tiêu đề nếu bảng tính trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Mã tra cứu",
        "Họ và tên",
        "Số điện thoại",
        "Số thẻ CCCD",
        "Ngày sinh",
        "Tỉnh/Thành",
        "Xã/Phường",
        "Ngày nhập ngũ",
        "Số hiệu sĩ quan",
        "Đơn vị công tác",
        "Nội dung kiến nghị",
        "Trạng thái",
        "Thời gian gửi"
      ]);
    }
    
    var rowsToAdd = [];
    if (Array.isArray(json)) {
      rowsToAdd = json;
    } else {
      rowsToAdd.push(json);
    }
    
    for (var i = 0; i < rowsToAdd.length; i++) {
      var row = rowsToAdd[i];
      sheet.appendRow([
        row.maTraCuu || "",
        row.hoTen || "",
        row.soDienThoai || "",
        row.soCCCD || "",
        row.ngaySinh || "",
        row.tinhThanh || "",
        row.xaPhuong || "",
        row.ngayNhapNgu || "",
        row.soHieuSiQuan || "",
        row.donViCongTac || "",
        row.noiDung || "",
        row.trangThai || "moi",
        row.createdAt || new Date().toISOString()
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: rowsToAdd.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function QuanTriPage() {
  const [submissions, setSubmissions] = useState<TncdttEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // States cho Google Sheets
  const [showSheetsConfig, setShowSheetsConfig] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // States cho Quản lý văn bản pháp quy
  const [showVanBanConfig, setShowVanBanConfig] = useState(false);
  const [vanBans, setVanBans] = useState<VanBanPhapQuyEntry[]>([]);
  const [isVanBanLoading, setIsVanBanLoading] = useState(false);

  // Form upload văn bản
  const [vbFile, setVbFile] = useState<File | null>(null);
  const [vbLoai, setVbLoai] = useState<'phap_ly' | 'huong_dan'>('phap_ly');
  const [vbTieuDe, setVbTieuDe] = useState('');
  const [vbTrichYeu, setVbTrichYeu] = useState('');
  const [vbNgayBanHanh, setVbNgayBanHanh] = useState('');
  const [vbHieuLuc, setVbHieuLuc] = useState('Còn hiệu lực');
  const [isUploadingVb, setIsUploadingVb] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // States cho Quản lý Tin nổi bật
  const [showTinConfig, setShowTinConfig] = useState(false);
  const [tinList, setTinList] = useState<TinNoiBatEntry[]>([]);
  const [isTinLoading, setIsTinLoading] = useState(false);

  // Form upload Tin nổi bật
  const [tinTieuDe, setTinTieuDe] = useState('');
  const [tinMoTa, setTinMoTa] = useState('');
  const [tinNgayDang, setTinNgayDang] = useState('');
  const [tinFile, setTinFile] = useState<File | null>(null);
  const [isUploadingTin, setIsUploadingTin] = useState(false);
  const [uploadTinError, setUploadTinError] = useState('');
  const [uploadTinSuccess, setUploadTinSuccess] = useState(false);

  const loadTinList = useCallback(async () => {
    setIsTinLoading(true);
    try {
      const data = await fetchTinNoiBat();
      setTinList(data);
    } catch (err) {
      console.error("Lỗi tải danh sách tin nổi bật:", err);
    } finally {
      setIsTinLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showTinConfig) {
      loadTinList();
    }
  }, [showTinConfig, loadTinList]);

  const handleUploadTin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tinFile) {
      setUploadTinError("Vui lòng chọn hình ảnh đại diện cho tin.");
      return;
    }
    if (!tinTieuDe.trim()) {
      setUploadTinError("Vui lòng nhập tiêu đề tin tức.");
      return;
    }
    if (!tinMoTa.trim()) {
      setUploadTinError("Vui lòng nhập tóm tắt mô tả ngắn.");
      return;
    }

    setIsUploadingTin(true);
    setUploadTinError("");
    setUploadTinSuccess(false);

    try {
      // Bước 1: Tải hình ảnh lên Media Library
      const imageId = await uploadFile(tinFile);

      // Bước 2: Tạo tin tức mới liên kết với ID ảnh vừa tải lên
      const response = await createTinNoiBat({
        tieuDe: tinTieuDe.trim(),
        moTa: tinMoTa.trim(),
        ngayDang: tinNgayDang || null,
        hinhAnh: imageId
      });

      // Tự động Publish tin tức
      if (response && response.documentId) {
        try {
          await fetch(`${STRAPI_URL}/api/tin-noi-bats/${response.documentId}/publish`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            }
          });
        } catch (pubErr) {
          console.error("Tự động đăng tin nổi bật thất bại:", pubErr);
        }
      }

      setUploadTinSuccess(true);
      setTinFile(null);
      setTinTieuDe("");
      setTinMoTa("");
      setTinNgayDang("");
      
      // Reload danh sách
      loadTinList();
    } catch (err) {
      setUploadTinError(err instanceof Error ? err.message : "Đăng tin thất bại.");
    } finally {
      setIsUploadingTin(false);
    }
  };

  const handleDeleteTin = async (documentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin nổi bật này?")) return;
    try {
      await deleteTinNoiBat(documentId);
      loadTinList();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa tin.");
    }
  };

  const loadVanBans = useCallback(async () => {
    setIsVanBanLoading(true);
    try {
      const data = await fetchVanBanPhapQuy();
      setVanBans(data);
    } catch (err) {
      console.error("Lỗi tải danh sách văn bản:", err);
    } finally {
      setIsVanBanLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showVanBanConfig) {
      loadVanBans();
    }
  }, [showVanBanConfig, loadVanBans]);

  const handleUploadVanBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vbFile) {
      setUploadError("Vui lòng chọn tệp tin PDF hoặc Word để tải lên.");
      return;
    }

    if (!vbTieuDe.trim()) {
      setUploadError("Vui lòng nhập tiêu đề văn bản.");
      return;
    }
    if (!vbTrichYeu.trim()) {
      setUploadError("Vui lòng nhập trích yếu nội dung chính.");
      return;
    }

    setIsUploadingVb(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      // Bước 1: Upload file lên Media Library của Strapi
      const fileId = await uploadFile(vbFile);
      
      // Bước 2: Tạo bản ghi văn bản mới sử dụng ID của file vừa tải lên
      const response = await createVanBanPhapQuy({
        tieuDe: vbTieuDe.trim(),
        trichYeu: vbTrichYeu.trim(),
        loaiVanBan: vbLoai,
        ngayBanHanh: vbNgayBanHanh || null,
        hieuLuc: vbHieuLuc,
        tepVanBan: fileId,
      });
      
      // Tự động Publish bản ghi nháp vừa tạo (Strapi v5 draft and publish)
      if (response && response.documentId) {
        try {
          await fetch(`${STRAPI_URL}/api/van-ban-phap-quys/${response.documentId}/publish`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            }
          });
        } catch (pubErr) {
          console.error("Tự động đăng văn bản thất bại:", pubErr);
        }
      }

      setUploadSuccess(true);
      setVbFile(null);
      setVbTieuDe("");
      setVbTrichYeu("");
      setVbNgayBanHanh("");
      setVbHieuLuc("Còn hiệu lực");
      
      // Tải lại danh sách
      loadVanBans();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Đăng văn bản thất bại.");
    } finally {
      setIsUploadingVb(false);
    }
  };

  const handleDeleteVanBan = async (documentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa văn bản này khỏi hệ thống?")) return;
    try {
      await deleteVanBanPhapQuy(documentId);
      loadVanBans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa văn bản.");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("GOOGLE_SHEET_WEBAPP_URL");
      if (savedUrl) {
        setTimeout(() => setSheetsUrl(savedUrl), 0);
      }
    }
  }, []);

  const handleSaveSheetsUrl = (url: string) => {
    setSheetsUrl(url);
    if (typeof window !== "undefined") {
      localStorage.setItem("GOOGLE_SHEET_WEBAPP_URL", url);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSyncToSheets = async () => {
    if (!sheetsUrl) {
      setSyncError("Vui lòng cấu hình URL Google Sheets Web App trước.");
      return;
    }
    if (submissions.length === 0) {
      setSyncError("Không có dữ liệu để đồng bộ.");
      return;
    }

    setIsSyncing(true);
    setSyncError("");
    setSyncMessage("");

    try {
      const dataToSync = submissions.map((item) => ({
        maTraCuu: item.maTraCuu,
        hoTen: item.hoTen,
        soDienThoai: item.soDienThoai,
        soCCCD: item.soCCCD || "",
        ngaySinh: item.ngaySinh || "",
        tinhThanh: item.tinhThanh,
        xaPhuong: item.xaPhuong,
        ngayNhapNgu: item.ngayNhapNgu || "",
        soHieuSiQuan: item.soHieuSiQuan || "",
        donViCongTac: item.donViCongTac || "",
        noiDung: item.noiDung,
        trangThai: item.trangThai,
        createdAt: item.createdAt,
      }));

      // Gửi POST dạng text/plain để tránh kích hoạt CORS preflight OPTIONS từ Google Script
      await fetch(sheetsUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(dataToSync),
      });

      setSyncMessage(`Đã gửi yêu cầu đồng bộ ${dataToSync.length} đơn lên Google Sheets thành công! Vui lòng mở bảng tính của bạn để kiểm tra.`);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Đồng bộ thất bại. Vui lòng kiểm tra lại URL.");
    } finally {
      setIsSyncing(false);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchAllSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, [loadData]);


  const handleExportExcel = () => {
    if (submissions.length === 0) return;

    const LOAI_YEU_CAU_MAP: Record<string, string> = {
      kien_nghi_phan_anh: "Kiến nghị / Phản ánh",
      che_do_chinh_sach: "Thông tin, giải quyết chế độ chính sách",
      xac_nhan_cong_tac: "Xác nhận thông tin, quá trình công tác của quân nhân",
      dat_lich_hen: "Đăng ký lịch tiếp dân",
    };

    const HINH_THUC_TIEP_MAP: Record<string, string> = {
      truc_tiep: "Trực tiếp",
      truc_tuyen: "Trực tuyến",
    };

    // Chuyển đổi dữ liệu sang format Excel thân thiện
    const excelData = submissions.map((item, index) => {
      const loaiYeuCauText = LOAI_YEU_CAU_MAP[item.loaiYeuCau] || item.loaiYeuCau || "";
      const hinhThucText = item.hinhThucTiep ? (HINH_THUC_TIEP_MAP[item.hinhThucTiep] || item.hinhThucTiep) : "";
      
      const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const fileUrls = item.taiLieuDinhKem
        ? item.taiLieuDinhKem.map(f => f.url.startsWith("http") ? f.url : `${STRAPI_URL}${f.url}`).join("\n")
        : "";

      return {
        "STT": index + 1,
        "Mã tra cứu": item.maTraCuu,
        "Loại yêu cầu": loaiYeuCauText,
        "Tiêu đề": item.tieuDe || "",
        "Gửi hộ?": item.isGuiHo ? "Có" : "Không",
        "Họ tên người gửi hộ": item.guiHo_hoTen || "",
        "SĐT người gửi hộ": item.guiHo_soDienThoai || "",
        "Địa chỉ người gửi hộ": item.guiHo_diaChi || "",
        "Quan hệ với người nhờ gửi": item.guiHo_quanHe || "",
        "Họ và tên người nhờ gửi": item.hoTen,
        "Số điện thoại người nhờ gửi": item.soDienThoai,
        "Số thẻ CCCD người nhờ gửi": item.soCCCD || "",
        "Ngày sinh": item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString("vi-VN") : "",
        "Tỉnh/Thành": item.tinhThanh,
        "Xã/Phường": item.xaPhuong,
        "Ngày nhập ngũ": item.ngayNhapNgu ? new Date(item.ngayNhapNgu).toLocaleDateString("vi-VN") : "",
        "Số hiệu sĩ quan": item.soHieuSiQuan || "",
        "Đơn vị công tác": item.donViCongTac || "",
        "Nội dung kiến nghị": item.noiDung,
        "Ngày hẹn mong muốn": item.ngayHenMongMuon ? new Date(item.ngayHenMongMuon).toLocaleDateString("vi-VN") : "",
        "Giờ hẹn mong muốn": item.gioHenMongMuon || "",
        "Hình thức tiếp": hinhThucText,
        "Tài liệu đính kèm (Link)": fileUrls,
        "Trạng thái": item.trangThai === "moi" ? "Mới"
          : item.trangThai === "dang_xu_ly" ? "Đang xử lý"
          : item.trangThai === "da_giai_quyet" ? "Đã giải quyết"
          : "Từ chối",
        "Phản hồi giải quyết": item.phanHoi || "",
        "Ngày gửi": item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "",
      };
    });

    // Tạo workbook và worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột
    worksheet["!cols"] = [
      { wch: 5 },   // STT
      { wch: 12 },  // Mã tra cứu
      { wch: 22 },  // Loại yêu cầu
      { wch: 25 },  // Tiêu đề
      { wch: 10 },  // Gửi hộ?
      { wch: 25 },  // Họ tên người gửi hộ
      { wch: 15 },  // SĐT người gửi hộ
      { wch: 30 },  // Địa chỉ người gửi hộ
      { wch: 20 },  // Quan hệ với người nhờ gửi
      { wch: 25 },  // Họ và tên người nhờ gửi
      { wch: 15 },  // SĐT người nhờ gửi
      { wch: 18 },  // Số thẻ CCCD người nhờ gửi
      { wch: 14 },  // Ngày sinh
      { wch: 20 },  // Tỉnh/Thành
      { wch: 20 },  // Xã/Phường
      { wch: 14 },  // Ngày nhập ngũ
      { wch: 18 },  // Số hiệu sĩ quan
      { wch: 25 },  // Đơn vị
      { wch: 50 },  // Nội dung
      { wch: 20 },  // Ngày hẹn mong muốn
      { wch: 18 },  // Giờ hẹn mong muốn
      { wch: 15 },  // Hình thức tiếp
      { wch: 45 },  // Tài liệu đính kèm (Link)
      { wch: 16 },  // Trạng thái
      { wch: 35 },  // Phản hồi giải quyết
      { wch: 20 },  // Ngày gửi
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách đơn TCDTT");

    // Xuất file
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `DanhSach_TCDTT_${today}.xlsx`);
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-qd-green rounded-2xl p-6 text-white mb-6 border-b-4 border-qd-yellow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
            <div>
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
                Quản trị đơn Tiếp công dân
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
              <button
                onClick={() => {
                  setShowSheetsConfig(!showSheetsConfig);
                  if (showVanBanConfig) setShowVanBanConfig(false);
                  if (showTinConfig) setShowTinConfig(false);
                }}
                className={`font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 border shadow-md cursor-pointer ${
                  showSheetsConfig
                    ? "bg-white text-qd-green border-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {showSheetsConfig ? "Đóng cài đặt GG Sheets" : "Cấu hình Google Sheets"}
              </button>
              <button
                onClick={() => {
                  setShowVanBanConfig(!showVanBanConfig);
                  if (showSheetsConfig) setShowSheetsConfig(false);
                  if (showTinConfig) setShowTinConfig(false);
                }}
                className={`font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 border shadow-md cursor-pointer ${
                  showVanBanConfig
                    ? "bg-white text-qd-green border-white"
                    : "bg-[#1b4329] hover:bg-[#225534] text-white border-[#1b4329]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {showVanBanConfig ? "Đóng mục văn bản" : "Đăng văn bản & Hướng dẫn"}
              </button>
              <button
                onClick={() => {
                  setShowTinConfig(!showTinConfig);
                  if (showSheetsConfig) setShowSheetsConfig(false);
                  if (showVanBanConfig) setShowVanBanConfig(false);
                }}
                className={`font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 border shadow-md cursor-pointer ${
                  showTinConfig
                    ? "bg-white text-qd-green border-white"
                    : "bg-blue-700 hover:bg-blue-800 text-white border-blue-700"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                </svg>
                {showTinConfig ? "Đóng mục tin tức" : "Đăng tin nổi bật"}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={submissions.length === 0}
                className="bg-qd-yellow hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-qd-green font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tổng đơn", value: submissions.length, color: "bg-slate-100 text-slate-700" },
            { label: "Mới", value: submissions.filter(s => s.trangThai === "moi").length, color: "bg-amber-50 text-amber-700" },
            { label: "Đang xử lý", value: submissions.filter(s => s.trangThai === "dang_xu_ly").length, color: "bg-blue-50 text-blue-700" },
            { label: "Đã giải quyết", value: submissions.filter(s => s.trangThai === "da_giai_quyet").length, color: "bg-emerald-50 text-emerald-700" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4 text-center border border-slate-200/50`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Cấu hình Google Sheets */}
        {showSheetsConfig && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-6 animate-fadeIn transition-all duration-300">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-l-4 border-emerald-600 pl-3 mb-4">
              Cài đặt liên kết Google Sheets
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột 1: Hướng dẫn cài đặt */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-700">Hướng dẫn kết nối từng bước:</p>
                <ol className="text-xs text-slate-600 space-y-3 list-decimal pl-4">
                  <li>
                    Tạo một trang <strong>Google Sheets</strong> mới trên tài khoản Drive của bạn.
                  </li>
                  <li>
                    Nhấn vào <strong>Tiện ích mở rộng (Extensions)</strong> &rarr; <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Sao chép toàn bộ mã nguồn bên dưới và dán thay thế mã mặc định trong tệp <code className="bg-slate-100 text-red-600 px-1 py-0.5 rounded font-mono text-[10px]">Mã.gs</code>.
                  </li>
                  <li>
                    Nhấn vào nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải &rarr; chọn <strong>Triển khai mới (New deployment)</strong>.
                  </li>
                  <li>
                    Loại triển khai: Chọn <strong>Ứng dụng web (Web app)</strong>. Cấu hình:
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 font-medium text-slate-800">
                      <li>Vai trò (Execute as): <span className="text-emerald-700">Tôi (Me)</span></li>
                      <li>Quyền truy cập (Who has access): <span className="text-emerald-700">Mọi người (Anyone)</span></li>
                    </ul>
                  </li>
                  <li>
                    Nhấn <strong>Triển khai (Deploy)</strong>, cấp quyền nếu được hỏi và <strong>sao chép URL Ứng dụng web</strong> nhận được dán vào ô bên phải.
                  </li>
                </ol>

                {/* Khối code Apps Script */}
                <div className="mt-3">
                  <div className="flex justify-between items-center bg-slate-800 px-4 py-2 rounded-t-xl text-xs text-white">
                    <span className="font-mono">Google Apps Script (Mã.gs)</span>
                    <button
                      onClick={handleCopyCode}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold px-2.5 py-1 rounded transition-colors text-[10px]"
                    >
                      {isCopied ? "✓ Đã sao chép!" : "Sao chép mã"}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-b-xl text-[10px] font-mono overflow-x-auto max-h-[160px] overflow-y-auto border-t border-slate-700/50 leading-relaxed scrollbar-thin">
                    {APPS_SCRIPT_CODE}
                  </pre>
                </div>
              </div>

              {/* Cột 2: Cài đặt URL và Đồng bộ */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Google Sheets Web App URL *
                    </label>
                    <input
                      type="url"
                      value={sheetsUrl}
                      onChange={(e) => handleSaveSheetsUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-emerald-600 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none font-mono placeholder:text-slate-400 text-xs"
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                      💡 <strong>Mẹo bảo mật:</strong> Để tự động đồng bộ thời gian thực khi công dân gửi đơn mới, hãy sao chép URL này dán vào biến <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9px]">GOOGLE_SHEET_WEBAPP_URL</code> trong file cấu hình <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9px]">.env</code> ở backend.
                    </p>
                  </div>

                  {/* Thông báo trạng thái đồng bộ */}
                  {syncMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800">
                      <span className="text-sm">✅</span>
                      <div>
                        <p className="font-bold">Đồng bộ thành công</p>
                        <p className="mt-0.5 leading-relaxed">{syncMessage}</p>
                      </div>
                    </div>
                  )}

                  {syncError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-800">
                      <span className="text-sm">❌</span>
                      <div>
                        <p className="font-bold">Đồng bộ thất bại</p>
                        <p className="mt-0.5 leading-relaxed">{syncError}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡</span> Đồng bộ dữ liệu hàng loạt
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Hành động này sẽ gửi toàn bộ danh sách {submissions.length} đơn hiện có trong cơ sở dữ liệu lên bảng tính Google Sheets của bạn.
                  </p>
                  <button
                    onClick={handleSyncToSheets}
                    disabled={isSyncing || submissions.length === 0 || !sheetsUrl}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-4 py-3 rounded-xl text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang đồng bộ lên Google Sheets...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Đồng bộ lên Google Sheets ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quản lý Văn bản Pháp quy */}
        {showVanBanConfig && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-6 animate-fadeIn transition-all duration-300">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-l-4 border-[#1b4329] pl-3 mb-4">
              Quản lý Văn bản Pháp quy & Hướng dẫn nghiệp vụ
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Đăng tải mới */}
              <form onSubmit={handleUploadVanBan} className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  📤 Đăng tải tài liệu mới
                </h3>

                {uploadSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-bold">
                    ✅ Đăng tải và phân tích văn bản thành công!
                  </div>
                )}

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-3.5 py-2.5 rounded-xl text-xs">
                    ❌ {uploadError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Tệp tin đính kèm (PDF / Word) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setVbFile(e.target.files[0]);
                        setUploadSuccess(false);
                      }
                    }}
                    className="w-full bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs outline-none cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Hỗ trợ tệp tin định dạng .pdf hoặc .docx</p>
                </div>

                 <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Phân loại tài liệu *
                  </label>
                  <select
                    value={vbLoai}
                    onChange={(e) => setVbLoai(e.target.value as any)}
                    className="w-full bg-white text-slate-700 border border-slate-200 px-3 py-2.5 rounded-xl text-xs outline-none font-bold"
                  >
                    <option value="phap_ly">Văn bản</option>
                    <option value="huong_dan">Hướng dẫn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Tiêu đề văn bản *
                  </label>
                  <input
                    type="text"
                    required
                    value={vbTieuDe}
                    onChange={(e) => setVbTieuDe(e.target.value)}
                    placeholder="Ví dụ: Quyết định số 145/QĐ-QK2"
                    className="w-full text-xs outline-none px-3 py-2.5 rounded-xl border border-slate-200 focus:border-qd-green bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Trích yếu nội dung chính *
                  </label>
                  <textarea
                    required
                    value={vbTrichYeu}
                    onChange={(e) => setVbTrichYeu(e.target.value)}
                    placeholder="Tóm tắt ngắn gọn nội dung cốt lõi của văn bản..."
                    rows={3}
                    className="w-full text-xs outline-none px-3 py-2.5 rounded-xl border border-slate-200 focus:border-qd-green bg-white text-slate-800 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Ngày ban hành
                    </label>
                    <input
                      type="date"
                      value={vbNgayBanHanh}
                      onChange={(e) => setVbNgayBanHanh(e.target.value)}
                      className="w-full bg-white text-slate-700 border border-slate-200 px-2 py-2 rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Hiệu lực pháp lý
                    </label>
                    <input
                      type="text"
                      value={vbHieuLuc}
                      onChange={(e) => setVbHieuLuc(e.target.value)}
                      placeholder="Còn hiệu lực"
                      className="w-full bg-white text-slate-800 border border-slate-200 px-2 py-2 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploadingVb || !vbFile}
                  className="w-full bg-[#1b4329] hover:bg-[#225534] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  {isUploadingVb ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang phân tích & đăng tải...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Đăng tải văn bản
                    </>
                  )}
                </button>
              </form>

              {/* Danh sách văn bản đã đăng */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>📋 Danh sách tài liệu hiện có ({vanBans.length} văn bản)</span>
                  <button
                    type="button"
                    onClick={loadVanBans}
                    className="text-qd-green hover:underline font-bold text-[10px]"
                  >
                    🔄 Làm mới danh sách
                  </button>
                </h3>

                <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white max-h-[460px] overflow-y-auto scrollbar-thin">
                  {isVanBanLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                      ⏳ Đang tải danh sách văn bản...
                    </div>
                  ) : vanBans.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      📭 Chưa có tài liệu nào được đăng tải.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="px-3 py-2">STT</th>
                          <th className="px-3 py-2">Tiêu đề văn bản</th>
                          <th className="px-3 py-2">Phân loại</th>
                          <th className="px-3 py-2">Hiệu lực</th>
                          <th className="px-3 py-2">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {vanBans.map((vb, idx) => (
                          <tr key={vb.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 font-medium text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2.5 font-bold text-slate-800 leading-snug">
                              {vb.tieuDe}
                              <span className="block text-[9px] text-slate-400 font-mono font-normal mt-0.5">
                                📄 File: {vb.tepVanBan?.name || "Tài liệu đính kèm"} • {( (vb.tepVanBan?.size || 0) / 1024 ).toFixed(1)} KB
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              {vb.loaiVanBan === 'phap_ly' ? (
                                <span className="bg-emerald-50 border border-emerald-100 text-qd-green px-2 py-0.5 rounded text-[10px] font-bold">
                                  Văn bản
                                </span>
                              ) : (
                                <span className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Hướng dẫn
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 font-medium">
                              {vb.hieuLuc || "Còn hiệu lực"}
                            </td>
                            <td className="px-3 py-2.5">
                              <button
                                onClick={() => handleDeleteVanBan(vb.documentId)}
                                className="bg-red-50 hover:bg-red-100 border border-red-100 text-qd-red font-bold px-2 py-1 rounded transition-colors text-[10px] cursor-pointer"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cấu hình Tin nổi bật */}
        {showTinConfig && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                  📰 Quản lý Tin tức nổi bật Tiếp công dân
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Cập nhật các tin tức và chuyên đề tiếp công dân nổi bật hiển thị ở Carousel trang chủ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Đăng tin */}
              <form onSubmit={handleUploadTin} className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase text-blue-700 tracking-wider border-b border-slate-100 pb-2">
                  ✨ Đăng tin nổi bật mới
                </h3>

                {uploadTinError && (
                  <div className="bg-red-50 text-qd-red border border-red-100 px-3 py-2 rounded-lg text-[10px] font-semibold leading-relaxed">
                    ⚠️ {uploadTinError}
                  </div>
                )}

                {uploadTinSuccess && (
                  <div className="bg-emerald-50 text-qd-green border border-emerald-100 px-3 py-2 rounded-lg text-[10px] font-semibold leading-relaxed">
                    🎉 Đăng tin nổi bật thành công và đã tự động công bố trên Trang chủ!
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Hình ảnh đại diện *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setTinFile(e.target.files[0]);
                        setUploadTinSuccess(false);
                      }
                    }}
                    className="w-full bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs outline-none cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Hỗ trợ các định dạng ảnh phổ biến .png, .jpg, .jpeg, .webp</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Tiêu đề tin nổi bật *
                  </label>
                  <input
                    type="text"
                    required
                    value={tinTieuDe}
                    onChange={(e) => setTinTieuDe(e.target.value)}
                    placeholder="Ví dụ: Tăng cường bảo mật thông tin tiếp công dân..."
                    className="w-full text-xs outline-none px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Mô tả / Tóm tắt ngắn *
                  </label>
                  <textarea
                    required
                    value={tinMoTa}
                    onChange={(e) => setTinMoTa(e.target.value)}
                    placeholder="Nội dung mô tả ngắn gọn hiển thị trên Carousel..."
                    rows={4}
                    className="w-full text-xs outline-none px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 bg-white text-slate-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Ngày đăng tin
                  </label>
                  <input
                    type="date"
                    value={tinNgayDang}
                    onChange={(e) => setTinNgayDang(e.target.value)}
                    className="w-full bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploadingTin || !tinFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  {isUploadingTin ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang xử lý & đăng tải...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Đăng tin nổi bật
                    </>
                  )}
                </button>
              </form>

              {/* Danh sách Tin đã đăng */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>📋 Danh sách tin nổi bật hiện có ({tinList.length} tin)</span>
                  <button
                    type="button"
                    onClick={loadTinList}
                    className="text-blue-600 hover:underline font-bold text-[10px]"
                  >
                    🔄 Làm mới danh sách
                  </button>
                </h3>

                <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white max-h-[460px] overflow-y-auto scrollbar-thin">
                  {isTinLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                      ⏳ Đang tải danh sách tin...
                    </div>
                  ) : tinList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      📭 Chưa có tin tức nổi bật nào được đăng tải.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="px-3 py-2">STT</th>
                          <th className="px-3 py-2">Ảnh</th>
                          <th className="px-3 py-2">Tiêu đề tin tức</th>
                          <th className="px-3 py-2">Ngày đăng</th>
                          <th className="px-3 py-2">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {tinList.map((tin, idx) => (
                          <tr key={tin.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 font-medium text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2.5">
                              <img
                                src={tin.hinhAnh ? `${STRAPI_URL}${tin.hinhAnh.url}` : "/vietnam-flag.png"}
                                alt={tin.tieuDe}
                                className="w-12 h-8 rounded object-cover bg-slate-100 border border-slate-200"
                              />
                            </td>
                            <td className="px-3 py-2.5 font-bold text-slate-800 leading-snug">
                              {tin.tieuDe}
                              <span className="block text-[9px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                                {tin.moTa}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">
                              {tin.ngayDang || new Date(tin.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-3 py-2.5">
                              <button
                                onClick={() => handleDeleteTin(tin.documentId)}
                                className="bg-red-50 hover:bg-red-100 border border-red-100 text-qd-red font-bold px-2 py-1 rounded transition-colors text-[10px] cursor-pointer"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">Lỗi tải dữ liệu</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">STT</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Mã tra cứu</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Loại</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Họ và tên</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">SĐT</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Phản hồi</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Ngày gửi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm font-medium">Chưa có đơn nào</p>
                        <p className="text-xs">Dữ liệu sẽ hiển thị khi công dân gửi đơn qua cổng trực tuyến</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  submissions.map((item, index) => {
                    const loaiInfo = LOAI_YEU_CAU_LABELS[item.loaiYeuCau] || { label: item.loaiYeuCau, color: "bg-slate-50 text-slate-600 border-slate-200" };
                    return (
                    <tr key={item.documentId} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-slate-500 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/quan-tri/${item.documentId}`} className="group outline-none">
                          <span className="font-mono font-bold text-qd-red bg-red-50 group-hover:bg-red-100 group-hover:scale-105 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm border border-red-100">
                            {item.maTraCuu}
                            <svg className="w-3 h-3 text-qd-red opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border whitespace-nowrap ${loaiInfo.color}`}>
                          {loaiInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs max-w-[180px] truncate font-medium" title={item.tieuDe}>
                        <Link href={`/quan-tri/${item.documentId}`} className="hover:text-qd-green transition-colors cursor-pointer">
                          {item.tieuDe || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 text-xs">
                        <Link href={`/quan-tri/${item.documentId}`} className="hover:text-qd-green transition-colors duration-150 cursor-pointer">
                          {item.hoTen}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.soDienThoai}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold whitespace-nowrap">
                          {TRANG_THAI_LABELS[item.trangThai] || item.trangThai}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          item.phanHoi
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {item.phanHoi ? "✓ Đã trả lời" : "⚠ Chưa trả lời"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {submissions.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Hiển thị <strong>{submissions.length}</strong> đơn
              </p>
              <button
                onClick={handleExportExcel}
                className="text-xs font-semibold text-qd-green hover:underline flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Tải xuống Excel
              </button>
            </div>
          )}
        </div>


      </div>
    </main>
  );
}
