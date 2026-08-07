"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { fetchVanBanPhapQuy, VanBanPhapQuyEntry, STRAPI_URL, fetchTinNoiBat } from "./lib/api";

// FAQ Data
const FAQ_ITEMS = [
  {
    question: "Cổng Tiếp công dân trực tuyến hoạt động vào thời gian nào?",
    answer: "Hệ thống tiếp nhận phản ánh trực tuyến hoạt động 24/7. Cán bộ chuyên trách sẽ kiểm tra, phân loại và phản hồi kết quả trong giờ hành chính từ thứ Hai đến thứ Sáu hàng tuần."
  },
  {
    question: "Thông tin phản ánh, khiếu nại của tôi có được bảo mật không?",
    answer: "Thông tin cá nhân, nội dung phản ánh và tài liệu đính kèm của công dân được mã hóa bảo mật cấp độ cao nhất trên hệ thống máy chủ quân sự, cam kết bảo vệ danh tính công dân theo quy định pháp luật."
  },
  {
    question: "Tôi làm thế nào để tham gia phòng họp trực tuyến với cán bộ?",
    answer: "Khi cán bộ duyệt hồ sơ và thiết lập hình thức làm việc trực tuyến, một đường link phòng họp Jitsi/Zoom sẽ được tích hợp trực tiếp vào đơn của bạn. Bạn chỉ cần vào trang 'Tra cứu', nhập mã đơn của mình và nhấn nút 'Vào Phòng Hỏi Đáp'."
  },
  {
    question: "Thời gian giải quyết phản ánh kiến nghị thông thường là bao lâu?",
    answer: "Theo quy định hành chính và Thông tư của Bộ Quốc phòng, thời gian thẩm định và trả lời kiến nghị từ 15 đến 30 ngày làm việc. Đối với các vụ việc phức tạp, thời hạn có thể kéo dài nhưng không quá 45 ngày."
  }
];

// Carousel News Data
const NEWS_ITEMS = [
  {
    image: "/vietnam-flag.png",
    title: "Nâng cao chất lượng, hiệu quả công tác tiếp công dân trực tuyến",
    date: "02/07/2026",
    desc: "Đẩy mạnh ứng dụng công nghệ thông tin và chuyển đổi số phục vụ nhân dân gửi phản ánh kiến nghị nhanh chóng, thuận tiện và tuyệt đối bảo mật."
  },
  {
    image: "/party-flag.png",
    title: "Tổ chức tập huấn nghiệp vụ công tác tiếp dân và giải quyết phản ánh",
    date: "25/06/2026",
    desc: "Bồi dưỡng chuyên môn nghiệp vụ cho cán bộ thanh tra pháp chế, chuẩn hóa quy trình phân loại và giải quyết ý kiến phản ánh theo quy định pháp luật."
  },
  {
    image: "/flags-combined.png",
    title: "Công khai, minh bạch quy trình xử lý đơn thư hành chính",
    date: "18/06/2026",
    desc: "Mọi đơn thư phản ánh của công dân đều được theo dõi chặt chẽ tiến độ giải quyết trực tuyến, bảo đảm quyền lợi hợp pháp của công dân."
  }
];

// Leader reception schedule
const RECEPTION_SCHEDULE = [
  { date: "", room: "" },
  { date: "", room: "" },
  { date: "", room: "" },
  { date: "", room: "" }
];

// Emblem marquee logos
const EXTERNAL_LINKS = [
  { name: "CỔNG DỊCH VỤ CÔNG QUỐC GIA", url: "https://dichvucong.gov.vn", logoText: "DVC" },
  { name: "CỔNG THÔNG TIN BỘ QUỐC PHÒNG", url: "https://www.bqp.vn", logoText: "BQP" },
  { name: "CỔNG THÔNG TIN CHÍNH PHỦ", url: "https://chinhphu.vn", logoText: "CP" },
  { name: "BÁO QUÂN ĐỘI NHÂN DÂN", url: "https://qdnd.vn", logoText: "QĐND" },
  { name: "THANH TRA CHÍNH PHỦ", url: "https://thanhtra.gov.vn", logoText: "TTCP" }
];

