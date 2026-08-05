"use client";
import React, { useState, useEffect } from "react";

export default function QuanTriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@qk2";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === adminUsername && password === adminPassword) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Tài khoản hoặc mật khẩu không chính xác.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60 relative overflow-hidden">
          {/* Decorative bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-qd-green"></div>
          
          <div className="text-center">
            {/* Quân hiệu/Icon quân sự giả lập */}
            <div className="mx-auto h-16 w-16 bg-qd-green text-qd-yellow rounded-full flex items-center justify-center shadow-md border-2 border-qd-yellow font-bold text-2xl tracking-wider">
              QK2
            </div>
            <h2 className="mt-6 text-center text-xl font-bold uppercase text-slate-800 tracking-wide">
              Đăng nhập hệ thống
            </h2>
            <p className="mt-1 text-center text-xs font-semibold text-qd-green uppercase tracking-wider">
              Quản trị tiếp công dân trực tuyến
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
                <span className="text-sm">⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tài khoản admin..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:border-qd-green px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-qd-green hover:bg-qd-light-green text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border-b-2 border-emerald-950"
              >
                Xác thực & Vào hệ thống
              </button>
            </div>
          </form>
          
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Hệ thống bảo mật trực thuộc Quân khu 2
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar cho Admin */}
      <div className="bg-slate-800 text-white px-4 py-2 text-xs flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Phiên làm việc quản trị tích cực</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600/80 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border border-red-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
      {children}
    </div>
  );
}
