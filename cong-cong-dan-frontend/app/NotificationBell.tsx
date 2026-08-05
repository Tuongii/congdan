"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { lookupByTrackCode, TncdttEntry } from "./lib/api";

interface LocalSubmission {
  code: string;
  title: string;
  date: string;
}

interface EnrichedSubmission extends LocalSubmission {
  status?: TncdttEntry["trangThai"];
  phanHoi?: string | null;
  updatedAt?: string;
  loading: boolean;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load from localStorage & fetch statuses in background
  const loadNotifications = async () => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("citizen_submissions");
    if (!saved) {
      setSubmissions([]);
      setHasUnread(false);
      return;
    }

    try {
      const parsed: LocalSubmission[] = JSON.parse(saved);
      // Map to enriched state with loading indicator
      const initialList: EnrichedSubmission[] = parsed.map((item) => ({
        ...item,
        loading: true,
      }));
      setSubmissions(initialList);

      // Fetch statuses in background
      const enriched: EnrichedSubmission[] = await Promise.all(
        parsed.map(async (item): Promise<EnrichedSubmission> => {
          try {
            const data = await lookupByTrackCode(item.code);
            if (data) {
              return {
                ...item,
                status: data.trangThai,
                phanHoi: data.phanHoi,
                updatedAt: data.updatedAt,
                loading: false,
              };
            }
          } catch (e) {
            console.error("Lỗi tra cứu trạng thái đơn:", item.code, e);
          }
          return { ...item, loading: false };
        })
      );

      setSubmissions(enriched);

      // Check if there are active statuses (e.g. not 'moi')
      // and determine if they should be flagged as unread.
      const activeUpdate = enriched.some(
        (item) => item.status && item.status !== "moi"
      );
      setHasUnread(activeUpdate);
    } catch (e) {
      console.error("Lỗi đọc dữ liệu lịch sử nộp đơn:", e);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for storage changes in case a new petition is submitted
    window.addEventListener("storage", loadNotifications);
    return () => window.removeEventListener("storage", loadNotifications);
  }, []);

  const getStatusBadge = (status?: TncdttEntry["trangThai"], loading?: boolean) => {
    if (loading) {
      return (
        <span className="inline-flex items-center text-[10px] text-slate-400 font-medium animate-pulse">
          ⏳ Đang cập nhật...
        </span>
      );
    }
    switch (status) {
      case "moi":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-blue-100">
            🔵 Đã gửi
          </span>
        );
      case "dang_xu_ly":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-amber-100">
            🟡 Đang xử lý
          </span>
        );
      case "da_giai_quyet":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-emerald-100">
            🟢 Đã giải quyết
          </span>
        );
      case "tu_choi":
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-red-100">
            🔴 Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] text-slate-400 font-medium">
            ⚪ Không rõ trạng thái
          </span>
        );
    }
  };

  const handleMarkRead = () => {
    setIsOpen(!isOpen);
    if (isOpen === false) {
      // Reload on open
      loadNotifications();
    }
    setHasUnread(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleMarkRead}
        className="relative flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all duration-300 shadow-sm hover:scale-105 outline-none cursor-pointer"
        title="Thông báo tình trạng đơn phản ánh"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Pulse badge */}
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-qd-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-qd-red"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn font-sans text-slate-900">
          {/* Header */}
          <div className="bg-gradient-to-r from-qd-green to-qd-light-green p-4 text-white border-b-2 border-qd-yellow flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              🔔 Thông báo tình trạng hồ sơ
            </h4>
            {submissions.length > 0 && (
              <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                {submissions.length} đơn
              </span>
            )}
          </div>

          {/* List Content */}
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <span className="text-3xl block">📭</span>
                <p className="text-xs font-medium">Không có thông báo nào gần đây.</p>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Đơn bạn gửi trên thiết bị này sẽ hiển thị tiến độ trực tiếp tại đây.
                </p>
              </div>
            ) : (
              submissions.map((item) => (
                <Link
                  key={item.code}
                  href={`/tra-cuu?code=${item.code}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-4 hover:bg-slate-50/70 transition-colors duration-150 group"
                >
                  <div className="flex items-start justify-between gap-2.5 mb-1.5">
                    <span className="font-mono text-xs font-bold text-qd-red group-hover:underline">
                      {item.code}
                    </span>
                    {getStatusBadge(item.status, item.loading)}
                  </div>
                  <h5 className="text-xs font-bold text-slate-700 leading-snug line-clamp-2 mb-1.5 group-hover:text-slate-900">
                    {item.title}
                  </h5>
                  
                  {item.phanHoi && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-[10px] text-slate-600 font-medium leading-relaxed mb-1.5 italic">
                      💬 Phản hồi: {item.phanHoi.substring(0, 70)}
                      {item.phanHoi.length > 70 ? "..." : ""}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>
                      📅 Gửi ngày: {new Date(item.date).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="text-qd-green font-bold group-hover:underline">
                      Xem chi tiết →
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer link to full tracking */}
          <div className="bg-slate-50 p-2.5 border-t border-slate-100 text-center">
            <Link
              href="/tra-cuu"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-qd-green hover:text-qd-light-green transition-colors duration-200"
            >
              🔍 Tra cứu nâng cao bằng Mã hồ sơ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
