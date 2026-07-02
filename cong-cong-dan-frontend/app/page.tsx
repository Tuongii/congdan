import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cổng Tiếp Công Dân Trực Tuyến — Bộ Quốc Phòng",
  description:
    "Hệ thống tiếp công dân trực tuyến của cơ quan quân sự, Bộ Quốc Phòng. Tra cứu văn bản chính sách quốc phòng, quyền lợi quân nhân, chế độ chính sách hậu phương quân đội.",
  keywords:
    "tiếp công dân, quân đội, bộ quốc phòng, chính sách quốc phòng, quân nhân, chế độ chính sách",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ===== HERO SECTION ===== */}
      <header className="relative bg-qd-green overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 relative">
          {/* Cờ + Tiêu đề */}
          <div className="flex flex-col items-center justify-center text-center text-white">
            <div className="space-y-1">
              <h1 className="text-xl md:text-3xl font-extrabold uppercase tracking-wide drop-shadow-md">
                Phòng Tiếp công dân trực tuyến - Quân khu 2
              </h1>
              <p className="text-xs md:text-sm font-semibold text-qd-yellow tracking-wider uppercase mt-0.5">
                Cơ Quan Quân Sự — Bộ Quốc Phòng
              </p>
              <p className="text-[11px] md:text-xs text-slate-300 max-w-xl leading-relaxed mt-1 mx-auto">
                Hệ thống tiếp nhận, xử lý kiến nghị, phản ánh và đặt lịch hẹn trực tuyến
                của công dân đối với cơ quan quân sự các cấp.
              </p>

              {/* Hàng nút bấm */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Link
                  href="/ho-tro"
                  className="inline-flex items-center gap-2 bg-qd-yellow hover:bg-yellow-500 text-qd-green font-extrabold px-5 py-2 rounded-xl text-xs transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Gửi Yêu Cầu Hỗ Trợ
                </Link>
                <Link
                  href="/tra-cuu"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tra Cứu Kết Quả
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dải vàng phân cách */}
        <div className="h-1.5 bg-qd-yellow"></div>
      </header>

      {/* ===== BANNER QUÂN ĐỘI ===== */}
      <section className="relative h-52 md:h-62 lg:h-[400px] overflow-hidden">
        <Image
          src="/img0631-17567967413481704453104.jpg"
          alt="Quân đội nhân dân Việt Nam — Lễ duyệt binh"
          fill
          className="object-cover object-center"
          priority
          quality={70}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-qd-green/20 via-transparent to-slate-50/80"></div>
      </section>

      {/* ===== VĂN BẢN CHÍNH SÁCH ===== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-extrabold text-qd-green uppercase tracking-wider">
            Văn Bản Chính Sách Quốc Phòng
          </h2>
          <div className="w-20 h-1 bg-qd-yellow mx-auto mt-3 rounded-full"></div>
          <p className="text-sm text-slate-500 mt-3 max-w-2xl mx-auto">
            Tổng hợp các quy định, chế độ chính sách liên quan đến quân nhân, quân đội và công dân
          </p>
        </div>

        <div className="space-y-8">
          {/* ===== Văn bản 1 ===== */}
          <article className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="border-l-4 border-qd-red p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 bg-qd-red text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Luật
                </span>
                <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
                  Luật Nghĩa vụ Quân sự năm 2015 (Luật số 78/2015/QH13)
                </h3>
              </div>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  Luật này quy định về <strong className="text-slate-800">nghĩa vụ quân sự; nhiệm vụ, quyền hạn của cơ quan, tổ chức, cá nhân</strong> và
                  chế độ, chính sách trong việc thực hiện nghĩa vụ quân sự.
                </p>
                <p>
                  <strong className="text-slate-800">Điều 4 — Nghĩa vụ quân sự:</strong> Nghĩa vụ quân sự là nghĩa vụ vẻ vang của công dân phục vụ trong
                  Quân đội nhân dân Việt Nam. <strong className="text-qd-red">Công dân nam trong độ tuổi từ đủ 18 đến hết 25 tuổi</strong> được gọi
                  nhập ngũ; thời hạn phục vụ tại ngũ là <strong className="text-qd-red">24 tháng</strong>.
                </p>
                <p>
                  <strong className="text-slate-800">Điều 5 — Đối tượng được tạm hoãn và miễn gọi nhập ngũ:</strong> Công dân thuộc diện
                  <strong className="text-slate-800"> con một của gia đình có hoàn cảnh khó khăn, lao động duy nhất nuôi người thân không có khả năng lao động</strong>,
                  hoặc đang theo học tại các cơ sở giáo dục phổ thông, đại học chính quy được xem xét tạm hoãn.
                </p>
              </div>
            </div>
          </article>

          {/* ===== Văn bản 2 ===== */}
          <article className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="border-l-4 border-qd-yellow p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 bg-qd-yellow text-qd-green text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Nghị định
                </span>
                <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
                  Nghị định 27/2016/NĐ-CP — Chế độ, chính sách đối với quân nhân và người hưởng lương trong Quân đội
                </h3>
              </div>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  Quy định chi tiết về <strong className="text-slate-800">chế độ phụ cấp, trợ cấp, bảo hiểm xã hội, bảo hiểm y tế</strong> và
                  các chính sách ưu đãi khác đối với sĩ quan, quân nhân chuyên nghiệp, hạ sĩ quan, binh sĩ.
                </p>
                <p>
                  <strong className="text-slate-800">Chế độ trợ cấp xuất ngũ:</strong> Quân nhân hoàn thành nghĩa vụ quân sự được hưởng
                  <strong className="text-qd-red"> trợ cấp xuất ngũ một lần bằng 02 tháng tiền lương</strong> cho mỗi năm phục vụ tại ngũ.
                  Ngoài ra, được cấp <strong className="text-slate-800">tiền tàu xe, phụ cấp đi đường</strong> từ đơn vị về nơi cư trú.
                </p>
                <p>
                  <strong className="text-slate-800">Chế độ bảo hiểm:</strong> Trong thời gian tại ngũ, quân nhân được
                  <strong className="text-qd-red"> Nhà nước đảm bảo 100% chi phí khám chữa bệnh</strong>,
                  đóng bảo hiểm xã hội, bảo hiểm y tế theo quy định.
                </p>
              </div>
            </div>
          </article>

          {/* ===== Văn bản 3 ===== */}
          <article className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="border-l-4 border-qd-green p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 bg-qd-green text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Pháp lệnh
                </span>
                <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
                  Pháp lệnh Ưu đãi người có công với cách mạng (Pháp lệnh 02/2020/UBTVQH14)
                </h3>
              </div>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  Quy định về <strong className="text-slate-800">đối tượng, điều kiện, tiêu chuẩn, chế độ ưu đãi</strong> đối với
                  người có công với cách mạng và thân nhân của người có công với cách mạng.
                </p>
                <p>
                  <strong className="text-slate-800">Đối tượng áp dụng:</strong> Người hoạt động cách mạng, liệt sĩ và thân nhân liệt sĩ,
                  <strong className="text-qd-red"> Bà mẹ Việt Nam anh hùng, thương binh, bệnh binh</strong>, người hoạt động kháng chiến,
                  người có công giúp đỡ cách mạng.
                </p>
                <p>
                  <strong className="text-slate-800">Chế độ ưu đãi chính:</strong> Trợ cấp hàng tháng, trợ cấp một lần,
                  <strong className="text-qd-red"> miễn giảm thuế, ưu tiên giao đất, hỗ trợ nhà ở</strong>,
                  ưu tiên trong giáo dục, đào tạo, việc làm và chăm sóc sức khỏe.
                </p>
              </div>
            </div>
          </article>

          {/* ===== Văn bản 4 ===== */}
          <article className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="border-l-4 border-blue-500 p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Thông tư
                </span>
                <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
                  Thông tư 95/2022/TT-BQP — Quy định về tiếp công dân trong Bộ Quốc phòng
                </h3>
              </div>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  Quy định chi tiết về <strong className="text-slate-800">trình tự, thủ tục tiếp công dân; quyền và nghĩa vụ của công dân</strong> khi
                  đến kiến nghị, phản ánh, khiếu nại, tố cáo tại các cơ quan, đơn vị trong Quân đội.
                </p>
                <p>
                  <strong className="text-slate-800">Quyền của công dân:</strong> Được <strong className="text-qd-red">trình bày đầy đủ nội dung kiến nghị, phản ánh</strong>;
                  được nhận thông báo kết quả xử lý; được <strong className="text-qd-red">bảo đảm bí mật thông tin cá nhân</strong> theo quy định.
                </p>
                <p>
                  <strong className="text-slate-800">Thời gian tiếp công dân:</strong> Thủ trưởng đơn vị quân đội cấp trung đoàn trở lên phải bố trí
                  <strong className="text-qd-red"> ít nhất 01 ngày/tháng</strong> để tiếp công dân định kỳ.
                  Trường hợp cấp bách, <strong className="text-slate-800">tiếp công dân đột xuất</strong> theo yêu cầu.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ===== CTA - NÚT HỖ TRỢ LỚN ===== */}
      <section className="bg-qd-green py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
            Bạn cần gửi kiến nghị hoặc đặt lịch hẹn?
          </h2>
          <p className="text-sm text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed">
            Hệ thống tiếp nhận trực tuyến hoạt động 24/7. Mọi kiến nghị, phản ánh của công dân đều được
            tiếp nhận, xử lý và phản hồi kết quả qua SMS/Zalo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Link
              href="/ho-tro"
              className="inline-flex items-center gap-2.5 bg-qd-yellow hover:bg-yellow-500 text-qd-green font-extrabold px-8 py-3.5 rounded-2xl text-sm md:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Gửi Yêu Cầu Hỗ Trợ
            </Link>
            <Link
              href="/tra-cuu"
              className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm md:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tra Cứu Kết Quả
            </Link>
            <a
              href="tel:19001234"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-200 border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Gọi: 1900.1234
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-800 py-8 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hệ thống Tiếp công dân trực tuyến Quân đội nhân dân Việt Nam
          </p>
          <p className="text-[11px] text-slate-500">
            Bảo mật thông tin mã hóa đầu cuối dữ liệu công dân quốc gia theo tiêu chuẩn thông tin quân sự
          </p>
          <p className="text-[11px] text-slate-500">© 2026 Bản quyền thuộc về Bộ Quốc phòng</p>
        </div>
      </footer>
    </main>
  );
}
