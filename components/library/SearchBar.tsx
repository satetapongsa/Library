"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface SearchSuggestion {
  id: string;
  slug: string;
  title: string;
  author?: string | null;
  category?: { name: string } | null;
  pageCount: number;
}

export function SearchBar({
  placeholder = "ค้นหาชื่อหนังสือ, ผู้แต่ง, หมวดหมู่, หัวข้อ...",
  className = "",
  initialQuery = "",
}: {
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced live suggestion fetch
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/documents?q=${encodeURIComponent(query.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.documents || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search suggestion error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/library?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/library");
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="ล้างข้อความ"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            ค้นหา
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-2.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 bg-slate-50">
            เอกสารที่ค้นพบ
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                href={`/document/${item.slug || item.id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 hover:bg-blue-50/60 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {item.author || "ไม่ระบุผู้แต่ง"} {item.category ? `• ${item.category.name}` : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0 font-medium">
                  {item.pageCount} หน้า
                </span>
              </Link>
            ))}
          </div>

          <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
            <Link
              href={`/library?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              ดูผลลัพธ์ทั้งหมดสำหรับ "{query}" <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
