import Link from "next/link";
import { LibraryService } from "@/lib/data/libraryService";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentCard } from "@/components/library/DocumentCard";
import { SearchBar } from "@/components/library/SearchBar";
import {
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface LibraryPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    featured?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const categorySlug = params.category || "all";
  const sort = params.sort || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const isFeaturedFilter = params.featured === "true";
  const limit = 12;

  const [categories, docResult] = await Promise.all([
    LibraryService.getCategories(),
    LibraryService.getDocuments({
      query: q,
      category: categorySlug,
      sort,
      page,
      limit,
      featured: isFeaturedFilter,
    }),
  ]);

  const documents = docResult.documents;
  const totalDocs = docResult.total;
  const totalPages = docResult.totalPages;

  // Helper to build URL with updated search params
  const makeUrl = (newParams: Record<string, string | number | undefined>) => {
    const combined: Record<string, string> = {
      ...(q ? { q } : {}),
      ...(categorySlug !== "all" ? { category: categorySlug } : {}),
      ...(sort !== "newest" ? { sort } : {}),
      ...(isFeaturedFilter ? { featured: "true" } : {}),
      ...(page > 1 ? { page: page.toString() } : {}),
    };

    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === "all" || (k === "page" && v === 1)) {
        delete combined[k];
      } else {
        combined[k] = v.toString();
      }
    });

    const search = new URLSearchParams(combined).toString();
    return `/library${search ? `?${search}` : ""}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                คลังหนังสือและเอกสารดิจิทัล
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                มีหนังสือและเอกสารทั้งหมด {totalDocs} เล่ม พร้อมให้เปิดอ่านออนไลน์ได้ทันที
              </p>
            </div>

            <div className="w-full md:w-96">
              <SearchBar initialQuery={q} placeholder="ค้นหาตามชื่อหนังสือ, ผู้แต่ง, หมวดหมู่..." />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <Link
                href={makeUrl({ category: "all", page: 1 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  categorySlug === "all"
                    ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                ทั้งหมด
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={makeUrl({ category: c.slug, page: 1 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    categorySlug === c.slug
                      ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75">({c._count.documents})</span>
                </Link>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ml-auto flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">จัดเรียง:</span>
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                {[
                  { key: "newest", label: "ล่าสุด" },
                  { key: "popular", label: "ยอดนิยม" },
                  { key: "title", label: "ชื่อหนังสือ" },
                  { key: "pages", label: "จำนวนหน้า" },
                ].map((s) => (
                  <Link
                    key={s.key}
                    href={makeUrl({ sort: s.key, page: 1 })}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      sort === s.key
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
              No documents found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {q
                ? `No books or publications match your search query "${q}".`
                : "No documents currently in this selected category."}
            </p>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Clear Filters & Show All
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Link
              href={makeUrl({ page: Math.max(1, page - 1) })}
              className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                page <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <span className="text-xs font-semibold px-4 text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>

            <Link
              href={makeUrl({ page: Math.min(totalPages, page + 1) })}
              className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                page >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
