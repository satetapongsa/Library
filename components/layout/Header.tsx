"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Search, Shield, Menu, X, Library } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
            <BookOpen className="w-5 h-5 text-blue-400 dark:text-blue-600" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Digital Library
            </span>
            <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">
              คลังหนังสือและเอกสารดิจิทัล
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link
            href="/library"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Library className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            คลังหนังสือทั้งหมด
          </Link>
          <Link
            href="/library?category=anime-manga"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            อนิเมะ & มังงะ
          </Link>
          <Link
            href="/library?category=novels-fiction"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            นิยาย
          </Link>
          <Link
            href="/library?category=horror-ghost"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ผี & สยองขวัญ
          </Link>
          <Link
            href="/library?category=science-tech"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            วิทยาศาสตร์
          </Link>
          <Link
            href="/library?category=business-finance"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ธุรกิจ & การเงิน
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/library"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="ค้นหาหนังสือ"
          >
            <Search className="w-4 h-4" />
          </Link>

          <ThemeToggle />

          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Admin</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          <Link
            href="/library"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            คลังหนังสือทั้งหมด (All Documents)
          </Link>
          <Link
            href="/library?category=anime-manga"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            อนิเมะ & การ์ตูน (Anime & Manga)
          </Link>
          <Link
            href="/library?category=novels-fiction"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            นิยาย & วรรณกรรม (Fiction & Novels)
          </Link>
          <Link
            href="/library?category=horror-ghost"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ผี & สยองขวัญ (Horror & Mystery)
          </Link>
          <Link
            href="/library?category=myths-legends"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ตำนาน & เทพปกรณัม (Myths & Legends)
          </Link>
          <Link
            href="/library?category=science-tech"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            วิทยาศาสตร์ & อวกาศ (Science)
          </Link>
          <Link
            href="/library?category=business-finance"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ธุรกิจ & การเงิน (Business & Finance)
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800"
          >
            <Shield className="w-4 h-4" />
            เข้าสู่ระบบผู้ดูแล (Admin Portal)
          </Link>
        </div>
      )}
    </header>
  );
}
