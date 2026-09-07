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
          text: `Read "${title}" on Digital Library`,
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
          className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm text-center shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <BookOpen className="w-5 h-5" />
          Read Online Now
        </Link>

        {/* Download Button (Conditional on allowDownload) */}
        {allowDownload ? (
          <a
            href={downloadHref}
            download
            className="py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Download PDF
          </a>
        ) : (
          <div
            title="Download is disabled by administrator"
            className="py-3.5 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-dashed border-slate-200 dark:border-slate-800"
          >
            <span>Direct Download Restricted</span>
          </div>
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-indigo-500" />
          Share
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Share this Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share "{title}" with colleagues or students:
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
