"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Search, Shield, Menu, X, Library } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Ensures light mode is locked */}
      <ThemeToggle />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight block">
              Digital Library
            </span>
            <span className="text-xs text-slate-500 font-medium">
              คลังหนังสือและเอกสารออนไลน์
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            href="/library"
            className="px-3.5 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <Library className="w-4 h-4 text-blue-600" />
            คลังหนังสือทั้งหมด
          </Link>
          <Link
            href="/library?category=anime-manga"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            อนิเมะ & การ์ตูน
          </Link>
          <Link
            href="/library?category=novels-fiction"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            นวนิยาย
          </Link>
          <Link
            href="/library?category=horror-ghost"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            เรื่องผี & สยองขวัญ
          </Link>
          <Link
            href="/library?category=science-tech"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            วิทยาศาสตร์
          </Link>
          <Link
            href="/library?category=business-finance"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            ธุรกิจ & ลงทุน
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            title="ค้นหาหนังสือ"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>เข้าสู่ระบบ Admin</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="เปิดเมนู"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            href="/library"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold rounded-lg text-slate-800 hover:bg-slate-100"
          >
            📚 คลังหนังสือทั้งหมด (All Documents)
          </Link>
          <Link
            href="/library?category=anime-manga"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            อนิเมะ & การ์ตูน (Anime & Manga)
          </Link>
          <Link
            href="/library?category=novels-fiction"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            นิยาย & วรรณกรรม (Fiction & Novels)
          </Link>
          <Link
            href="/library?category=horror-ghost"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            ผี & สยองขวัญ (Horror & Mystery)
          </Link>
          <Link
            href="/library?category=myths-legends"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            ตำนาน & เทพปกรณัม (Myths & Legends)
          </Link>
          <Link
            href="/library?category=science-tech"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            วิทยาศาสตร์ & เทคโนโลยี (Science & Tech)
          </Link>
          <Link
            href="/library?category=business-finance"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            ธุรกิจ & การเงิน (Business & Finance)
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 mt-2 text-sm font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <Shield className="w-4 h-4" />
            เข้าสู่ระบบผู้ดูแล (Admin Portal)
          </Link>
        </div>
      )}
    </header>
  );
}
