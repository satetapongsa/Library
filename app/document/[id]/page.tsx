import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { LibraryService } from "@/lib/data/libraryService";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentActions } from "@/components/library/DocumentActions";
import { DocumentCard } from "@/components/library/DocumentCard";
import { formatBytes, formatDate } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";
import { getBookContent } from "@/lib/data/documentContents";
import {
  FileText,
  Eye,
  ChevronRight,
  ShieldCheck,
  Tag as TagIcon,
  User,
  BookOpen,
  ListOrdered,
  BookOpenCheck,
  Quote,
} from "lucide-react";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DocumentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await LibraryService.getDocument(id);

  if (!doc) {
    return {
      title: "Document Not Found | Digital Library",
    };
  }

  return {
    title: `${doc.title} | Digital Library`,
    description: doc.description || `อ่าน "${doc.title}" โดย ${doc.author || "ไม่ระบุผู้แต่ง"} บน Digital Library`,
    openGraph: {
      title: `${doc.title} | Digital Library`,
      description: doc.description || undefined,
      type: "article",
    },
  };
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;
  const doc = await LibraryService.getDocument(id);

  if (!doc) {
    notFound();
  }

  // Fetch book table of contents and formatted content
  const bookContent = getBookContent(
    doc.slug || doc.id,
    doc.title,
    doc.category?.slug || doc.categorySlug,
    doc.category?.name,
    doc.author,
    doc.pageCount
  );

  // Related documents in same category
  const relatedRes = await LibraryService.getDocuments({
    category: doc.categorySlug,
    limit: 5,
    sort: "popular",
  });

  const relatedDocs = relatedRes.documents.filter((d) => d.id !== doc.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-600 mb-8">
          <Link href="/" className="hover:text-blue-600 font-medium">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/library" className="hover:text-blue-600 font-medium">
            คลังหนังสือ
          </Link>
          {doc.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link
                href={`/library?category=${doc.category.slug}`}
                className="hover:text-blue-600 font-medium"
              >
                {doc.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[200px] text-slate-900 font-bold">
            {doc.title}
          </span>
        </nav>

        {/* Main Document Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Left Column: Cover Preview (Pure Code-Generated BookCover) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="sticky top-24 w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
                <BookCover
                  title={doc.title}
                  author={doc.author}
                  categoryName={doc.category?.name}
                  categorySlug={doc.category?.slug || doc.categorySlug}
                  pageCount={doc.pageCount}
                  size="lg"
                  className="w-full h-full"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {doc.pageCount} หน้า
                </span>
                <span>{formatBytes(doc.fileSize)}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {doc.viewCount.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Metadata */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              {/* Category badge */}
              <div className="flex items-center gap-2 mb-3">
                {doc.category && (
                  <Link
                    href={`/library?category=${doc.category.slug}`}
                    className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {doc.category.name}
                  </Link>
                )}
                {doc.isFeatured && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                    แนะนำ
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-3">
                {doc.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-6">
                <User className="w-4 h-4 text-slate-400" />
                <span>โดย <strong className="text-slate-900 font-bold">{doc.author || "ไม่ระบุผู้แต่ง"}</strong></span>
              </div>

              {/* Action Buttons (Read, Download, Share) */}
              <div className="mb-8">
                <DocumentActions
                  id={doc.id}
                  slug={doc.slug}
                  title={doc.title}
                  allowDownload={doc.allowDownload}
                  fileUrl={doc.fileUrl}
                  storageKey={doc.storageKey}
                />
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
                  เกี่ยวกับหนังสือเล่มนี้
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {doc.description || "ไม่มีรายละเอียดเพิ่มเติมสำหรับเอกสารเล่มนี้"}
                </p>
              </div>

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-blue-600" />
                    แท็กและหัวข้อ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((t: any) => {
                      const tagName = typeof t === "string" ? t : t?.tag?.name || t?.name || "Tag";
                      return (
                        <Link
                          key={tagName}
                          href={`/library?q=${encodeURIComponent(tagName)}`}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors"
                        >
                          #{tagName}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Metadata Details Table */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ข้อมูลจำเพาะของไฟล์
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">รูปแบบ</span>
                    <span className="font-bold text-slate-900">PDF Document</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">จำนวนหน้า</span>
                    <span className="font-bold text-slate-900">{doc.pageCount} หน้า</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">ขนาดไฟล์</span>
                    <span className="font-bold text-slate-900">{formatBytes(doc.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">วันที่อัปโหลด</span>
                    <span className="font-bold text-slate-900">{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              </div>
              {/* Table of Contents Section (สารบัญเนื้อหา) */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      สารบัญเนื้อหา ({bookContent.tableOfContents.length} บท)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    คลิกเพื่อเปิดอ่านบทที่ต้องการ
                  </span>
                </div>

                <div className="space-y-3">
                  {bookContent.tableOfContents.map((ch, idx) => (
                    <Link
                      key={ch.id || idx}
                      href={`/read/${doc.slug || doc.id}?page=${ch.page}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {ch.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {ch.summary}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 sm:mt-0 flex items-center gap-3 flex-shrink-0 text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          หน้า {ch.page}
                        </span>
                        <span className="hidden sm:inline font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                          เริ่มอ่าน →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sample Excerpt Preview Section */}
              {bookContent.pages.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpenCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      ตัวอย่างเนื้อหา (หน้า 1)
                    </h3>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white">
                    <h4 className="text-base font-extrabold text-slate-900 mb-1">
                      {bookContent.pages[0].chapterTitle}
                    </h4>
                    {bookContent.pages[0].subtitle && (
                      <p className="text-xs font-semibold text-blue-600 mb-4">
                        {bookContent.pages[0].subtitle}
                      </p>
                    )}

                    <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                      {bookContent.pages[0].paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>

                    {bookContent.pages[0].quote && (
                      <div className="my-5 p-4 rounded-xl bg-amber-50/60 border-l-4 border-amber-500 text-slate-800 text-xs sm:text-sm italic flex items-start gap-2.5">
                        <Quote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>"{bookContent.pages[0].quote}"</span>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        อ่านต่อฉบับเต็มได้ในโปรแกรมอ่านออนไลน์ (เลือกได้ทั้งแบบเปิดทีละหน้า หรือเลื่อนยาวแบบเว็บตูน)
                      </span>
                      <Link
                        href={`/read/${doc.slug || doc.id}?page=1`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        อ่านฉบับเต็มทั้งเล่ม
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RELATED DOCUMENTS */}
        {relatedDocs.length > 0 && (
          <section className="pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  หนังสือในหมวดเดียวกัน
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  ผลงานอื่นๆ จากหมวด {doc.category?.name || "ทั่วไป"}
                </p>
              </div>
              <Link
                href={`/library?category=${doc.category?.slug || ""}`}
                className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
              >
                ดูทั้งหมดในหมวดนี้
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedDocs.map((related) => (
                <DocumentCard key={related.id} document={related} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
