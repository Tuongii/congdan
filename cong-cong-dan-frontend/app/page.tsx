import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Trang Chủ",
  description:
    "Cổng thông tin tiếp nhận phản ánh, kiến nghị, tố cáo và đăng ký lịch tiếp công dân trực tuyến của Cơ quan Quân sự Quân khu 2 - Bộ Quốc Phòng. Tra cứu tiến độ hồ sơ trực tiếp.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return <HomeClient />;
}
