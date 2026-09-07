"use client";

import Link from "next/link";
import { BookOpen, Eye, FileText, Sparkles } from "lucide-react";
import { formatBytes } from "@/lib/utils";

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
    <div className="group relative flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Featured ribbon */}
      {document.isFeatured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 dark:bg-amber-400 text-white dark:text-slate-950 text-[10px] font-bold shadow-xs tracking-wide">
          <Sparkles className="w-3 h-3" />
          แนะนำ
        </div>
      )}

      {/* Cover / Thumbnail Preview */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
        <Link href={detailHref} className="absolute inset-0 block" aria-label={`View ${document.title}`}>
          {document.coverUrl ? (
            <img
              src={document.coverUrl}
              alt={document.title}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-103"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-100 dark:bg-slate-800">
              <BookOpen className="w-10 h-10 text-slate-400 mb-2" />
              <p className="font-semibold text-xs line-clamp-2 text-slate-800 dark:text-slate-200">
                {document.title}
              </p>
            </div>
          )}
        </Link>

        {/* Floating Quick Read Overlay on Hover (sibling, not nested in <a>) */}
        <div className="absolute inset-0 pointer-events-none bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
          <Link
            href={readHref}
            className="pointer-events-auto w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs text-center shadow-md flex items-center justify-center gap-1.5 transition-transform transform translate-y-1 group-hover:translate-y-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
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
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors truncate max-w-[150px]"
            >
              {document.category.name}
            </Link>
          ) : (
            <span className="text-[11px] text-slate-400">เอกสารทั่วไป</span>
          )}

          <div className="flex items-center gap-1 text-slate-400 text-xs flex-shrink-0">
            <Eye className="w-3 h-3 text-slate-400" />
            <span>{document.viewCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={detailHref} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1">
            {document.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
          {document.author || "ไม่ระบุผู้แต่ง"}
        </p>

        {/* Bottom Specs and Actions */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{document.pageCount} หน้า</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{formatBytes(document.fileSize)}</span>
          </div>

          <Link
            href={readHref}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            อ่าน
          </Link>
        </div>
      </div>
    </div>
  );
}
