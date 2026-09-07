import Link from "next/link";
import { LibraryService } from "@/lib/data/libraryService";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentCard } from "@/components/library/DocumentCard";
import { SearchBar } from "@/components/library/SearchBar";
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Tv,
  BookMarked,
  Flame,
  Crown,
  Compass,
  Atom,
  GraduationCap,
  FlaskConical,
  Code,
  Briefcase,
  Landmark,
  HeartHandshake,
  Layers,
} from "lucide-react";

export const revalidate = 60; // ISR cache for 60 seconds

// Category Icon Resolver
function renderCategoryIcon(iconName: string) {
  const iconProps = { className: "w-5 h-5" };
  switch (iconName) {
    case "Tv":
      return <Tv {...iconProps} />;
    case "BookMarked":
      return <BookMarked {...iconProps} />;
    case "Flame":
      return <Flame {...iconProps} />;
    case "Crown":
      return <Crown {...iconProps} />;
    case "Compass":
      return <Compass {...iconProps} />;
    case "Atom":
      return <Atom {...iconProps} />;
    case "GraduationCap":
      return <GraduationCap {...iconProps} />;
    case "FlaskConical":
      return <FlaskConical {...iconProps} />;
    case "Code":
      return <Code {...iconProps} />;
    case "Briefcase":
      return <Briefcase {...iconProps} />;
    case "Landmark":
      return <Landmark {...iconProps} />;
    case "HeartHandshake":
      return <HeartHandshake {...iconProps} />;
    default:
      return <Layers {...iconProps} />;
  }
}

export default async function HomePage() {
  // Fetch real data from LibraryService (Zero-DB / Local State Architecture)
  const [categories, featuredRes, latestRes, popularRes, analytics] =
    await Promise.all([
      LibraryService.getCategories(),
      LibraryService.getDocuments({ featured: true, limit: 4, sort: "popular" }),
      LibraryService.getDocuments({ limit: 8, sort: "newest" }),
      LibraryService.getDocuments({ limit: 4, sort: "popular" }),
      LibraryService.getAnalyticsSummary(),
    ]);

  const featuredDocs = featuredRes.documents;
  const latestDocs = latestRes.documents;
  const popularDocs = popularRes.documents;
  const totalDocs = analytics.totalDocs;
  const totalViews = analytics.totalViews;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-grow">
        {/* BUSINESS MINIMAL HERO SECTION */}
        <section className="relative bg-white dark:bg-[#0b101b] pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Business Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Digital Library • คลังหนังสือและเอกสารดิจิทัลออนไลน์</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2] mb-5">
              ศูนย์รวมหนังสือและเอกสารออนไลน์
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                เข้าถึงง่าย อ่านได้ทันทีทุกที่ทุกเวลา
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              รวบรวมหนังสือหลากหลายประเภท ทั้งอนิเมะ มังงะ นิยาย วรรณกรรม ผีสยองขวัญ ตำนานโบราณ วิทยาศาสตร์ การเรียน ตำราวิชาการ การทดลอง และธุรกิจ พร้อมระบบอ่าน PDF ออนไลน์ประสิทธิภาพสูง
            </p>

            {/* Interactive Instant Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <SearchBar placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, หมวดหมู่ หรือคำสำคัญ..." />
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-8">
              <span className="font-medium mr-1">หมวดหมู่แนะนำ:</span>
              <Link
                href="/library?category=anime-manga"
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                อนิเมะ & มังงะ
              </Link>
              <Link
                href="/library?category=novels-fiction"
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                นิยาย
              </Link>
              <Link
                href="/library?category=horror-ghost"
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                ผี & สยองขวัญ
              </Link>
              <Link
                href="/library?category=myths-legends"
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                ตำนานโบราณ
              </Link>
              <Link
                href="/library?category=science-tech"
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                วิทยาศาสตร์
              </Link>
              <Link
                href="/library?category=experiments-research"
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                การทดลอง & วิจัย
              </Link>
              <Link
                href="/library?category=business-finance"
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                ธุรกิจ
              </Link>
            </div>

            {/* Stats row */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-3 px-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-bold">{totalDocs}</strong> เล่มในคลัง
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-bold">{categories.length}</strong> หมวดหมู่
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {(totalViews || 0).toLocaleString()}
                  </strong> ครั้งการเข้าอ่าน
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>ระบบสตรีมมิ่งไฟล์ PDF</span>
              </div>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE CATEGORIES GRID (12 CATEGORIES) */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                หมวดหมู่หนังสือและเอกสาร
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                เลือกอ่านตามความสนใจ ครอบคลุมทั้งสาระ ความรู้ และความบันเทิง
              </p>
            </div>
            <Link
              href="/library"
              className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/library?category=${cat.slug}`}
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-xs hover:shadow-sm transition-all flex flex-col items-center text-center gap-2.5"
              >
                <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400 flex items-center justify-center transition-colors">
                  {renderCategoryIcon(cat.icon || "Layers")}
                </div>
                <div className="w-full">
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    {cat._count.documents} เล่ม
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED DOCUMENTS */}
        {featuredDocs.length > 0 && (
          <section className="py-12 bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      หนังสือและเอกสารแนะนำ
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      ผลงานคัดสรรที่น่าสนใจและได้รับความนิยม
                    </p>
                  </div>
                </div>
                <Link
                  href="/library?featured=true"
                  className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredDocs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LATEST DOCUMENTS */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  เพิ่มเข้ามาล่าสุด
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  หนังสือและเอกสารที่เพิ่งอัปโหลดเข้าสู่ระบบ
                </p>
              </div>
            </div>

            <Link
              href="/library"
              className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              เปิดคลังหนังสือทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </section>

        {/* POPULAR DOCUMENTS */}
        <section className="py-14 bg-white dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    หนังสือยอดนิยม
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    หนังสือที่มีผู้อ่านมากที่สุดในระบบ
                  </p>
                </div>
              </div>

              <Link
                href="/library?sort=popular"
                className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                ดูอันดับยอดนิยม <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        </section>

        {/* CORPORATE BUSINESS CTA BANNER */}
        <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-2xl bg-slate-900 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                พร้อมเริ่มการอ่านของคุณแล้วหรือยัง?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
                สัมผัสประสบการณ์การอ่านหนังสือและเอกสาร PDF ออนไลน์แบบเต็มจอ ปรับซูม ค้นหาหน้า และบุ๊กมาร์กได้ทันทีโดยไม่ต้องติดตั้งโปรแกรมเสริม
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  เปิดดูคลังหนังสือทั้งหมด
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
                >
                  เข้าสู่ระบบ Admin
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
