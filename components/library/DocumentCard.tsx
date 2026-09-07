"use client";

import Link from "next/link";
import { BookOpen, Eye, FileText, Sparkles } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";

export interface DocumentCardData {
  id: string;
  slug: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  pageCount: number;
  fileSize: number;
  viewCount: number;
  isFeatured?: boolean;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface DocumentCardProps {
  document: DocumentCardData;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const readHref = `/read/${document.slug || document.id}`;
  const detailHref = `/document/${document.slug || document.id}`;

  return (
    <div className="group relative flex flex-col rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Featured ribbon */}
      {document.isFeatured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-xs tracking-wide">
          <Sparkles className="w-3 h-3 text-white" />
          แนะนำ
        </div>
      )}

      {/* Cover / Thumbnail Preview with pure CSS/Vector BookCover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50 border-b border-slate-100">
        <Link href={detailHref} className="absolute inset-0 block" aria-label={`View ${document.title}`}>
          <BookCover
            title={document.title}
            author={document.author}
            categoryName={document.category?.name}
            categorySlug={document.category?.slug}
            pageCount={document.pageCount}
            className="w-full h-full transition-transform duration-300 group-hover:scale-102"
          />
        </Link>

        {/* Floating Quick Read Overlay on Hover */}
        <div className="absolute inset-0 pointer-events-none bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3 z-10">
          <Link
            href={readHref}
            className="pointer-events-auto w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs text-center shadow-md flex items-center justify-center gap-1.5 transition-transform transform translate-y-1 group-hover:translate-y-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            เปิดอ่านออนไลน์
          </Link>
        </div>
      </div>

      {/* Meta Content */}
      <div className="flex flex-col flex-grow p-3.5">
        {/* Category & Stats */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {document.category ? (
            <Link
              href={`/library?category=${document.category.slug}`}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors truncate max-w-[150px]"
            >
              {document.category.name}
            </Link>
          ) : (
            <span className="text-[11px] text-slate-400">ทั่วไป</span>
          )}

          <div className="flex items-center gap-1 text-slate-500 text-xs flex-shrink-0">
            <Eye className="w-3 h-3 text-slate-400" />
            <span>{document.viewCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={detailHref} className="group-hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
            {document.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-xs text-slate-600 line-clamp-1 mb-3">
          {document.author || "ไม่ระบุผู้แต่ง"}
        </p>

        {/* Bottom Specs and Actions */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{document.pageCount} หน้า</span>
            <span className="text-slate-300">•</span>
            <span>{formatBytes(document.fileSize)}</span>
          </div>

          <Link
            href={readHref}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            อ่าน
          </Link>
        </div>
      </div>
    </div>
  );
}
