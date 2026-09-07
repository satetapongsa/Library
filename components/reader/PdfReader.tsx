"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Sidebar as SidebarIcon,
  Layers,
} from "lucide-react";

interface PdfReaderProps {
  document: {
    id: string;
    slug: string;
    title: string;
    pageCount: number;
    fileUrl: string;
    storageKey: string;
    allowDownload: boolean;
  };
}

export function PdfReader({ document }: PdfReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"pages" | "bookmarks">("pages");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const readerAreaRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, document.pageCount);
  const pdfStreamUrl = `/api/storage/stream/${document.storageKey}#page=${currentPage}&zoom=${zoom}`;

  // 1. Record View Count on reader load
  useEffect(() => {
    fetch(`/api/documents/${document.id}/view`, { method: "POST" }).catch(() => {});
  }, [document.id]);

  // 2. Load Bookmarks & Reading Progress from LocalStorage
  useEffect(() => {
    const savedPageKey = `dl_read_${document.id}`;
    const savedBookmarksKey = `dl_bookmarks_${document.id}`;

    const lastPage = localStorage.getItem(savedPageKey);
    if (lastPage) {
      const p = parseInt(lastPage, 10);
      if (p >= 1 && p <= totalPages) {
        setCurrentPage(p);
        setPageInput(p.toString());
      }
    }

    const savedBookmarks = localStorage.getItem(savedBookmarksKey);
    if (savedBookmarks) {
      try {
        const bks = JSON.parse(savedBookmarks);
        setBookmarks(bks);
      } catch {}
    }
  }, [document.id, totalPages]);

  // Update current page bookmark state
  useEffect(() => {
    setIsBookmarked(bookmarks.includes(currentPage));
    setPageInput(currentPage.toString());
    localStorage.setItem(`dl_read_${document.id}`, currentPage.toString());
  }, [currentPage, bookmarks, document.id]);

  // Toggle Bookmark
  const toggleBookmark = useCallback(() => {
    let next: number[];
    if (bookmarks.includes(currentPage)) {
      next = bookmarks.filter((p) => p !== currentPage);
    } else {
      next = [...bookmarks, currentPage].sort((a, b) => a - b);
    }
    setBookmarks(next);
    localStorage.setItem(`dl_bookmarks_${document.id}`, JSON.stringify(next));

    // Also notify bookmark API
    fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: document.id,
        pageNumber: currentPage,
        clientToken: "local-client",
      }),
    }).catch(() => {});
  }, [bookmarks, currentPage, document.id]);

  // Page Navigation Handlers
  const goToPage = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(totalPages, page));
      setCurrentPage(target);
      setPageInput(target.toString());
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const zoomIn = () => setZoom((z) => Math.min(200, z + 15));
  const zoomOut = () => setZoom((z) => Math.max(50, z - 15));

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!window.document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      window.document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowRight":
        case "j":
          nextPage();
          break;
        case "ArrowLeft":
        case "k":
          prevPage();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "b":
        case "B":
          toggleBookmark();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage, toggleBookmark]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 select-none"
    >
      {/* TOP HUD / TOOLBAR (Crisp White) */}
      <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between z-30 shadow-xs">
        {/* Left: Back, Sidebar Toggle, Document Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            href={`/document/${document.slug || document.id}`}
            className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              sidebarOpen
                ? "bg-blue-50 text-blue-600 font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            title="เปิด/ปิด แถบดูหน้าเอกสาร"
          >
            <SidebarIcon className="w-5 h-5" />
          </button>

          <div className="hidden sm:block truncate max-w-md">
            <h1 className="text-sm font-bold truncate leading-tight text-slate-900">
              {document.title}
            </h1>
            <span className="text-[11px] text-slate-500">
              อ่านออนไลน์ • หน้า {currentPage} จาก {totalPages}
            </span>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="หน้าก่อนหน้า (ลูกศรซ้าย)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const p = parseInt(pageInput, 10);
                  if (!isNaN(p)) goToPage(p);
                }
              }}
              className="w-12 text-center py-1 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-500">/ {totalPages}</span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="หน้าถัดไป (ลูกศรขวา)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Zoom, Bookmark, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600"
              title="ย่อ (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 w-11 text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600"
              title="ขยาย (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isBookmarked
                ? "text-amber-500 bg-amber-50"
                : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
            }`}
            title={isBookmarked ? "ลบบุ๊กมาร์ก (B)" : "บันทึกหน้านี้ (B)"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-amber-500" />
            ) : (
              <BookmarkIcon className="w-4 h-4" />
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="เต็มหน้าจอ (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* BODY (SIDEBAR + CANVAS) */}
      <div className="flex flex-grow overflow-hidden relative">
        {/* COLLAPSIBLE SIDEBAR */}
        {sidebarOpen && (
          <aside className="w-64 sm:w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white z-20">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-200 p-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab("pages")}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "pages"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                ทุกหน้า ({totalPages})
              </button>
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "bookmarks"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookmarkIcon className="w-3.5 h-3.5" />
                บุ๊กมาร์ก ({bookmarks.length})
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-grow overflow-y-auto p-3 space-y-2 bg-slate-50">
              {activeTab === "pages" ? (
                // Thumbnail grid / list
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`relative flex flex-col items-center p-2 rounded-xl border transition-all text-center group cursor-pointer ${
                        currentPage === p
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      {/* Visual Thumbnail representation */}
                      <div className="w-full aspect-[3/4] rounded-lg bg-white shadow-xs border border-slate-200 mb-1.5 flex flex-col p-1.5 overflow-hidden text-[6px] text-slate-300 select-none">
                        <div className="w-2/3 h-1 bg-slate-300 rounded-xs mb-1" />
                        <div className="space-y-0.5">
                          <div className="w-full h-0.5 bg-slate-200 rounded-xs" />
                          <div className="w-full h-0.5 bg-slate-200 rounded-xs" />
                          <div className="w-3/4 h-0.5 bg-slate-200 rounded-xs" />
                        </div>
                        <div className="mt-auto text-right text-[8px] font-bold text-slate-400">
                          {p}
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold ${currentPage === p ? "text-blue-600" : "text-slate-700"}`}>
                        หน้า {p}
                      </span>

                      {bookmarks.includes(p) && (
                        <div className="absolute top-1.5 right-1.5 text-amber-500">
                          <BookmarkCheck className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                // Bookmarks list
                <div className="space-y-2">
                  {bookmarks.length > 0 ? (
                    bookmarks.map((p) => (
                      <div
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`flex items-center justify-between p-3 rounded-xl border bg-white cursor-pointer transition-colors ${
                          currentPage === p
                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-500"
                            : "border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookmarkIcon className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-slate-900">หน้า {p}</span>
                        </div>
                        <span className="text-[11px] text-blue-600 font-bold">ไปยังหน้านี้ →</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                      ยังไม่มีบุ๊กมาร์กที่บันทึกไว้
                      <br />
                      กดปุ่ม <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-sm text-[11px] font-mono text-slate-700">B</kbd> หรือไอคอนบุ๊กมาร์กเพื่อบันทึกหน้านี้
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* READING SURFACE / PDF EMBED */}
        <main
          ref={readerAreaRef}
          className="flex-grow flex flex-col items-center justify-start overflow-auto p-4 relative bg-slate-100"
        >
          {/* Main Embedded Viewer Container */}
          <div
            style={{ width: `${Math.min(100, Math.max(40, zoom))}%` }}
            className="h-full flex flex-col items-center justify-center transition-all duration-200 shadow-xl rounded-2xl overflow-hidden border border-slate-200 bg-white"
          >
            <iframe
              src={pdfStreamUrl}
              title={document.title}
              className="w-full h-full border-0 bg-white"
            />
          </div>

          {/* Floating Navigation Pill at Bottom */}
          <div className="absolute bottom-6 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-white/95 border border-slate-300 shadow-xl backdrop-blur-md text-slate-800 text-xs font-bold">
            <button
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
