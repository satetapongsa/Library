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
  Search,
  Sidebar as SidebarIcon,
  Moon,
  Sun,
  Layers,
  RotateCw,
  Check,
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
  const [zoom, setZoom] = useState(100); // 75, 100, 125, 150, 200
  const [fitMode, setFitMode] = useState<"custom" | "width" | "page">("custom");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"pages" | "bookmarks">("pages");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isReaderDark, setIsReaderDark] = useState(true);

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
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const zoomIn = () => {
    setFitMode("custom");
    setZoom((prev) => Math.min(250, prev + 25));
  };

  const zoomOut = () => {
    setFitMode("custom");
    setZoom((prev) => Math.max(50, prev - 25));
  };

  const toggleFullscreen = () => {
    if (!documentRefAvailable()) return;
    if (!window.document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const documentRefAvailable = () => typeof window !== "undefined";

  // Keyboard Shortcuts (Arrow keys, +, -, F, B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in search or page input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevPage();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleBookmark();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage, toggleBookmark]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col h-screen w-full select-none overflow-hidden transition-colors ${
        isReaderDark ? "bg-[#0b0f19] text-slate-100" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* TOP TOOLBAR */}
      <header
        className={`h-14 px-4 flex items-center justify-between border-b z-30 transition-colors ${
          isReaderDark
            ? "bg-slate-900/95 border-slate-800 text-slate-200"
            : "bg-white/95 border-slate-200 text-slate-700 shadow-xs"
        }`}
      >
        {/* Left: Back & Sidebar Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/document/${document.slug || document.id}`}
            className="p-2 rounded-xl hover:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Back to Document Details"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl transition-colors ${
              sidebarOpen
                ? "bg-indigo-600/20 text-indigo-400"
                : "text-slate-400 hover:bg-slate-800/50"
            }`}
            title="Toggle Thumbnails Sidebar"
          >
            <SidebarIcon className="w-5 h-5" />
          </button>

          <div className="hidden sm:block truncate max-w-md">
            <h1 className="text-sm font-bold truncate leading-tight">
              {document.title}
            </h1>
            <span className="text-[11px] text-slate-400">
              Online Document Viewer • Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Page (Arrow Left)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
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
              className={`w-12 text-center py-1 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isReaderDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-100 border-slate-300 text-slate-900"
              }`}
            />
            <span className="text-slate-400">/ {totalPages}</span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Page (Arrow Right)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Zoom, Bookmark, Dark/Light, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 border-r border-slate-700/60 pr-2 mr-1">
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-400 w-11 text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl transition-colors ${
              isBookmarked
                ? "text-amber-400 bg-amber-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            title={isBookmarked ? "Remove Bookmark (B)" : "Bookmark Page (B)"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <BookmarkIcon className="w-4 h-4" />
            )}
          </button>

          {/* Theme Switcher for Reader */}
          <button
            onClick={() => setIsReaderDark(!isReaderDark)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Toggle Reader Contrast"
          >
            {isReaderDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Fullscreen (F)"
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
          <aside
            className={`w-64 sm:w-72 flex-shrink-0 flex flex-col border-r z-20 transition-colors ${
              isReaderDark
                ? "bg-slate-900/90 border-slate-800"
                : "bg-white/95 border-slate-200"
            }`}
          >
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-800/80 p-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("pages")}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "pages"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Pages ({totalPages})
              </button>
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "bookmarks"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <BookmarkIcon className="w-3.5 h-3.5" />
                Bookmarks ({bookmarks.length})
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-grow overflow-y-auto p-3 space-y-2">
              {activeTab === "pages" ? (
                // Thumbnail grid / list
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`relative flex flex-col items-center p-2 rounded-xl border transition-all text-center group cursor-pointer ${
                        currentPage === p
                          ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/50"
                          : isReaderDark
                          ? "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {/* Visual Thumbnail representation */}
                      <div className="w-full aspect-[3/4] rounded-lg bg-white shadow-xs border border-slate-200/50 mb-1.5 flex flex-col p-1.5 overflow-hidden text-[6px] text-slate-300 select-none">
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

                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-400">
                        Page {p}
                      </span>

                      {bookmarks.includes(p) && (
                        <div className="absolute top-1.5 right-1.5 text-amber-400">
                          <BookmarkCheck className="w-3.5 h-3.5" />
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
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          currentPage === p
                            ? "border-indigo-500 bg-indigo-500/10"
                            : isReaderDark
                            ? "border-slate-800 hover:bg-slate-800/60"
                            : "border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookmarkIcon className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-semibold">Page {p}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Jump →</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No bookmarks saved yet.
                      <br />
                      Press <kbd className="px-1 py-0.5 bg-slate-800 rounded-xs text-[10px]">B</kbd> or click the bookmark icon to save this page.
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
          className="flex-grow flex flex-col items-center justify-start overflow-auto p-4 relative"
        >
          {/* Main Embedded Viewer Container */}
          <div
            style={{ width: `${Math.min(100, Math.max(40, zoom))}%` }}
            className="h-full flex flex-col items-center justify-center transition-all duration-200 shadow-2xl rounded-2xl overflow-hidden border border-slate-700/50 bg-white"
          >
            <iframe
              src={pdfStreamUrl}
              title={document.title}
              className="w-full h-full border-0"
            />
          </div>

          {/* Floating Navigation Pill at Bottom */}
          <div className="absolute bottom-6 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-white text-xs">
            <button
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
