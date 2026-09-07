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
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />

      <main className="flex-grow">
        {/* BRIGHT CLEAN HERO SECTION */}
        <section className="bg-gradient-to-b from-blue-50/50 via-white to-white pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Digital Library • คลังหนังสือและเอกสารดิจิทัลออนไลน์</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-5">
              ศูนย์รวมหนังสือและเอกสารออนไลน์
              <br />
              <span className="text-blue-600">
                เข้าถึงง่าย อ่านได้ทันทีทุกที่ทุกเวลา
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base text-slate-600 mb-8 leading-relaxed">
              รวบรวมหนังสือหลากหลายประเภท ทั้งอนิเมะ มังงะ นิยาย วรรณกรรม ผีสยองขวัญ ตำนาน วิทยาศาสตร์ การเรียน ตำรา และธุรกิจ พร้อมระบบอ่าน PDF ออนไลน์ประสิทธิภาพสูง
            </p>

            {/* Interactive Instant Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <SearchBar placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, หมวดหมู่ หรือคำสำคัญ..." />
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 mb-8">
              <span className="font-semibold text-slate-700 mr-1">หมวดหมู่ยอดนิยม:</span>
              <Link
                href="/library?category=anime-manga"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                อนิเมะ & มังงะ
              </Link>
              <Link
                href="/library?category=novels-fiction"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                นวนิยาย
              </Link>
              <Link
                href="/library?category=horror-ghost"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                ผี & สยองขวัญ
              </Link>
              <Link
                href="/library?category=science-tech"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                วิทยาศาสตร์
              </Link>
              <Link
                href="/library?category=business-finance"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                ธุรกิจ & ลงทุน
              </Link>
            </div>

            {/* Stats row */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-3.5 px-6 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>
                  <strong className="text-slate-900 font-bold">{totalDocs}</strong> เล่มในคลัง
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>
                  <strong className="text-slate-900 font-bold">{categories.length}</strong> หมวดหมู่
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong className="text-slate-900 font-bold">
                    {(totalViews || 0).toLocaleString()}
                  </strong> ครั้งการเข้าอ่าน
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>ระบบสตรีมมิ่งไฟล์ PDF ความเร็วสูง</span>
              </div>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE CATEGORIES GRID (12 CATEGORIES) */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                หมวดหมู่หนังสือและเอกสาร
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                เลือกอ่านตามความสนใจ ครอบคลุมทั้งสาระ ความรู้ และความบันเทิง
              </p>
            </div>
            <Link
              href="/library"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/library?category=${cat.slug}`}
                className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                  {renderCategoryIcon(cat.icon || "Layers")}
                </div>
                <div className="w-full">
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
                    {cat._count.documents} เล่ม
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED DOCUMENTS */}
        {featuredDocs.length > 0 && (
          <section className="py-12 bg-slate-50/70 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      หนังสือและเอกสารแนะนำ
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      ผลงานคัดสรรที่น่าสนใจและได้รับความนิยม
                    </p>
                  </div>
                </div>
                <Link
                  href="/library?featured=true"
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
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
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  เพิ่มเข้ามาล่าสุด
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  หนังสือและเอกสารที่เพิ่งอัปโหลดเข้าสู่ระบบ
                </p>
              </div>
            </div>

            <Link
              href="/library"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
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
        <section className="py-14 bg-slate-50/70 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    หนังสือยอดนิยม
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    หนังสือที่มีผู้อ่านมากที่สุดในระบบ
                  </p>
                </div>
              </div>

              <Link
                href="/library?sort=popular"
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
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

        {/* BRIGHT CLEAN CTA BANNER */}
        <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-2xl bg-blue-50 border border-blue-200 text-slate-900 shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight text-slate-900">
                พร้อมเริ่มการอ่านของคุณแล้วหรือยัง?
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
                สัมผัสประสบการณ์การอ่านหนังสือและเอกสาร PDF ออนไลน์แบบเต็มจอ ปรับซูม ค้นหาหน้า และบุ๊กมาร์กได้ทันทีโดยไม่ต้องติดตั้งโปรแกรมเสริม
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  เปิดดูคลังหนังสือทั้งหมด
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
