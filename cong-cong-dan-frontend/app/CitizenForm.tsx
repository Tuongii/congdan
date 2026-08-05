"use client";
import { useState, useEffect, FormEvent, useRef, DragEvent } from "react";
import { submitCitizenForm } from "./lib/api";

const API_BASE_URL = "https://provinces.open-api.vn/api/v2";

interface LocationData {
  code: number;
  name: string;
}

const LOAI_YEU_CAU_OPTIONS = [
  {
    value: "kien_nghi_phan_anh",
    label: "Kiến nghị / Phản ánh",
    icon: "📋",
    color: "emerald",
    description: "Phản ánh các vấn đề phát sinh, kiến nghị cải tiến nâng cao chất lượng hoạt động..."
  },
  {
    value: "che_do_chinh_sach",
    label: "Thông tin, giải quyết chế độ chính sách",
    icon: "🎖️",
    color: "amber",
    description: "Tra cứu, giải quyết chế độ chính sách quân nhân, người có công, phục viên, hậu phương quân đội..."
  },
  {
    value: "xac_nhan_cong_tac",
    label: "Xác nhận thông tin, quá trình công tác của quân nhân",
    icon: "💂",
    color: "blue",
    description: "Xác nhận thông tin quân nhân, quá trình công tác, phục vụ tại đơn vị..."
  },
  {
    value: "dat_lich_hen",
    label: "Đăng ký lịch tiếp dân",
    icon: "📅",
    color: "purple",
    description: "Đặt lịch hẹn gặp mặt trực tiếp hoặc trực tuyến với Thủ trưởng cơ quan quân sự các cấp..."
  },
];

