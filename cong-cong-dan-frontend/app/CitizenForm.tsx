"use client";
import { useState, useEffect, FormEvent } from "react";
import { submitCitizenForm } from "./lib/api";

const API_BASE_URL = "https://provinces.open-api.vn/api/v2";

interface LocationData {
  code: number;
  name: string;
}

export default function CitizenForm() {
  const [provinces, setProvinces] = useState<LocationData[]>([]);
  const [wards, setWards] = useState<LocationData[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | "">("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState<number | "">("");
  const [selectedWardName, setSelectedWardName] = useState("");

  // Trạng thái xử lý dữ liệu biểu mẫu
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [enlistmentDate, setEnlistmentDate] = useState(""); // Ngày nhập ngũ (Không bắt buộc)
  const [pastUnit, setPastUnit] = useState(""); // Đơn vị từng công tác (Không bắt buộc)
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [trackCode, setTrackCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [origin, setOrigin] = useState("https://tncdtt-qd.io.vn");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // 1. Gọi API lấy danh sách Tỉnh / Thành phố
  useEffect(() => {
    fetch(`${API_BASE_URL}/p/`)
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Lỗi lấy dữ liệu tỉnh thành:", err));
  }, []);

  // 2. Gọi API lấy danh sách Xã / Phường dựa theo Tỉnh/Thành đã chọn
  useEffect(() => {
    if (selectedProvinceCode === "") return;

    fetch(`${API_BASE_URL}/w/?province=${selectedProvinceCode}`)
      .then((res) => res.json())
      .then((data) => setWards(data))
      .catch((err) => console.error("Lỗi lấy dữ liệu xã/phường:", err));
  }, [selectedProvinceCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Gửi dữ liệu thật lên Strapi backend
      const result = await submitCitizenForm({
        hoTen: fullname,
        soDienThoai: phone,
        ngaySinh: birthdate,
        tinhThanh: selectedProvinceName,
        xaPhuong: selectedWardName,
        ngayNhapNgu: enlistmentDate || undefined,
        donViCongTac: pastUnit || undefined,
        noiDung: content,
      });

      // Nhận mã tra cứu từ response backend
      setTrackCode(result.maTraCuu);
      setSubmitted(true);
    } catch (error) {
      console.error("Lỗi gửi đơn:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFullname("");
    setPhone("");
    setBirthdate("");
    setEnlistmentDate("");
    setPastUnit("");
    setContent("");
    setSelectedProvinceCode("");
    setSelectedProvinceName("");
    setSelectedWardCode("");
    setSelectedWardName("");
    setSubmitted(false);
    setTrackCode("");
    setErrorMessage("");
  };

  // Giao diện hiển thị khi công dân gửi đơn thành công
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-4 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fadeIn font-sans">
        <div className="bg-qd-green p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-qd-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold uppercase tracking-wide text-white">Gửi Phản Ánh Thành Công</h3>
          <p className="text-xs text-slate-200 mt-1">Hệ thống Tiếp công dân trực tuyến Quốc phòng</p>
        </div>

        <div className="p-6 space-y-5 text-center">
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-1">Mã số tra cứu của ông/bà</p>
            <div className="inline-block bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl font-mono text-2xl font-bold text-qd-red tracking-widest shadow-inner">
              {trackCode}
            </div>
          </div>

          {/* Real-time QR Code for fast mobile lookup */}
          <div className="flex flex-col items-center justify-center space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Quét mã QR để tra cứu nhanh trên điện thoại:
            </p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${origin}/tra-cuu?code=${trackCode}`)}`}
              alt="Mã QR tra cứu tiến độ đơn"
              className="w-36 h-36 border border-slate-200 rounded-lg p-1.5 bg-white shadow-sm transition-all duration-300 hover:scale-105"
            />
            <p className="text-[10px] text-slate-400">
              Sử dụng Camera điện thoại hoặc Zalo để quét và theo dõi tiến trình đơn
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
              <span>🔔</span> Hướng dẫn lưu trữ & Theo dõi:
            </h4>
            <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4">
              <li>Một tin nhắn SMS/Zalo tự động chứa mã tra cứu đã được gửi đến số điện thoại <strong className="text-slate-900">{phone}</strong>.</li>
              <li>Vui lòng lưu lại mã số này để tra cứu tiến độ xử lý trực tiếp trên website.</li>
              <li>Thông báo kết quả giải quyết sẽ tự động gửi về điện thoại ngay khi thủ trưởng đơn vị phê duyệt.</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm"
            >
              Tiếp tục gửi phản ánh khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện Form nhập liệu chuẩn chính quy quân đội
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="bg-qd-green p-6 text-center text-white relative border-b-4 border-qd-yellow">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-white drop-shadow-sm">
          Cổng Tiếp Công Dân Trực Tuyến
        </h2>
        <p className="text-xs md:text-sm font-semibold text-qd-yellow tracking-wide uppercase mt-1">
          Cơ Quan Quân Sự - Bộ Quốc Phòng
        </p>
      </div>

      {/* Thông tin liên hệ / Đường dây nóng */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-center gap-3">
        <a
          href="tel:19001234"
          className="inline-flex items-center gap-2 bg-qd-red hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Gọi: 1900.1234
        </a>
        <a
          href="https://zalo.me/0912345678"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.49 10.272v-.45h1.347v6.322h-1.347v-.45a2.876 2.876 0 01-1.741.59c-1.787 0-3.235-1.49-3.235-3.328s1.448-3.328 3.235-3.328c.653 0 1.26.222 1.741.644zm-1.601.72c-1.168 0-2.044.89-2.044 2.058s.876 2.058 2.044 2.058c1.168 0 2.044-.89 2.044-2.058s-.876-2.058-2.044-2.058z" />
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fillOpacity="0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Zalo: 0912.345.678
        </a>
      </div>

      {/* Thông báo lỗi */}
      {errorMessage && (
        <div className="mx-6 md:mx-8 mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">Gửi đơn thất bại</p>
            <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Biểu mẫu điền thông tin */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 bg-white">

        {/* Khối 1: Thông tin cá nhân cơ bản */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5">
            Thông tin người phản ánh
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Họ và Tên *</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại (Nhận SMS/Zalo) *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                pattern="[0-9]{10,11}"
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày sinh *</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tỉnh / Thành phố *</label>
              <select
                value={selectedProvinceCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProvinceCode(val ? Number(val) : "");
                  // Lưu tên tỉnh/thành để gửi lên Strapi
                  const found = provinces.find((p) => p.code === Number(val));
                  setSelectedProvinceName(found ? found.name : "");
                  if (!val) {
                    setWards([]);
                    setSelectedWardCode("");
                    setSelectedWardName("");
                  }
                }}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none text-slate-900"
                required
              >
                <option value="" className="text-slate-900">-- Chọn Tỉnh/Thành --</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code} className="text-slate-900">{province.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Xã / Phường *</label>
              <select
                value={selectedWardCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedWardCode(val ? Number(val) : "");
                  // Lưu tên xã/phường để gửi lên Strapi
                  const found = wards.find((w) => w.code === Number(val));
                  setSelectedWardName(found ? found.name : "");
                }}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none text-slate-900 disabled:opacity-60"
                disabled={selectedProvinceCode === ""}
                required
              >
                <option value="" className="text-slate-900">-- Chọn Xã/Phường --</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code} className="text-slate-900">{ward.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Khối 2: Thông tin quân ngũ (Bổ sung linh hoạt) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-l-4 border-qd-red pl-2.5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Thông tin quân ngũ <span className="text-slate-400 font-normal capitalize text-xs">(Nếu có)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày nhập ngũ</label>
              <input
                type="date"
                value={enlistmentDate}
                onChange={(e) => setEnlistmentDate(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Đơn vị từng công tác / học tập</label>
              <input
                type="text"
                value={pastUnit}
                onChange={(e) => setPastUnit(e.target.value)}
                placeholder="Ví dụ: Sư đoàn 308, Quân khu 1..."
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Khối 3: Nội dung chi tiết phản ánh */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-qd-red pl-2.5">
            Nội dung kiến nghị / Đặt lịch hẹn
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nội dung chi tiết *</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi rõ tâm tư, nguyện vọng, phản ánh hoặc yêu cầu đặt lịch hẹn trực tuyến cụ thể với cán bộ chỉ huy đơn vị..."
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400 resize-none leading-relaxed"
              required
            ></textarea>
          </div>
        </div>

        {/* Nút gửi dữ liệu */}
        <div className="pt-4 border-t border-slate-100 text-right">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-qd-green hover:bg-qd-light-green disabled:bg-slate-400 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-md shadow-qd-green/10 flex items-center justify-center gap-2 text-sm ml-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi thông tin...
              </>
            ) : (
              "Gửi Yêu Cầu Trực Tuyến"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}