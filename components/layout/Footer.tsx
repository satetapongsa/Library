import Link from "next/link";
import { BookOpen, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-base">
                Digital Library
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              แพลตฟอร์มคลังหนังสือและเอกสารดิจิทัลออนไลน์ อ่านฟรีทุกที่ทุกเวลา รองรับทั้งหนังสือทั่วไป วรรณกรรม นิยาย การ์ตูน วิทยาศาสตร์ และงานวิจัย
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              หมวดหมู่ยอดนิยม
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/library?category=anime-manga" className="hover:text-blue-600 transition-colors">
                  อนิเมะ & การ์ตูน (Anime & Manga)
                </Link>
              </li>
              <li>
                <Link href="/library?category=novels-fiction" className="hover:text-blue-600 transition-colors">
                  นิยาย & วรรณกรรม (Fiction)
                </Link>
              </li>
              <li>
                <Link href="/library?category=horror-ghost" className="hover:text-blue-600 transition-colors">
                  ผี & สยองขวัญ (Horror)
                </Link>
              </li>
              <li>
                <Link href="/library?category=science-tech" className="hover:text-blue-600 transition-colors">
                  วิทยาศาสตร์ & เทคโนโลยี (Science)
                </Link>
              </li>
              <li>
                <Link href="/library?category=business-finance" className="hover:text-blue-600 transition-colors">
                  ธุรกิจ & การลงทุน (Business)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              การจัดการระบบ
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/admin/login" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 font-medium text-slate-700">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  เข้าสู่ระบบผู้ดูแล (Admin Portal)
                </Link>
              </li>
              <li>
                <Link href="/admin/upload" className="hover:text-blue-600 transition-colors">
                  อัปโหลดหนังสือใหม่ (Upload PDF)
                </Link>
              </li>
              <li>
                <Link href="/admin/documents" className="hover:text-blue-600 transition-colors">
                  รายการหนังสือทั้งหมด (Documents Table)
                </Link>
              </li>
              <li>
                <Link href="/admin/categories" className="hover:text-blue-600 transition-colors">
                  จัดการหมวดหมู่ (Categories)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Digital Library. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              Clean White Theme
            </span>
            <span>•</span>
            <span>Zero-DB Standalone Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
