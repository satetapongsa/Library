"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Download, Share2, Check, Copy } from "lucide-react";

interface DocumentActionsProps {
  id: string;
  slug: string;
  title: string;
  allowDownload: boolean;
  fileUrl: string;
  storageKey: string;
}

export function DocumentActions({
  id,
  slug,
  title,
  allowDownload,
  storageKey,
}: DocumentActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const readHref = `/read/${slug || id}`;
  const downloadHref = `/api/storage/download/${storageKey}?name=${encodeURIComponent(title)}`;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Digital Library`,
          text: `อ่าน "${title}" บน Digital Library`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Read Now CTA */}
        <Link
          href={readHref}
          className="flex-1 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <BookOpen className="w-5 h-5 text-white" />
          เปิดอ่านออนไลน์ทันที
        </Link>

        {/* Download Button */}
        {allowDownload ? (
          <a
            href={downloadHref}
            download
            className="py-3.5 px-5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            ดาวน์โหลด PDF
          </a>
        ) : (
          <div
            title="ผู้ดูแลระบบปิดการดาวน์โหลดไฟล์นี้"
            className="py-3.5 px-5 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-dashed border-slate-300"
          >
            <span>จำกัดการดาวน์โหลด</span>
          </div>
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="py-3.5 px-5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-blue-600" />
          แชร์
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              แชร์หนังสือเล่มนี้
            </h3>
            <p className="text-xs text-slate-600">
              คัดลอกลิงก์เพื่อแชร์ "{title}":
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="w-full bg-transparent text-xs text-slate-800 font-mono focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "คัดลอกแล้ว" : "คัดลอก"}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
