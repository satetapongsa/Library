import Link from "next/link";
import { BookOpen, Shield, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4 text-blue-400 dark:text-blue-600" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Digital Library
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              แพลตฟอร์มคลังหนังสือและเอกสารดิจิทัลออนไลน์ อ่านฟรีทุกที่ทุกเวลา รองรับทั้งหนังสือทั่วไป วรรณกรรม นิยาย มังงะ วิทยาศาสตร์ และงานวิชาการ
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-2.5">
              หมวดหมู่ยอดนิยม
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/library?category=anime-manga" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  อนิเมะ & การ์ตูน (Anime & Manga)
                </Link>
              </li>
              <li>
                <Link href="/library?category=novels-fiction" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  นิยาย & วรรณกรรม (Fiction)
                </Link>
              </li>
              <li>
                <Link href="/library?category=horror-ghost" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  ผี & สยองขวัญ (Horror)
                </Link>
              </li>
              <li>
                <Link href="/library?category=science-tech" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  วิทยาศาสตร์ & อวกาศ (Science)
                </Link>
              </li>
              <li>
                <Link href="/library?category=business-finance" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  ธุรกิจ & การเงิน (Business)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-2.5">
              การจัดการระบบ
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/admin/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  เข้าสู่ระบบแอดมิน (Admin Portal)
                </Link>
              </li>
              <li>
                <Link href="/admin/upload" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  อัปโหลดหนังสือใหม่ (Upload PDF)
                </Link>
              </li>
              <li>
                <Link href="/admin/categories" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  จัดการหมวดหมู่ (Categories CRUD)
                </Link>
              </li>
              <li>
                <Link href="/admin/analytics" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  สถิติและการอ่าน (Analytics)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Digital Library. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Clean White Business Edition</span>
            <span>•</span>
            <span>Next.js & Neon PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