const GIO_HEN_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "video/mp4",
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime === "application/pdf") return "📄";
  return "📎";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
  const [soCCCD, setSoCCCD] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [enlistmentDate, setEnlistmentDate] = useState("");
  const [soHieuSiQuan, setSoHieuSiQuan] = useState("");
  const [pastUnit, setPastUnit] = useState("");

  // Trường mới
  const [loaiYeuCau, setLoaiYeuCau] = useState<"kien_nghi_phan_anh" | "che_do_chinh_sach" | "xac_nhan_cong_tac" | "dat_lich_hen">("kien_nghi_phan_anh");
  const [tieuDe, setTieuDe] = useState("");
  const [content, setContent] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [commitChecked, setCommitChecked] = useState(false);

  // Proxy Applicant States (Gửi đơn hộ)
  const [isGuiHo, setIsGuiHo] = useState(false);
  const [guiHoHoTen, setGuiHoHoTen] = useState("");
  const [guiHoSoDienThoai, setGuiHoSoDienThoai] = useState("");
  const [guiHoSoCCCD, setGuiHoSoCCCD] = useState("");
  const [guiHoDiaChi, setGuiHoDiaChi] = useState("");
  const [guiHoQuanHe, setGuiHoQuanHe] = useState("");

  // Đặt lịch hẹn
  const [ngayHen, setNgayHen] = useState("");
  const [gioHen, setGioHen] = useState("");
  const [hinhThucTiep, setHinhThucTiep] = useState<"truc_tiep" | "truc_tuyen">("truc_tiep");

  const [submitted, setSubmitted] = useState(false);
  const [trackCode, setTrackCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [origin, setOrigin] = useState("https://tncdtt-qd.io.vn");
  const [history, setHistory] = useState<{ code: string, title: string, date: string }[]>([]);

  // Speech Recognition States
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeFieldRef = useRef<string | null>(null);
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

          const currentField = activeFieldRef.current;
          const baseText = initialTextRef.current;
          const newText = baseText + (baseText ? " " : "") + sessionTranscript.trim();

          if (currentField === "fullname") {
            setFullname(newText);
          } else if (currentField === "phone") {
            const numbers = newText.replace(/\D/g, "");
            setPhone(numbers);
          } else if (currentField === "soCCCD") {
            const numbers = newText.replace(/\D/g, "");
            setSoCCCD(numbers);
          } else if (currentField === "soHieuSiQuan") {
            const clean = newText.replace(/\D/g, "");
            setSoHieuSiQuan(clean);
          } else if (currentField === "pastUnit") {
            setPastUnit(newText);
          } else if (currentField === "tieuDe") {
            setTieuDe(newText);
          } else if (currentField === "content") {
            setContent(newText);
          } else if (currentField === "guiHoHoTen") {
            setGuiHoHoTen(newText);
          } else if (currentField === "guiHoSoDienThoai") {
            const numbers = newText.replace(/\D/g, "");
            setGuiHoSoDienThoai(numbers);
          } else if (currentField === "guiHoSoCCCD") {
            const numbers = newText.replace(/\D/g, "");
            setGuiHoSoCCCD(numbers);
          } else if (currentField === "guiHoDiaChi") {
            setGuiHoDiaChi(newText);
          } else if (currentField === "guiHoQuanHe") {
            setGuiHoQuanHe(newText);
          }
        };

        rec.onend = () => {
          setListeningField(null);
          activeFieldRef.current = null;
          clearSilenceTimeout();
        };

        rec.onerror = (err: any) => {
          console.error("Speech recognition error", err);
          setListeningField(null);
          activeFieldRef.current = null;
          clearSilenceTimeout();
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListen = (field: string) => {
    if (!recognitionRef.current) return;

    if (activeFieldRef.current === field) {
      recognitionRef.current.stop();
      setListeningField(null);
      activeFieldRef.current = null;
      clearSilenceTimeout();
    } else {
      if (activeFieldRef.current) {
        recognitionRef.current.stop();
      }

      // Capture the current value of the field to append transcript later
      let currentVal = "";
      if (field === "fullname") currentVal = fullname;
      else if (field === "phone") currentVal = phone;
      else if (field === "soCCCD") currentVal = soCCCD;
      else if (field === "soHieuSiQuan") currentVal = soHieuSiQuan;
      else if (field === "pastUnit") currentVal = pastUnit;
      else if (field === "tieuDe") currentVal = tieuDe;
      else if (field === "content") currentVal = content;
      else if (field === "guiHoHoTen") currentVal = guiHoHoTen;
      else if (field === "guiHoSoDienThoai") currentVal = guiHoSoDienThoai;
      else if (field === "guiHoSoCCCD") currentVal = guiHoSoCCCD;
      else if (field === "guiHoDiaChi") currentVal = guiHoDiaChi;
      else if (field === "guiHoQuanHe") currentVal = guiHoQuanHe;

      initialTextRef.current = currentVal;
      activeFieldRef.current = field;
      setListeningField(field);

      resetSilenceTimeout();
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      const saved = localStorage.getItem("citizen_submissions");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) { }
      }
    }
  }, []);

  // Gọi API lấy danh sách Tỉnh / Thành phố
  useEffect(() => {
    fetch(`${API_BASE_URL}/p/`)
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Lỗi lấy dữ liệu tỉnh thành:", err));
  }, []);

  // Gọi API lấy danh sách Xã / Phường dựa theo Tỉnh/Thành đã chọn
  useEffect(() => {
    if (selectedProvinceCode === "") return;

    fetch(`${API_BASE_URL}/w/?province=${selectedProvinceCode}`)
      .then((res) => res.json())
      .then((data) => setWards(data))
      .catch((err) => console.error("Lỗi lấy dữ liệu xã/phường:", err));
  }, [selectedProvinceCode]);

  // === File handling ===
  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setFileError("");
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError(`Tệp "${file.name}" không được hỗ trợ. Chỉ chấp nhận: PDF, DOCX, PNG, JPG, MP4.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`Tệp "${file.name}" vượt quá kích thước 10MB cho phép.`);
        continue;
      }
      validFiles.push(file);
    }

    setAttachedFiles((prev) => {
      const total = [...prev, ...validFiles];
      if (total.length > MAX_FILES) {
        setFileError(`Chỉ được đính kèm tối đa ${MAX_FILES} tệp.`);
        return total.slice(0, MAX_FILES);
      }
      return total;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commitChecked) {
      setErrorMessage("Vui lòng xác nhận cam đoan thông tin trước khi gửi đơn.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await submitCitizenForm({
        hoTen: fullname,
        soDienThoai: phone,
        soCCCD: soCCCD || undefined,
        ngaySinh: birthdate,
        tinhThanh: selectedProvinceName,
        xaPhuong: selectedWardName,
        ngayNhapNgu: enlistmentDate || undefined,
        soHieuSiQuan: soHieuSiQuan || undefined,
        donViCongTac: pastUnit || undefined,
        loaiYeuCau,
        tieuDe,
        noiDung: content,
        taiLieuDinhKem: attachedFiles.length > 0 ? attachedFiles : undefined,
        ngayHenMongMuon: loaiYeuCau === "dat_lich_hen" ? ngayHen || undefined : undefined,
        gioHenMongMuon: loaiYeuCau === "dat_lich_hen" ? gioHen || undefined : undefined,
        hinhThucTiep: loaiYeuCau === "dat_lich_hen" ? hinhThucTiep : undefined,
        isGuiHo,
        guiHo_hoTen: isGuiHo ? guiHoHoTen : undefined,
        guiHo_soDienThoai: isGuiHo ? guiHoSoDienThoai : undefined,
        guiHo_soCCCD: isGuiHo ? guiHoSoCCCD : undefined,
        guiHo_diaChi: isGuiHo ? guiHoDiaChi : undefined,
        guiHo_quanHe: isGuiHo ? guiHoQuanHe : undefined,
      });

      setTrackCode(result.maTraCuu);
      setSubmitted(true);

      const newHistory = { code: result.maTraCuu, title: tieuDe, date: new Date().toISOString() };
      setHistory(prev => {
        const updated = [newHistory, ...prev].slice(0, 5);
        localStorage.setItem("citizen_submissions", JSON.stringify(updated));
        return updated;
      });
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
    setSoCCCD("");
    setBirthdate("");
    setEnlistmentDate("");
    setSoHieuSiQuan("");
    setPastUnit("");
    setLoaiYeuCau("kien_nghi_phan_anh");
    setTieuDe("");
    setContent("");
    setAttachedFiles([]);
    setFileError("");
    setNgayHen("");
    setGioHen("");
    setHinhThucTiep("truc_tiep");
    setSelectedProvinceCode("");
    setSelectedProvinceName("");
    setSelectedWardCode("");
    setSelectedWardName("");
    setCommitChecked(false);
    setSubmitted(false);
    setTrackCode("");
    setErrorMessage("");
    setIsGuiHo(false);
    setGuiHoHoTen("");
    setGuiHoSoDienThoai("");
    setGuiHoSoCCCD("");
    setGuiHoDiaChi("");
    setGuiHoQuanHe("");
  };

  // Giao diện khi thành công
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-fadeIn font-sans">
        <div className="bg-gradient-to-r from-qd-green to-qd-light-green p-8 text-center text-white relative border-b-4 border-qd-yellow">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <svg className="w-10 h-10 text-qd-yellow filter drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-wide text-white">Gửi Đơn Thành Công</h3>
          <p className="text-xs text-slate-200 mt-1.5 font-medium tracking-wide">Hệ thống Tiếp công dân trực tuyến Quân khu 2</p>
        </div>

        <div className="p-8 space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Mã số tra cứu của ông/bà</p>
            <div className="inline-block bg-slate-50 border border-slate-200/80 px-8 py-4 rounded-2xl font-mono text-3xl font-black text-qd-red tracking-widest shadow-inner">
              {trackCode}
            </div>
          </div>

          {/* Lịch sử phản ánh gần đây */}
          {history.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-left space-y-4 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span>🕒</span> Lịch sử gửi đơn trên thiết bị này
              </h4>
              <div className="space-y-2.5">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3.5 flex justify-between items-center transition-all hover:border-qd-green hover:shadow-sm">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-800 truncate" title={item.title}>{item.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(item.date).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="inline-block bg-red-50 text-qd-red font-mono font-bold px-2.5 py-1 rounded-lg text-xs border border-red-100/50">
                        {item.code}
                      </span>
                      <a href={`/tra-cuu?code=${item.code}`} target="_blank" className="block mt-1 text-[10px] text-qd-light-green font-bold hover:underline">
                        Theo dõi &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-5 text-left space-y-2.5">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🔔</span> Hướng dẫn lưu trữ & Theo dõi:
            </h4>
            <ul className="text-xs text-amber-800/90 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
              <li>Vui lòng lưu lại mã số tra cứu ở trên để tiến hành tra cứu tiến độ xử lý trực tiếp trên website.</li>
              <li>Thông báo kết quả giải quyết sẽ tự động gửi về số điện thoại ngay khi thủ trưởng đơn vị phê duyệt.</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm border border-slate-200/50 cursor-pointer"
            >
              Tiếp tục gửi phản ánh khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện nhập liệu form
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-qd-green to-qd-light-green p-6 text-center text-white relative border-b-4 border-qd-yellow">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide text-white drop-shadow-sm">
          Cổng Tiếp Công Dân Trực Tuyến
        </h1>
        <p className="text-xs font-bold text-qd-yellow tracking-widest uppercase mt-1">
          Cục Chính Trị - Quân Khu 2
        </p>
      </div>

      {/* Thông tin liên hệ / Đường dây nóng */}
      <div className="bg-slate-50 border-b border-slate-200/60 px-4 py-3.5 flex flex-wrap items-center justify-center gap-4">
        <a
          href="tel:0367515806"
          className="inline-flex items-center gap-2 bg-qd-red hover:bg-red-700 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs transition-all duration-200 shadow-sm hover:scale-[1.03]"
        >
          📞 Hotline: 0367.515.806
        </a>
        <a
          href="https://zalo.me/0367515806"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs transition-all duration-200 shadow-sm hover:scale-[1.03]"
        >
          💬 Zalo: 0367.515.806
        </a>
      </div>

      {/* Thông báo lỗi */}
      {errorMessage && (
        <div className="mx-6 md:mx-8 mt-6 bg-red-50 border border-red-200/60 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-xs font-bold text-red-800 uppercase">Gửi đơn thất bại</p>
            <p className="text-xs text-red-600 mt-0.5 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form chính */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 bg-white">

        {/* Bộ chọn Đối tượng gửi đơn */}
        <section className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 md:p-6 space-y-4">
          <h3 className="text-xs font-black text-qd-green uppercase tracking-wider border-l-4 border-qd-red pl-2.5">
            Đối tượng gửi phản ánh, kiến nghị
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsGuiHo(false)}
              className={`text-left px-5 py-4 rounded-2xl border transition-all duration-300 outline-none cursor-pointer hover:shadow-sm ${!isGuiHo
                ? "border-qd-green bg-emerald-50/40 border-2 ring-4 ring-emerald-100/50 scale-[1.01]"
                : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="text-xs font-bold text-slate-800">
                  Bản thân tôi tự gửi
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                Tôi tự gửi phản ánh, kiến nghị hoặc tự đăng ký lịch tiếp công dân cho bản thân.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsGuiHo(true)}
              className={`text-left px-5 py-4 rounded-2xl border transition-all duration-300 outline-none cursor-pointer hover:shadow-sm ${isGuiHo
                ? "border-qd-green bg-emerald-50/40 border-2 ring-4 ring-emerald-100/50 scale-[1.01]"
                : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <span className="text-xs font-bold text-slate-800">
                  Gửi đơn hộ (Đại diện cho người khác)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                Tôi đại diện hoặc gửi hộ đơn kiến nghị, đăng ký lịch tiếp công dân cho người khác.
              </p>
            </button>
          </div>
        </section>

        {/* Khối Thông tin người gửi đơn hộ */}
        {isGuiHo && (
          <section className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 md:p-6 space-y-5 animate-fadeIn">
            <h3 className="text-xs font-black text-qd-green uppercase tracking-wider border-l-4 border-qd-red pl-2.5">
              1. Thông tin người gửi đơn hộ (Đại diện)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Họ tên người gửi hộ */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Họ và Tên người gửi hộ *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">👤</span>
                  <input
                    type="text"
                    value={guiHoHoTen}
                    onChange={(e) => setGuiHoHoTen(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold"
                    required={isGuiHo}
                  />
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={() => toggleListen("guiHoHoTen")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                      title="Nói để nhập Họ tên"
                    >
                      {listeningField === "guiHoHoTen" ? (
                        <span className="relative flex h-3 w-3 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* SĐT người gửi hộ */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Số điện thoại người gửi hộ *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">📞</span>
                  <input
                    type="tel"
                    value={guiHoSoDienThoai}
                    onChange={(e) => setGuiHoSoDienThoai(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    pattern="[0-9]{10,11}"
                    className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold font-mono"
                    required={isGuiHo}
                  />
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={() => toggleListen("guiHoSoDienThoai")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                      title="Nói để nhập Số điện thoại"
                    >
                      {listeningField === "guiHoSoDienThoai" ? (
                        <span className="relative flex h-3 w-3 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Số thẻ CCCD người gửi hộ */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Số Thẻ CCCD người gửi hộ *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">💳</span>
                  <input
                    type="text"
                    value={guiHoSoCCCD}
                    onChange={(e) => setGuiHoSoCCCD(e.target.value)}
                    placeholder="Ví dụ: 035099001234"
                    pattern="[0-9]{12}"
                    className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold font-mono"
                    required={isGuiHo}
                  />
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={() => toggleListen("guiHoSoCCCD")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                      title="Nói để nhập Số CCCD người gửi hộ"
                    >
                      {listeningField === "guiHoSoCCCD" ? (
                        <span className="relative flex h-3 w-3 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nơi ở hiện tại người gửi hộ */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Nơi ở hiện tại người gửi hộ *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">🏠</span>
                  <input
                    type="text"
                    value={guiHoDiaChi}
                    onChange={(e) => setGuiHoDiaChi(e.target.value)}
                    placeholder="Ví dụ: Số 12 Hùng Vương, Việt Trì, Phú Thọ"
                    className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold"
                    required={isGuiHo}
                  />
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={() => toggleListen("guiHoDiaChi")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                      title="Nói để nhập nơi ở hiện tại"
                    >
                      {listeningField === "guiHoDiaChi" ? (
                        <span className="relative flex h-3 w-3 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Quan hệ với người nhờ gửi */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Quan hệ với người nhờ gửi đơn *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">🤝</span>
                  <input
                    type="text"
                    value={guiHoQuanHe}
                    onChange={(e) => setGuiHoQuanHe(e.target.value)}
                    placeholder="Ví dụ: Con ruột, Vợ, Thân nhân, Đại diện..."
                    className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold"
                    required={isGuiHo}
                  />
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={() => toggleListen("guiHoQuanHe")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                      title="Nói để nhập mối quan hệ"
                    >
                      {listeningField === "guiHoQuanHe" ? (
                        <span className="relative flex h-3 w-3 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Khối 2: Thông tin người phản ánh / người nhờ gửi đơn */}
        <section className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 md:p-6 space-y-5">
          <h3 className="text-xs font-black text-qd-green uppercase tracking-wider border-l-4 border-qd-red pl-2.5">
            {isGuiHo ? "2. Thông tin người nhờ gửi đơn (Quân nhân, thân nhân...)" : "1. Thông tin người gửi phản ánh (Bản thân)"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Họ và tên */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Họ và Tên *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">👤</span>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold"
                  required
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={() => toggleListen("fullname")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                    title="Nói để nhập Họ và Tên"
                  >
                    {listeningField === "fullname" ? (
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Số điện thoại liên lạc *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">📞</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  pattern="[0-9]{10,11}"
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold font-mono"
                  required
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={() => toggleListen("phone")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                    title="Nói để nhập Số điện thoại"
                  >
                    {listeningField === "phone" ? (
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Số thẻ CCCD */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Số Thẻ CCCD *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">💳</span>
                <input
                  type="text"
                  value={soCCCD}
                  onChange={(e) => setSoCCCD(e.target.value)}
                  placeholder="Ví dụ: 035099001234"
                  pattern="[0-9]{12}"
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold font-mono"
                  required
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={() => toggleListen("soCCCD")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                    title="Nói để nhập Số CCCD"
                  >
                    {listeningField === "soCCCD" ? (
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Ngày sinh */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Ngày sinh *</label>
              <div className="relative">
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 px-4 py-3 rounded-xl text-xs transition-all duration-200 outline-none font-semibold"
                  required
                />
              </div>
            </div>

            {/* Tỉnh thành */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Tỉnh / Thành phố *</label>
              <select
                value={selectedProvinceCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProvinceCode(val ? Number(val) : "");
                  const found = provinces.find((p) => p.code === Number(val));
                  setSelectedProvinceName(found ? found.name : "");
                  if (!val) {
                    setWards([]);
                    setSelectedWardCode("");
                    setSelectedWardName("");
                  }
                }}
                className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 px-4 py-3.5 rounded-xl text-xs transition-all duration-200 outline-none font-semibold"
                required
              >
                <option value="">-- Chọn Tỉnh --</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>{province.name}</option>
                ))}
              </select>
            </div>

            {/* Xã phường */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Xã / Phường *</label>
              <select
                value={selectedWardCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedWardCode(val ? Number(val) : "");
                  const found = wards.find((w) => w.code === Number(val));
                  setSelectedWardName(found ? found.name : "");
                }}
                className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 px-4 py-3.5 rounded-xl text-xs transition-all duration-200 outline-none font-semibold disabled:opacity-50"
                disabled={selectedProvinceCode === ""}
                required
              >
                <option value="">-- Chọn Xã --</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>{ward.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Khối 2: Thông tin quân ngũ */}
        <section className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 md:p-6 space-y-5">
          <h3 className="text-xs font-black text-qd-green uppercase tracking-wider border-l-4 border-qd-red pl-2.5">
            2. Thông tin quân ngũ quân nhân <span className="text-slate-400 font-normal lowercase"> (nếu có)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Ngày nhập ngũ */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Ngày nhập ngũ</label>
              <input
                type="date"
                value={enlistmentDate}
                onChange={(e) => setEnlistmentDate(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 px-4 py-3 rounded-xl text-xs transition-all duration-200 outline-none font-semibold"
              />
            </div>

            {/* Số hiệu sĩ quan */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Số hiệu sĩ quan</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">🪖</span>
                <input
                  type="text"
                  value={soHieuSiQuan}
                  onChange={(e) => setSoHieuSiQuan(e.target.value)}
                  placeholder="Ví dụ: 123456"
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold font-mono"
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={() => toggleListen("soHieuSiQuan")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                    title="Nói để nhập Số hiệu sĩ quan"
                  >
                    {listeningField === "soHieuSiQuan" ? (
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Đơn vị công tác */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Đơn vị từng công tác / học tập</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">🎖️</span>
                <input
                  type="text"
                  value={pastUnit}
                  onChange={(e) => setPastUnit(e.target.value)}
                  placeholder="Ví dụ: Sư đoàn 308, Quân khu 2..."
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold"
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={() => toggleListen("pastUnit")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                    title="Nói để nhập Đơn vị công tác"
                  >
                    {listeningField === "pastUnit" ? (
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Khối 3: Phân loại & Nội dung phản ánh */}
        <section className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 md:p-6 space-y-6">
          <h3 className="text-xs font-black text-qd-green uppercase tracking-wider border-l-4 border-qd-red pl-2.5">
            3. Phân loại & Nội dung kiến nghị
          </h3>

          {/* Phân loại */}
          <div className="space-y-2.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Phân loại yêu cầu giải quyết *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {LOAI_YEU_CAU_OPTIONS.map((opt) => {
                const isActive = loaiYeuCau === opt.value;
                const activeClasses =
                  opt.color === "emerald" ? "border-emerald-500 bg-emerald-50/70 ring-emerald-100" :
                    opt.color === "amber" ? "border-amber-500 bg-amber-50/70 ring-amber-100" :
                      opt.color === "blue" ? "border-blue-500 bg-blue-50/70 ring-blue-100" :
                        opt.color === "red" ? "border-red-500 bg-red-50/70 ring-red-100" :
                          "border-purple-500 bg-purple-50/70 ring-purple-100";

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLoaiYeuCau(opt.value as typeof loaiYeuCau)}
                    className={`text-left px-4 py-3.5 rounded-2xl border transition-all duration-300 outline-none cursor-pointer hover:shadow-sm ${isActive
                      ? `${activeClasses} border-2 ring-4 scale-[1.01]`
                      : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{opt.icon}</span>
                      <span className={`text-xs font-black ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1.5 block leading-relaxed font-semibold">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Tiêu đề đơn / Nội dung tóm tắt *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">📝</span>
              <input
                type="text"
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                placeholder="Ghi dòng tóm tắt ngắn gọn đơn phản ánh của ông/bà..."
                className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 pl-9 pr-10 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 font-semibold"
                required
              />
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={() => toggleListen("tieuDe")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none cursor-pointer"
                  title="Nói để nhập Tiêu đề"
                >
                  {listeningField === "tieuDe" ? (
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                  ) : (
                    <span className="text-slate-400 hover:text-qd-green text-sm transition-colors duration-200">🎤</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Chi tiết */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Nội dung chi tiết kiến nghị *</label>
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={() => toggleListen("content")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all duration-300 cursor-pointer ${listeningField === "content"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                    }`}
                >
                  {listeningField === "content" ? (
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
                      <span>Nói để nhập liệu</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                loaiYeuCau === "dat_lich_hen"
                  ? "Ghi rõ nội dung cần trao đổi trực tiếp, lý do đăng ký lịch gặp chỉ huy đơn vị..."
                  : "Ghi rõ tâm tư, nguyện vọng, phản ánh chi tiết và gửi các thắc mắc kèm theo..."
              }
              className="w-full bg-white text-slate-900 border border-slate-200 focus:border-qd-green focus:ring-4 focus:ring-qd-green/10 px-4 py-3 rounded-xl text-xs transition-all duration-200 outline-none placeholder:text-slate-400 resize-none leading-relaxed font-medium"
              required
            ></textarea>
          </div>

          {/* Tài liệu đính kèm */}
          <div className="space-y-2.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
              📎 Tài liệu / Bằng chứng / Giấy tờ đính kèm <span className="text-slate-400 font-normal lowercase">(không bắt buộc)</span>
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${isDragging
                ? "border-qd-green bg-emerald-50/70 scale-[1.01]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-500">
                📥
              </div>
              <p className="text-xs font-bold text-slate-700">
                Kéo thả tệp tin vào đây hoặc <span className="text-qd-green underline">chọn từ máy tính</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                PDF, DOCX, hình ảnh PNG/JPG, video MP4 — Tối đa 5 tệp, dung lượng mỗi tệp ≤ 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4"
              onChange={handleFileSelect}
              className="hidden"
            />

            {fileError && (
              <p className="text-xs text-red-600 mt-2 font-bold flex items-center gap-1">
                <span>⚠️</span> {fileError}
              </p>
            )}

            {/* View uploaded files */}
            {attachedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {attachedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between bg-white border border-slate-150 rounded-xl p-3 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">{getFileIcon(file.type)}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-700 truncate text-[11px]">{file.name}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5 transition-colors flex-shrink-0 cursor-pointer"
                      title="Xóa tệp"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Khối 4: Đặt lịch hẹn */}
        {loaiYeuCau === "dat_lich_hen" && (
          <section className="bg-purple-50/40 border border-purple-200/60 rounded-2xl p-5 md:p-6 space-y-5 animate-fadeIn">
            <h3 className="text-xs font-black text-purple-700 uppercase tracking-wider border-l-4 border-purple-500 pl-2.5">
              📅 4. Đăng ký thông tin lịch tiếp công dân
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Ngày hẹn */}
              <div>
                <label className="block text-[10px] font-black text-purple-600 uppercase tracking-wider mb-2">Ngày hẹn mong muốn *</label>
                <input
                  type="date"
                  value={ngayHen}
                  onChange={(e) => setNgayHen(e.target.value)}
                  min={getMinDate()}
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 px-4 py-3 rounded-xl text-xs transition-all duration-200 outline-none font-semibold"
                  required
                />
              </div>

              {/* Giờ hẹn */}
              <div>
                <label className="block text-[10px] font-black text-purple-600 uppercase tracking-wider mb-2">Khung giờ mong muốn *</label>
                <select
                  value={gioHen}
                  onChange={(e) => setGioHen(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 px-4 py-3.5 rounded-xl text-xs transition-all duration-200 outline-none font-semibold"
                  required
                >
                  <option value="">-- Chọn khung giờ --</option>
                  {GIO_HEN_OPTIONS.map((gio) => (
                    <option key={gio} value={gio}>{gio}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hình thức tiếp */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-purple-600 uppercase tracking-wider">Hình thức tiếp kiến *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setHinhThucTiep("truc_tiep")}
                  className={`flex items-center gap-3.5 px-4.5 py-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${hinhThucTiep === "truc_tiep"
                    ? "border-purple-500 bg-white shadow-sm border-2 ring-4 ring-purple-100 scale-[1.01]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                >
                  <span className="text-xl">🏢</span>
                  <div>
                    <span className={`text-xs font-black block ${hinhThucTiep === "truc_tiep" ? "text-purple-700" : "text-slate-700"}`}>
                      Tiếp trực tiếp
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Tại văn phòng tiếp công dân Quân khu 2</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setHinhThucTiep("truc_tuyen")}
                  className={`flex items-center gap-3.5 px-4.5 py-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${hinhThucTiep === "truc_tuyen"
                    ? "border-purple-500 bg-white shadow-sm border-2 ring-4 ring-purple-100 scale-[1.01]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                >
                  <span className="text-xl">💻</span>
                  <div>
                    <span className={`text-xs font-black block ${hinhThucTiep === "truc_tuyen" ? "text-purple-700" : "text-slate-700"}`}>
                      Tiếp trực tuyến
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Qua cuộc gọi video call bảo mật mật bộ</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Thông tin thêm */}
            <div className="bg-white border border-purple-100 rounded-xl p-4 flex items-start gap-3">
              <span className="text-base">ℹ️</span>
              <div className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                <p className="text-slate-800 font-black mb-1">Lịch tiếp công dân của cơ quan:</p>
                <p>• Thứ Ba & Thứ Năm hàng tuần</p>
                <p>• Sáng: 08:00 – 11:30 | Chiều: 13:30 – 17:00</p>
                <p className="mt-1 text-purple-700">Lịch tiếp dân chính thức sẽ được gửi báo xác nhận sau khi cán bộ duyệt đơn.</p>
              </div>
            </div>
          </section>
        )}

        {/* Cam kết cam đoan */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group text-slate-700 select-none">
            <input
              type="checkbox"
              checked={commitChecked}
              onChange={(e) => setCommitChecked(e.target.checked)}
              className="mt-1 accent-qd-green w-4.5 h-4.5 rounded cursor-pointer"
            />
            <span className="text-[11px] leading-relaxed font-medium group-hover:text-slate-900 transition-colors">
              Tôi xin cam đoan các thông tin khai báo và tài liệu gửi kèm ở trên là hoàn toàn đúng sự thật và tự chịu mọi trách nhiệm trước pháp luật về nội dung phản ánh của mình.
            </span>
          </label>
        </div>

        {/* Nút gửi dữ liệu */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Các trường có dấu (*) là bắt buộc
          </p>
          <button
            type="submit"
            disabled={isLoading || !commitChecked}
            className="w-full sm:w-auto bg-gradient-to-r from-qd-green to-qd-light-green hover:shadow-lg disabled:from-slate-350 disabled:to-slate-400 disabled:shadow-none text-white font-extrabold px-10 py-4 rounded-xl transition-all duration-300 shadow-md shadow-qd-green/10 flex items-center justify-center gap-2 text-xs uppercase tracking-wider ml-auto cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý hồ sơ...
              </>
            ) : (
              "Gửi Yêu Cầu Chính Thức"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}