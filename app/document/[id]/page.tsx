import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { LibraryService } from "@/lib/data/libraryService";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentActions } from "@/components/library/DocumentActions";
import { DocumentCard } from "@/components/library/DocumentCard";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  FileText,
  Globe,
  User,
  Eye,
  Tag as TagIcon,
  ChevronRight,
  ShieldCheck,
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
    description: doc.description || `Read "${doc.title}" by ${doc.author || "Unknown"} on Digital Library.`,
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

  // Related documents in same category
  const relatedRes = await LibraryService.getDocuments({
    category: doc.categorySlug,
    limit: 5,
    sort: "popular",
  });

  const relatedDocs = relatedRes.documents.filter((d) => d.id !== doc.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-8">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/library" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Library
          </Link>
          {doc.category && (
            <>
              <Link
                href={`/library?category=${doc.category.slug}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {doc.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="truncate max-w-[200px] text-slate-800 dark:text-slate-200 font-medium">
            {doc.title}
          </span>
        </nav>

        {/* Main Document Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Left Column: Cover Preview */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="sticky top-24 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {doc.coverUrl ? (
                  <img
                    src={doc.coverUrl}
                    alt={doc.title}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-indigo-50/20">
                    <BookOpen className="w-16 h-16 text-indigo-400 mb-2" />
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {doc.title}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  {doc.pageCount} Pages
                </span>
                <span>{formatBytes(doc.fileSize)}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
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
                    className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                  >
                    {doc.category.name}
                  </Link>
                )}
                {doc.isFeatured && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">
                    Featured Pick
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
                {doc.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium mb-6">
                <User className="w-4 h-4 text-slate-400" />
                <span>By <strong className="text-slate-900 dark:text-slate-200">{doc.author || "Unknown"}</strong></span>
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-2">
                  About this publication
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {doc.description || "No description provided for this document."}
                </p>
              </div>

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5" />
                    Topics & Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((t: any) => {
                      const tagName = typeof t === "string" ? t : t?.tag?.name || t?.name || "Tag";
                      return (
                        <Link
                          key={tagName}
                          href={`/library?q=${encodeURIComponent(tagName)}`}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                        >
                          #{tagName}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Metadata Details Table */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Document Verification Specifications
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Format</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">PDF Document</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Total Pages</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.pageCount} Pages</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">File Size</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(doc.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Archived Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED DOCUMENTS */}
        {relatedDocs.length > 0 && (
          <section className="pt-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Related Publications
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  More documents from {doc.category?.name || "this collection"}
                </p>
              </div>
              <Link
                href={`/library?category=${doc.category?.slug || ""}`}
                className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Browse category
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