export default function HomeClient() {
  const [searchCode, setSearchCode] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"phap_ly" | "huong_dan">("phap_ly");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const [vanBanList, setVanBanList] = useState<VanBanPhapQuyEntry[]>([]);
  const [isVanBanLoading, setIsVanBanLoading] = useState(true);
  const [news, setNews] = useState<any[]>(NEWS_ITEMS);

  // Load Date local
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDateStr(new Date().toLocaleDateString('vi-VN', options));
  }, []);

  // Load tin tức nổi bật từ backend
  useEffect(() => {
    async function loadNews() {
      try {
        const data = await fetchTinNoiBat();
        if (data && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item.documentId,
            image: item.hinhAnh ? `${STRAPI_URL}${item.hinhAnh.url}` : "/vietnam-flag.png",
            title: item.tieuDe,
            date: item.ngayDang || new Date(item.createdAt).toLocaleDateString("vi-VN"),
            desc: item.moTa
          }));
          setNews(mapped);
        } else {
          setNews(NEWS_ITEMS);
        }
      } catch (err) {
        console.error("Lỗi khi tải tin nổi bật, dùng tin mặc định:", err);
        setNews(NEWS_ITEMS);
      }
    }
    loadNews();
  }, []);

  // Load văn bản pháp quy từ backend
  useEffect(() => {
    async function loadVanBan() {
      try {
        const data = await fetchVanBanPhapQuy();
        setVanBanList(data);
      } catch (err) {
        console.error("Lỗi khi tải văn bản pháp quy:", err);
      } finally {
        setIsVanBanLoading(false);
      }
    }
    loadVanBan();
  }, []);

  // Slide Auto loop
  useEffect(() => {
    if (news.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [news]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      router.push(`/tra-cuu?code=${searchCode.trim().toUpperCase()}`);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-[#f1f3f2] font-sans text-slate-900 selection:bg-qd-green selection:text-white">

      {/* ===== TẦNG 1: HEADER QUỐC GIA (RED TOP BAR) ===== */}
      <div className="bg-[#b91c1c] text-white text-[11px] py-2 border-b border-yellow-500/30">
        <div className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-bold">
          <div className="flex items-center gap-2">
            <span>🇻🇳</span>
            <span className="uppercase tracking-wide">CỔNG TIẾP CÔNG DÂN ĐIỆN TỬ - QUÂN KHU 2</span>
            {currentDateStr && (
              <>
                <span className="hidden md:inline text-white/50">|</span>
                <span className="hidden md:inline font-normal text-slate-100">{currentDateStr}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors uppercase">
              Cổng DVC Quốc gia
            </a>
            <span className="text-white/30">|</span>
            <a href="https://bqp.vn" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors uppercase">
              Bộ Quốc phòng
            </a>
          </div>
        </div>
      </div>

      {/* ===== TẦNG 2: BANNER CHÍNH QUY BAN THƯ THƯ TƯ LỆNH ===== */}
      <header className="bg-gradient-to-r from-qd-green to-[#132c16] border-b-4 border-qd-yellow relative py-5 shadow-lg z-50">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            {/* Logo emblem */}
            <div className="relative w-16 h-16 flex-shrink-0 rounded-full border-2 border-qd-yellow shadow-xl hover:scale-105 transition-transform duration-300 overflow-hidden bg-[#0e3b1e]">
              <Image
                src="/logo-qk2.jpg"
                alt="Quân huy Quân khu 2"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="flex flex-col">
                <span className="text-lg md:text-xl font-bold uppercase tracking-wider text-qd-yellow leading-tight">
                  CỔNG THÔNG TIN ĐIỆN TỬ
                </span>
                <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider mt-1.5 leading-tight">
                  PHÒNG TIẾP CÔNG DÂN TRỰC TUYẾN - QUÂN KHU 2
                </span>
              </h1>
            </div>
          </div>

          {/* Header Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/ho-tro"
              className="bg-white/10 hover:bg-qd-yellow hover:text-qd-green text-white font-extrabold px-4 py-2 rounded-xl text-[10px] tracking-wider uppercase transition-all duration-300 border border-white/15 hover:border-qd-yellow hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            >
              Gửi phản ánh
            </Link>
            <Link
              href="/tra-cuu"
              className="bg-white/10 hover:bg-qd-yellow hover:text-qd-green text-white font-extrabold px-4 py-2 rounded-xl text-[10px] tracking-wider uppercase transition-all duration-300 border border-white/15 hover:border-qd-yellow hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            >
              Tra cứu tiến độ
            </Link>
            <NotificationBell />
            <a
              href="tel:0367515806"
              className="inline-flex items-center justify-center bg-qd-red hover:bg-red-700 text-white font-black px-4 py-2 rounded-xl text-[10px] tracking-wider uppercase transition-all duration-300 shadow-md hover:scale-105 active:scale-95 border border-red-600/30 cursor-pointer"
            >
              Hotline: 0367.515.806
            </a>
          </div>
        </div>
      </header>

      {/* ===== TẦNG 3: MENU ĐIỀU HƯỚNG CHÍNH (MAIN NAVBAR) ===== */}
      <nav aria-label="Menu điều hướng chính" className="bg-[#1b4329] border-b border-qd-yellow/20 text-white shadow-md relative z-40">
        <div className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header Bar */}
          <div className="flex md:hidden items-center justify-between py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-qd-yellow">Danh mục điều hướng</span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-qd-yellow p-1.5 focus:outline-none focus:ring-1 focus:ring-qd-yellow/50 rounded-lg transition-colors cursor-pointer"
              aria-label="Mở menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navbar Menu (Hidden on mobile) */}
          <ul className="hidden md:flex flex-wrap items-center gap-1 text-[11px] font-black uppercase tracking-wider py-1">
            <li>
              <Link href="/" className="px-4 py-2.5 hover:bg-[#235836] transition-colors rounded-lg flex items-center gap-1.5 text-qd-yellow">
                🏠 TRANG CHỦ
              </Link>
            </li>
            <li>
              <Link href="/ho-tro" className="px-4 py-2.5 hover:bg-[#235836] transition-colors rounded-lg">
                Gửi đơn trực tuyến
              </Link>
            </li>
            <li>
              <Link href="/tra-cuu" className="px-4 py-2.5 hover:bg-[#235836] transition-colors rounded-lg">
                Theo dõi & Tra cứu kết quả
              </Link>
            </li>
            <li>
              <Link href="#lich-tiep-dan" className="px-4 py-2.5 hover:bg-[#235836] transition-colors rounded-lg">
                Lịch tiếp công dân định kỳ
              </Link>
            </li>
            <li>
              <Link href="#van-ban" className="px-4 py-2.5 hover:bg-[#235836] transition-colors rounded-lg">
                Văn bản pháp quy
              </Link>
            </li>
          </ul>

          {/* Mobile Collapsible Menu (Visible on mobile when open) */}
          {isMobileMenuOpen && (
            <ul className="flex flex-col md:hidden text-[11px] font-black uppercase tracking-wider pb-3 pt-1 border-t border-qd-yellow/10 space-y-1">
              <li>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 hover:bg-[#235836] transition-colors rounded-lg text-qd-yellow"
                >
                  🏠 TRANG CHỦ
                </Link>
              </li>
              <li>
                <Link
                  href="/ho-tro"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 hover:bg-[#235836] transition-colors rounded-lg"
                >
                  Gửi đơn trực tuyến
                </Link>
              </li>
              <li>
                <Link
                  href="/tra-cuu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 hover:bg-[#235836] transition-colors rounded-lg"
                >
                  Theo dõi & Tra cứu kết quả
                </Link>
              </li>
              <li>
                <Link
                  href="#lich-tiep-dan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 hover:bg-[#235836] transition-colors rounded-lg"
                >
                  Lịch tiếp công dân định kỳ
                </Link>
              </li>
              <li>
                <Link
                  href="#van-ban"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 hover:bg-[#235836] transition-colors rounded-lg"
                >
                  Văn bản pháp quy
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>

      {/* ===== HERO CONTENT SECTION ===== */}
      <section aria-label="Tin tức và Lịch tiếp công dân" className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Cột trái (7/12): Carousel Tin Tức Hoạt Động */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase text-qd-green tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-qd-green rounded-full"></span>
                  Tin nổi bật tiếp công dân
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Trang {activeSlide + 1} / {news.length}</span>
              </div>

              {/* Slide Display */}
              <div className="space-y-4 animate-fadeIn">
                <div className="relative h-[260px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                  <img
                    src={news[activeSlide]?.image || "/vietnam-flag.png"}
                    alt={news[activeSlide]?.title || "Tin tức"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 text-white">
                    <span className="bg-qd-yellow text-qd-green text-[9px] font-bold px-2 py-0.5 rounded mr-2.5">
                      {news[activeSlide]?.date}
                    </span>
                    <h4 className="text-sm font-bold mt-2 leading-snug">
                      {news[activeSlide]?.title}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {news[activeSlide]?.desc}
                </p>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {news.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${activeSlide === i ? "w-6 bg-qd-green" : "w-2 bg-slate-300"}`}
                  title={`Slide ${i + 1}`}
                ></button>
              ))}
            </div>
          </div>

          {/* Cột phải (5/12): Lịch tiếp công dân của Thủ trưởng (Bản sắc chuẩn BQP) */}
          <div id="lich-tiep-dan" className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase text-qd-green tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-qd-yellow rounded-full"></span>
                  Lịch tiếp dân định kỳ của Thủ trưởng
                </h3>
              </div>

              {/* Table Reception Schedule */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-inner">
                <table className="w-full text-left border-collapse text-[11px] font-semibold text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-100">
                      <th className="p-3 text-center">Nội dung tiếp</th>
                      <th className="p-3 text-center">Ngày tiếp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {RECEPTION_SCHEDULE.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-center text-slate-500 text-[10px]">
                          {item.room}
                        </td>
                        <td className="p-3 text-center font-bold text-qd-red whitespace-nowrap">
                          {item.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mt-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã để tra cứu nhanh..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="flex-grow bg-white text-slate-900 border border-slate-200 focus:border-qd-green px-3.5 py-2 rounded-xl text-xs outline-none font-bold uppercase placeholder:normal-case placeholder:font-sans"
                />
                <button type="submit" className="bg-[#1b4329] hover:bg-qd-green text-white font-extrabold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 shadow cursor-pointer">
                  Tra cứu
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* ===== 4 CORE ACTIONS (FLAT DVC TIẾP DÂN STYLE) ===== */}
      <section className="bg-white border-y border-slate-200/50 py-10 shadow-sm">
        <div className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-8">
            <span className="text-[10px] font-black text-qd-green uppercase tracking-widest">CỔNG DỊCH VỤ HÀNH CHÍNH</span>
            <h2 className="text-lg md:text-xl font-black text-qd-green uppercase tracking-wide mt-1.5">
              Dịch Vụ Tiếp Công Dân Trực Tuyến
            </h2>
            <div className="w-12 h-1 bg-qd-yellow mx-auto mt-2.5 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            {/* Action 1 */}
            <Link
              href="/ho-tro"
              className="bg-[#f8faf9] hover:bg-qd-green hover:text-white border border-slate-200/60 p-5 rounded-2xl text-center shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300 mb-3">📋</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-white">Gửi đơn phản ánh</h3>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-100 font-medium mt-1 leading-snug max-w-[200px]">
                Nộp ý kiến kiến nghị, phản ánh, khiếu nại hoặc tố cáo
              </p>
            </Link>

            {/* Action 2 */}
            <Link
              href="/ho-tro"
              className="bg-[#f8faf9] hover:bg-qd-green hover:text-white border border-slate-200/60 p-5 rounded-2xl text-center shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300 mb-3">📅</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-white">Đăng ký tiếp dân</h3>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-100 font-medium mt-1 leading-snug max-w-[200px]">
                Đặt lịch hẹn gặp trực tiếp lãnh đạo định kỳ hàng tháng
              </p>
            </Link>

            {/* Action 3 */}
            <Link
              href="/tra-cuu"
              className="bg-[#f8faf9] hover:bg-qd-green hover:text-white border border-slate-200/60 p-5 rounded-2xl text-center shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300 mb-3">🔍</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-white">Tra cứu hồ sơ</h3>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-100 font-medium mt-1 leading-snug max-w-[200px]">
                Kiểm tra kết quả và tiến trình giải quyết của cơ quan
              </p>
            </Link>

            {/* Action 4 */}
            <Link
              href="/tra-cuu"
              className="bg-[#f8faf9] hover:bg-qd-green hover:text-white border border-slate-200/60 p-5 rounded-2xl text-center shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300 mb-3">💬</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-white">Họp trực tuyến</h3>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-100 font-medium mt-1 leading-snug max-w-[200px]">
                Tham gia phòng họp trực tuyến Jitsi với cán bộ tiếp dân
              </p>
            </Link>

          </div>
        </div>
      </section>

      {/* ===== 3-STEP FLOW CHART (TIMELINE) ===== */}
      <section className="py-12 bg-[#f1f3f2]">
        <div className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-8">
            <span className="text-[10px] font-black text-qd-green uppercase tracking-widest">MÔ HÌNH HƯỚNG DẪN</span>
            <h2 className="text-lg md:text-xl font-black text-qd-green uppercase tracking-wide mt-1.5">
              Quy trình giải quyết phản ánh trực tuyến
            </h2>
            <div className="w-12 h-1 bg-qd-yellow mx-auto mt-2.5 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm relative group hover:border-qd-green/20">
              <span className="absolute top-4 right-4 text-2xl font-black text-slate-100 group-hover:text-qd-green/10 select-none" aria-hidden="true">01</span>
              <span className="text-2xl" aria-hidden="true">📝</span>
              <h3 className="text-xs font-bold text-slate-800 uppercase mt-4">1. Khai báo & nộp đơn</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-2 leading-relaxed">
                Công dân nhập thông tin cá nhân và nội dung phản ánh qua Cổng trực tuyến. Đính kèm tài liệu, hình ảnh bằng chứng hỗ trợ.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm relative group hover:border-qd-green/20">
              <span className="absolute top-4 right-4 text-2xl font-black text-slate-100 group-hover:text-qd-green/10 select-none" aria-hidden="true">02</span>
              <span className="text-2xl" aria-hidden="true">⚡</span>
              <h3 className="text-xs font-bold text-slate-800 uppercase mt-4">2. Tiếp nhận & xử lý</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-2 leading-relaxed">
                Thanh tra Quân khu tiếp nhận đơn, phân loại nội dung, trình chỉ huy duyệt và chuyển các phòng chuyên môn trả lời.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm relative group hover:border-qd-green/20">
              <span className="absolute top-4 right-4 text-2xl font-black text-slate-100 group-hover:text-qd-green/10 select-none" aria-hidden="true">03</span>
              <span className="text-2xl" aria-hidden="true">🤝</span>
              <h3 className="text-xs font-bold text-slate-800 uppercase mt-4">3. Phản hồi công dân</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-2 leading-relaxed">
                Trả lời kết quả bằng văn bản chính thức trên Cổng hoặc sắp xếp phòng họp trực tuyến Jitsi để làm việc đối thoại trực tiếp.
              </p>
            </div>
          </div>

          {/* Lưu ý hành chính khi đến trực tiếp */}
          <div className="bg-amber-50 border-l-4 border-qd-yellow p-4.5 rounded-2xl text-[11px] text-amber-900 leading-relaxed font-semibold mt-8 max-w-4xl mx-auto shadow-sm">
            🛡️ <strong>LƯU Ý KHI ĐẾN LÀM VIỆC TRỰC TIẾP:</strong> Công dân vui lòng mang theo thẻ Căn cước công dân gắn chip hoặc hộ chiếu bản gốc, cùng toàn bộ hồ sơ chứng cứ chứng minh liên quan. Xuất trình tại Cổng gác kiểm soát số 1 để được cán bộ hướng dẫn vào Trụ sở tiếp công dân.
          </div>

        </div>
      </section>

      {/* ===== SPLIT SECTION: LAWS & ACCORDION FAQ (TABS TƯƠNG TÁC) ===== */}
      <section id="van-ban" className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-3xl border border-slate-200/60 shadow-sm mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[10px] font-black text-qd-green uppercase tracking-widest">HỆ THỐNG VĂN BẢN QUÂN SỰ</span>
              <h2 className="text-lg md:text-xl font-black text-qd-green uppercase tracking-wide mt-1.5">
                Văn Bản Pháp Quy & Hướng Dẫn
              </h2>
              <div className="w-12 h-1 bg-qd-yellow mt-2.5 rounded-full"></div>
            </div>

            {/* Tabs selector */}
            <div className="flex border-b border-slate-100 gap-1.5 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("phap_ly")}
                className={`px-4 py-2 border-b-2 transition-all outline-none cursor-pointer ${activeTab === "phap_ly"
                  ? "border-qd-green text-qd-green font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                Văn bản pháp luật
              </button>
              <button
                onClick={() => setActiveTab("huong_dan")}
                className={`px-4 py-2 border-b-2 transition-all outline-none cursor-pointer ${activeTab === "huong_dan"
                  ? "border-qd-green text-qd-green font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                Hướng dẫn nghiệp vụ
              </button>
            </div>

            {/* Tab content display */}
            <div className="space-y-4">
              {isVanBanLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-2 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                (() => {
                  const filteredList = vanBanList.filter(item => item.loaiVanBan === activeTab);

                  if (filteredList.length === 0) {
                    return (
                      <div className="text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                        📭 Chưa có văn bản nào được đăng tải trong mục này.
                      </div>
                    );
                  }

                  return filteredList.map((item) => {
                    const fileUrl = item.tepVanBan ? `${STRAPI_URL}${item.tepVanBan.url}` : "#";
                    const isLegal = item.loaiVanBan === "phap_ly";
                    const borderCol = isLegal ? "border-qd-green" : "border-amber-600";
                    const badgeBg = isLegal ? "bg-emerald-50 text-qd-green border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100";
                    const badgeText = item.hieuLuc || "Còn hiệu lực";

                    return (
                      <article key={item.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow duration-300">
                        <div className={`border-l-4 ${borderCol} pl-3 space-y-2`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
                              {badgeText.toUpperCase()}
                            </span>
                            {item.ngayBanHanh && (
                              <span className="text-[9px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                                📅 {new Date(item.ngayBanHanh).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs font-bold text-slate-800 leading-snug">
                            {item.tieuDe}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            {item.trichYeu}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>📥 Định dạng: {item.tepVanBan?.ext?.toUpperCase()?.replace('.', '') || 'PDF'} ({((item.tepVanBan?.size || 0) / 1024).toFixed(1)} MB)</span>
                          {item.tepVanBan ? (
                            <a
                              href={fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`font-bold hover:underline ${isLegal ? 'text-qd-green' : 'text-amber-600'}`}
                            >
                              Tải văn bản gốc →
                            </a>
                          ) : (
                            <span className="text-slate-300">Không có file đính kèm</span>
                          )}
                        </div>
                      </article>
                    );
                  });
                })()
              )}
            </div>
          </div>

          {/* Bên phải (5/12): Accordion FAQ */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] font-black text-qd-green uppercase tracking-widest">HỖ TRỢ GIẢI ĐÁP</span>
              <h2 className="text-lg md:text-xl font-black text-qd-green uppercase tracking-wide mt-1.5">
                Các Câu Hỏi Thường Gặp
              </h2>
              <div className="w-12 h-1 bg-qd-yellow mt-2.5 rounded-full"></div>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => {
                const isFaqOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors flex justify-between items-center outline-none cursor-pointer"
                    >
                      <h3 className="text-xs font-bold text-slate-800 leading-snug">
                        {item.question}
                      </h3>
                      <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isFaqOpen ? "rotate-180" : ""}`}>
                        ▼
                      </span>
                    </button>
                    {isFaqOpen && (
                      <div className="px-4 py-3.5 bg-white border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed font-semibold animate-fadeIn">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>



      {/* ===== TỔ HỢP LOGO BANNER CÁC LIÊN KẾT LIÊN THÔNG (GOV BANNER MARQUEE) ===== */}
      <section className="bg-white py-6 border-t border-slate-200/50 shadow-inner">
        <div className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-5 opacity-70 hover:opacity-90 transition-opacity duration-300">
            {EXTERNAL_LINKS.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 hover:text-[#1b4329] transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs border border-slate-200 text-slate-600">
                  {link.logoText}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER CHÍNH QUY (GOVERNMENT STANDARD FOOTER) ===== */}
      <footer className="bg-[#0b1a0e] text-slate-400 border-t-4 border-qd-yellow py-12 font-sans relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>



        {/* Bản quyền */}
        <div className="max-w-7xl 2xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <span>Bảo mật hệ thống máy chủ Quân khu 2.</span>
        </div>
      </footer>

    </main>
  );
}
