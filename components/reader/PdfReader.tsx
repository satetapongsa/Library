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
  ListOrdered,
  BookOpen,
  ScrollText,
  ArrowUp,
  Quote,
  Sparkles,
  FileText,
} from "lucide-react";
import { getBookContent } from "@/lib/data/documentContents";
import { BookCover } from "@/components/library/BookCover";

interface PdfReaderProps {
  document: {
    id: string;
    slug: string;
    title: string;
    author?: string | null;
    categorySlug?: string | null;
    category?: { name: string; slug: string } | null;
    pageCount: number;
    fileUrl: string;
    storageKey: string;
    allowDownload: boolean;
  };
  initialPage?: number;
}

export function PdfReader({ document, initialPage }: PdfReaderProps) {
  const [readingMode, setReadingMode] = useState<"horizontal" | "vertical">("horizontal");
  const [viewType, setViewType] = useState<"digital" | "pdf">("digital");
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [pageInput, setPageInput] = useState((initialPage || 1).toString());
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"toc" | "pages" | "bookmarks">("toc");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLElement>>(new Map());

  const totalPages = Math.max(1, document.pageCount);

  // Load Book Content (chapters + pages)
  const bookContent = getBookContent(
    document.slug || document.id,
    document.title,
    document.category?.slug || document.categorySlug,
    document.category?.name,
    document.author,
    totalPages
  );

  const pdfStreamUrl = `/api/storage/stream/${document.storageKey}#page=${currentPage}&zoom=${zoom}`;

  // 1. Record View Count on reader load
  useEffect(() => {
    fetch(`/api/documents/${document.id}/view`, { method: "POST" }).catch(() => {});
  }, [document.id]);

  // 2. Load preferences (reading mode, bookmarks, initial page) from LocalStorage
  useEffect(() => {
    // Mode preference
    const savedMode = localStorage.getItem("dl_reader_mode");
    if (savedMode === "horizontal" || savedMode === "vertical") {
      setReadingMode(savedMode);
    }

    // View type preference
    const savedViewType = localStorage.getItem("dl_view_type");
    if (savedViewType === "digital" || savedViewType === "pdf") {
      setViewType(savedViewType);
    }

    // Bookmarks
    const savedBookmarksKey = `dl_bookmarks_${document.id}`;
    const savedBookmarks = localStorage.getItem(savedBookmarksKey);
    if (savedBookmarks) {
      try {
        const bks = JSON.parse(savedBookmarks);
        setBookmarks(bks);
      } catch {}
    }

    // Page: prioritize initialPage prop, else check localStorage
    if (initialPage && initialPage >= 1 && initialPage <= totalPages) {
      setCurrentPage(initialPage);
      setPageInput(initialPage.toString());
    } else {
      const savedPageKey = `dl_read_${document.id}`;
      const lastPage = localStorage.getItem(savedPageKey);
      if (lastPage) {
        const p = parseInt(lastPage, 10);
        if (p >= 1 && p <= totalPages) {
          setCurrentPage(p);
          setPageInput(p.toString());
        }
      }
    }
  }, [document.id, totalPages, initialPage]);

  // Update current page bookmark state & save reading progress
  useEffect(() => {
    setIsBookmarked(bookmarks.includes(currentPage));
    setPageInput(currentPage.toString());
    localStorage.setItem(`dl_read_${document.id}`, currentPage.toString());
  }, [currentPage, bookmarks, document.id]);

  // Handle Reading Mode Switch
  const switchReadingMode = (mode: "horizontal" | "vertical") => {
    setReadingMode(mode);
    localStorage.setItem("dl_reader_mode", mode);
    // When switching to vertical, scroll into active page after a short delay
    if (mode === "vertical") {
      setTimeout(() => {
        const el = pageRefs.current.get(currentPage);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

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

      if (readingMode === "vertical") {
        const el = pageRefs.current.get(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [totalPages, readingMode]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const zoomIn = () => setZoom((z) => Math.min(180, z + 15));
  const zoomOut = () => setZoom((z) => Math.max(70, z - 15));

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!window.document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      window.document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Vertical Scroll Observer: Detects which page is in view
  useEffect(() => {
    if (readingMode !== "vertical" || viewType !== "digital") return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.scrollTop;
      let closestPage = currentPage;
      let minDistance = Infinity;

      pageRefs.current.forEach((el, pageNum) => {
        if (!el) return;
        const offsetTop = el.offsetTop - container.offsetTop;
        const distance = Math.abs(offsetTop - containerTop);
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = pageNum;
        }
      });

      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [readingMode, viewType, currentPage]);

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

  // Active page content
  const activePageData =
    bookContent.pages.find((p) => p.pageNumber === currentPage) || bookContent.pages[0];

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 select-none"
    >
      {/* TOP HUD / TOOLBAR (Bright Pure White) */}
      <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between z-30 shadow-xs flex-shrink-0">
        {/* Left: Back, Sidebar Toggle, Document Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            href={`/document/${document.slug || document.id}`}
            className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="ย้อนกลับไปหน้ารายละเอียดหนังสือ"
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
            title="เปิด/ปิด สารบัญและแถบข้าง"
          >
            <SidebarIcon className="w-5 h-5" />
          </button>

          <div className="hidden md:block truncate max-w-xs lg:max-w-sm">
            <h1 className="text-sm font-bold truncate leading-tight text-slate-900">
              {document.title}
            </h1>
            <span className="text-[11px] text-slate-500">
              หน้า {currentPage} จาก {totalPages} •{" "}
              {readingMode === "horizontal" ? "เปิดทีละหน้า (หนังสือ)" : "เลื่อนแนวตั้ง (เว็บตูน)"}
            </span>
          </div>
        </div>

        {/* Center: Reading Mode Switcher & Page Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DUAL-MODE SWITCHER (Book Horizontal vs Webtoon Vertical) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => switchReadingMode("horizontal")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                readingMode === "horizontal"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="เปิดทีละหน้าเหมือนหนังสือ (กดปุ่มสไลด์ซ้าย/ขวา)"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">เปิดทีละหน้า</span>
              <span className="sm:hidden">หนังสือ</span>
            </button>

            <button
              onClick={() => switchReadingMode("vertical")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                readingMode === "vertical"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="เลื่อนแนวตั้งต่อเนื่องเหมือนอ่านเว็บตูน"
            >
              <ScrollText className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">เลื่อนแนวตั้ง (เว็บตูน)</span>
              <span className="sm:hidden">เว็บตูน</span>
            </button>
          </div>

          {/* Quick Page Jump Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="หน้าก่อนหน้า (ลูกศรซ้าย)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
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
                className="w-10 text-center py-0.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-500 text-[11px]">/ {totalPages}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="หน้าถัดไป (ลูกศรขวา)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: View Type (Digital vs PDF), Zoom, Bookmark, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Toggle Digital Text vs Original PDF Stream */}
          <button
            onClick={() => {
              const next = viewType === "digital" ? "pdf" : "digital";
              setViewType(next);
              localStorage.setItem("dl_view_type", next);
            }}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer mr-1"
            title="สลับระหว่างหน้าเนื้อหาดิจิทัลความละเอียดสูง กับ ไฟล์ PDF"
          >
            {viewType === "digital" ? (
              <>
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>มุมมองดิจิทัล</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ไฟล์ PDF</span>
              </>
            )}
          </button>

          {/* Zoom Controls */}
          <div className="hidden xl:flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 cursor-pointer"
              title="ย่อ (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 w-10 text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 cursor-pointer"
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

      {/* BODY (SIDEBAR + MAIN CANVAS) */}
      <div className="flex flex-grow overflow-hidden relative">
        {/* COLLAPSIBLE SIDEBAR WITH 3 TABS: สารบัญ (TOC), ทุกหน้า (PAGES), บุ๊กมาร์ก (BOOKMARKS) */}
        {sidebarOpen && (
          <aside className="w-64 sm:w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white z-20 shadow-xs">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-200 p-2 gap-1.5 text-xs font-bold bg-slate-50/50">
              <button
                onClick={() => setActiveTab("toc")}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "toc"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>สารบัญ ({bookContent.tableOfContents.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("pages")}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "pages"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>หน้า ({totalPages})</span>
              </button>

              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "bookmarks"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookmarkIcon className="w-3.5 h-3.5" />
                <span>บุ๊กมาร์ก ({bookmarks.length})</span>
              </button>
            </div>

            {/* Sidebar Content Area */}
            <div className="flex-grow overflow-y-auto p-3 space-y-2 bg-slate-50">
              {/* TAB 1: สารบัญ (Table of Contents) */}
              {activeTab === "toc" && (
                <div className="space-y-2">
                  {bookContent.tableOfContents.map((ch, idx) => {
                    const isActive =
                      currentPage >= ch.page &&
                      (idx === bookContent.tableOfContents.length - 1 ||
                        currentPage < bookContent.tableOfContents[idx + 1].page);

                    return (
                      <button
                        key={ch.id || idx}
                        onClick={() => goToPage(ch.page)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? "border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-xs font-extrabold line-clamp-1 ${
                              isActive ? "text-blue-700" : "text-slate-900"
                            }`}
                          >
                            {ch.title}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            หน้า {ch.page}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {ch.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: ทุกหน้า (Thumbnails) */}
              {activeTab === "pages" && (
                <div className="grid grid-cols-2 gap-2.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const pageObj = bookContent.pages.find((pg) => pg.pageNumber === p);

                    return (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`relative flex flex-col items-center p-2 rounded-xl border transition-all text-center cursor-pointer ${
                          currentPage === p
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                        }`}
                      >
                        {/* Visual Thumbnail */}
                        <div className="w-full aspect-[3/4] rounded-lg bg-white shadow-xs border border-slate-200 mb-1.5 flex flex-col p-2 overflow-hidden text-[6px] text-slate-400 select-none">
                          <div className="w-3/4 h-1.5 bg-blue-400 rounded-xs mb-1.5" />
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-slate-200 rounded-xs" />
                            <div className="w-full h-1 bg-slate-200 rounded-xs" />
                            <div className="w-2/3 h-1 bg-slate-200 rounded-xs" />
                          </div>
                          <div className="mt-auto text-right text-[8px] font-bold text-slate-500">
                            {p}
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold truncate max-w-full ${
                            currentPage === p ? "text-blue-600" : "text-slate-700"
                          }`}
                        >
                          {pageObj?.chapterTitle ? `หน้า ${p}` : `หน้า ${p}`}
                        </span>

                        {bookmarks.includes(p) && (
                          <div className="absolute top-1.5 right-1.5 text-amber-500">
                            <BookmarkCheck className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: บุ๊กมาร์ก (Bookmarks) */}
              {activeTab === "bookmarks" && (
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
                    <div className="py-12 text-center text-xs text-slate-500 leading-relaxed">
                      ยังไม่มีบุ๊กมาร์กที่บันทึกไว้
                      <br />
                      กดปุ่ม <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-sm text-[11px] font-mono text-slate-700">B</kbd> หรือไอคอนบุ๊กมาร์กเพื่อบันทึกหน้าปัจจุบัน
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* READING SURFACE */}
        <main
          ref={scrollContainerRef}
          className="flex-grow flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-6 lg:p-8 relative bg-slate-100/90"
        >
          {/* 1. PDF EMBED VIEW (If user switched to PDF stream) */}
          {viewType === "pdf" ? (
            <div
              style={{ width: `${Math.min(100, Math.max(40, zoom))}%` }}
              className="h-full min-h-[600px] flex flex-col items-center justify-center transition-all duration-200 shadow-xl rounded-2xl overflow-hidden border border-slate-200 bg-white"
            >
              <iframe
                src={pdfStreamUrl}
                title={document.title}
                className="w-full h-full border-0 bg-white"
              />
            </div>
          ) : /* 2. HORIZONTAL MODE (เปิดทีละหน้าเหมือนหนังสือ) */
          readingMode === "horizontal" ? (
            <div
              style={{ width: `${Math.min(100, Math.max(45, zoom))}%` }}
              className="max-w-3xl w-full my-auto flex flex-col relative"
            >
              {/* Previous / Next Side Floating Arrows */}
              <button
                onClick={prevPage}
                disabled={currentPage <= 1}
                className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg text-slate-700 hover:text-blue-600 hover:border-blue-300 disabled:opacity-20 disabled:cursor-not-allowed items-center justify-center transition-all cursor-pointer z-20"
                title="หน้าก่อนหน้า (ลูกศรซ้าย)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg text-slate-700 hover:text-blue-600 hover:border-blue-300 disabled:opacity-20 disabled:cursor-not-allowed items-center justify-center transition-all cursor-pointer z-20"
                title="หน้าถัดไป (ลูกศรขวา)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Physical Book Canvas Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 min-h-[580px] flex flex-col justify-between relative overflow-hidden">
                {/* Book Header info */}
                <div className="pb-5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-blue-600 truncate max-w-xs">
                    {document.title}
                  </span>
                  <span className="font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                </div>

                {/* Chapter Title & Subtitle */}
                <div className="my-6">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs mb-2">
                    {activePageData?.chapterTitle || `ตอนที่ ${currentPage}`}
                  </div>

                  {activePageData?.subtitle && (
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {activePageData.subtitle}
                    </h2>
                  )}
                </div>

                {/* Paragraphs */}
                <div className="space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed font-normal flex-grow">
                  {activePageData?.paragraphs?.map((para, pIdx) => (
                    <p key={pIdx} className="text-justify indent-6">
                      {para}
                    </p>
                  ))}

                  {/* Key Takeaways */}
                  {activePageData?.keyPoints && activePageData.keyPoints.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        สาระสำคัญประจำหน้านี้
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-blue-950">
                        {activePageData.keyPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quote Callout */}
                  {activePageData?.quote && (
                    <div className="my-6 p-4 rounded-xl bg-amber-50/60 border-l-4 border-amber-500 text-slate-800 text-xs sm:text-sm italic flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>"{activePageData.quote}"</span>
                    </div>
                  )}
                </div>

                {/* Page Footer */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>ผู้แต่ง: {document.author || "Digital Library"}</span>
                  <span className="font-bold text-slate-900">— {currentPage} —</span>
                </div>
              </div>

              {/* Bottom Quick Page Bar in Horizontal Mode */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
                >
                  ← หน้าก่อนหน้า
                </button>

                <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs text-slate-700 shadow-xs">
                  หน้า {currentPage} / {totalPages}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
                >
                  หน้าถัดไป →
                </button>
              </div>
            </div>
          ) : (
            /* 3. VERTICAL MODE (เลื่อนแนวตั้งเหมือนเว็บตูน ต่อกันยาวๆ) */
            <div
              style={{ width: `${Math.min(100, Math.max(50, zoom))}%` }}
              className="max-w-3xl w-full flex flex-col space-y-6 pb-20"
            >
              {/* Webtoon Info Header */}
              <div className="text-center p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  โหมดเลื่อนแนวตั้ง (Webtoon Continuous Feed)
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  {document.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลื่อนหน้าจอลงเพื่ออ่านเนื้อหาต่อเนื่องทั้งหมด {totalPages} หน้า
                </p>
              </div>

              {/* Continuous Page Stacks */}
              {bookContent.pages.map((pg) => (
                <article
                  key={pg.pageNumber}
                  ref={(el) => {
                    if (el) pageRefs.current.set(pg.pageNumber, el);
                    else pageRefs.current.delete(pg.pageNumber);
                  }}
                  id={`page-${pg.pageNumber}`}
                  className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10 relative"
                >
                  {/* Page Divider / Header */}
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 text-xs">
                    <span className="font-bold text-blue-600 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {pg.chapterTitle}
                    </span>
                    <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      หน้า {pg.pageNumber} / {totalPages}
                    </span>
                  </div>

                  {/* Subtitle */}
                  {pg.subtitle && (
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4">
                      {pg.subtitle}
                    </h3>
                  )}

                  {/* Paragraphs */}
                  <div className="space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed text-justify">
                    {pg.paragraphs.map((para, i) => (
                      <p key={i} className="indent-6">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Key Takeaways */}
                  {pg.keyPoints && pg.keyPoints.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        สาระสำคัญประจำหน้านี้
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-blue-950">
                        {pg.keyPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quote */}
                  {pg.quote && (
                    <div className="my-6 p-4 rounded-xl bg-amber-50/60 border-l-4 border-amber-500 text-slate-800 text-xs sm:text-sm italic flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>"{pg.quote}"</span>
                    </div>
                  )}

                  {/* End of Page Mark */}
                  <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center text-xs text-slate-400 font-bold">
                    — จบหน้า {pg.pageNumber} —
                  </div>
                </article>
              ))}

              {/* End of Document Banner */}
              <div className="text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                  ✓
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  อ่านจบเล่มแล้ว!
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  คุณได้อ่านหนังสือ "{document.title}" ครบทั้ง {totalPages} หน้า
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    กลับไปบนสุด
                  </button>
                  <Link
                    href={`/document/${document.slug || document.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    รายละเอียดหนังสือ
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action / Position Pill (in Vertical Mode: Back to top / quick jump) */}
          {readingMode === "vertical" && viewType === "digital" && (
            <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
              <button
                onClick={() => {
                  scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="p-3 rounded-full bg-white text-slate-700 hover:text-blue-600 border border-slate-300 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                title="เลื่อนกลับไปด้านบนสุด"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
