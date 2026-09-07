"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Tv,
  Flame,
  Crown,
  Compass,
  Atom,
  GraduationCap,
  FlaskConical,
  Code,
  Briefcase,
  Landmark,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

interface BookCoverProps {
  title: string;
  author?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  pageCount?: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "responsive";
}

interface ColorPalette {
  bgGradient: string;
  accentBadge: string;
  badgeText: string;
  textColor: string;
  subtitleColor: string;
  spineColor: string;
  borderTint: string;
  patternSvg: string;
  icon: any;
}

export function BookCover({
  title,
  author,
  categoryName,
  categorySlug,
  pageCount,
  className = "",
  size = "responsive",
}: BookCoverProps) {
  // Determine color theme based on category slug or title hash
  const palette: ColorPalette = useMemo(() => {
    const slug = (categorySlug || "").toLowerCase();

    if (slug.includes("anime") || slug.includes("manga")) {
      return {
        bgGradient: "from-rose-600 via-pink-600 to-indigo-700",
        accentBadge: "bg-white/90",
        badgeText: "text-rose-700",
        textColor: "text-white",
        subtitleColor: "text-rose-100",
        spineColor: "bg-black/25",
        borderTint: "border-rose-400/30",
        patternSvg: "dots",
        icon: Tv,
      };
    }
    if (slug.includes("horror") || slug.includes("ghost")) {
      return {
        bgGradient: "from-slate-900 via-red-950 to-neutral-900",
        accentBadge: "bg-red-600",
        badgeText: "text-white",
        textColor: "text-red-50",
        subtitleColor: "text-red-200",
        spineColor: "bg-black/40",
        borderTint: "border-red-600/30",
        patternSvg: "cross",
        icon: Flame,
      };
    }
    if (slug.includes("myth") || slug.includes("legend")) {
      return {
        bgGradient: "from-amber-600 via-yellow-600 to-stone-900",
        accentBadge: "bg-yellow-100",
        badgeText: "text-amber-900",
        textColor: "text-amber-50",
        subtitleColor: "text-amber-200",
        spineColor: "bg-black/25",
        borderTint: "border-yellow-400/30",
        patternSvg: "circles",
        icon: Crown,
      };
    }
    if (slug.includes("novel") || slug.includes("fiction")) {
      return {
        bgGradient: "from-emerald-700 via-teal-800 to-slate-900",
        accentBadge: "bg-emerald-100",
        badgeText: "text-emerald-900",
        textColor: "text-emerald-50",
        subtitleColor: "text-emerald-200",
        spineColor: "bg-black/25",
        borderTint: "border-emerald-400/30",
        patternSvg: "diagonal",
        icon: BookOpen,
      };
    }
    if (slug.includes("science") || slug.includes("space")) {
      return {
        bgGradient: "from-blue-700 via-indigo-800 to-cyan-900",
        accentBadge: "bg-cyan-100",
        badgeText: "text-cyan-900",
        textColor: "text-cyan-50",
        subtitleColor: "text-cyan-200",
        spineColor: "bg-black/25",
        borderTint: "border-cyan-400/30",
        patternSvg: "grid",
        icon: Atom,
      };
    }
    if (slug.includes("education") || slug.includes("textbook")) {
      return {
        bgGradient: "from-indigo-600 via-blue-700 to-slate-800",
        accentBadge: "bg-indigo-100",
        badgeText: "text-indigo-900",
        textColor: "text-indigo-50",
        subtitleColor: "text-indigo-200",
        spineColor: "bg-black/25",
        borderTint: "border-indigo-400/30",
        patternSvg: "dots",
        icon: GraduationCap,
      };
    }
    if (slug.includes("experiment") || slug.includes("research")) {
      return {
        bgGradient: "from-orange-600 via-amber-700 to-stone-900",
        accentBadge: "bg-amber-100",
        badgeText: "text-amber-900",
        textColor: "text-amber-50",
        subtitleColor: "text-amber-200",
        spineColor: "bg-black/25",
        borderTint: "border-amber-400/30",
        patternSvg: "grid",
        icon: FlaskConical,
      };
    }
    if (slug.includes("coding") || slug.includes("programming")) {
      return {
        bgGradient: "from-violet-700 via-purple-800 to-indigo-950",
        accentBadge: "bg-violet-100",
        badgeText: "text-violet-900",
        textColor: "text-violet-50",
        subtitleColor: "text-violet-200",
        spineColor: "bg-black/30",
        borderTint: "border-violet-400/30",
        patternSvg: "matrix",
        icon: Code,
      };
    }
    if (slug.includes("business") || slug.includes("finance")) {
      return {
        bgGradient: "from-sky-700 via-blue-800 to-slate-900",
        accentBadge: "bg-sky-100",
        badgeText: "text-sky-900",
        textColor: "text-sky-50",
        subtitleColor: "text-sky-200",
        spineColor: "bg-black/25",
        borderTint: "border-sky-400/30",
        patternSvg: "diagonal",
        icon: Briefcase,
      };
    }
    if (slug.includes("history") || slug.includes("culture")) {
      return {
        bgGradient: "from-stone-700 via-amber-800 to-stone-900",
        accentBadge: "bg-stone-100",
        badgeText: "text-stone-900",
        textColor: "text-stone-50",
        subtitleColor: "text-stone-200",
        spineColor: "bg-black/30",
        borderTint: "border-stone-400/30",
        patternSvg: "circles",
        icon: Landmark,
      };
    }
    if (slug.includes("self") || slug.includes("growth")) {
      return {
        bgGradient: "from-fuchsia-600 via-purple-700 to-indigo-800",
        accentBadge: "bg-fuchsia-100",
        badgeText: "text-fuchsia-900",
        textColor: "text-fuchsia-50",
        subtitleColor: "text-fuchsia-200",
        spineColor: "bg-black/25",
        borderTint: "border-fuchsia-400/30",
        patternSvg: "dots",
        icon: HeartHandshake,
      };
    }

    // Default universal palette (Royal Deep Blue & Sapphire)
    return {
      bgGradient: "from-blue-600 via-indigo-700 to-slate-900",
      accentBadge: "bg-blue-100",
      badgeText: "text-blue-900",
      textColor: "text-white",
      subtitleColor: "text-blue-100",
      spineColor: "bg-black/25",
      borderTint: "border-blue-400/30",
      patternSvg: "dots",
      icon: Compass,
    };
  }, [categorySlug]);

  const Icon = palette.icon;

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br ${palette.bgGradient} p-4 sm:p-5 flex flex-col justify-between select-none shadow-md border ${palette.borderTint} ${className}`}
    >
      {/* 1. Authentic Book Spine Effect (left fold) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-3.5 sm:w-4 ${palette.spineColor} shadow-r z-10`}
      />
      <div className="absolute left-3.5 sm:left-4 top-0 bottom-0 w-[1px] bg-white/20 z-10" />

      {/* 2. Subtle Background Geometric Art */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 200 260">
          <circle cx="100" cy="130" r="80" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="100" cy="130" r="50" stroke="white" strokeWidth="1" strokeDasharray="4 4" fill="none" />
          <rect x="50" y="80" width="100" height="100" stroke="white" strokeWidth="1" fill="none" transform="rotate(45 100 130)" />
        </svg>
      </div>

      {/* 3. Top Header: Category Tag & Icon */}
      <div className="relative z-20 pl-3 flex items-start justify-between gap-2">
        <span
          className={`inline-block px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${palette.accentBadge} ${palette.badgeText} shadow-xs truncate max-w-[170px]`}
        >
          {categoryName || "Digital Edition"}
        </span>

        <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center text-white/90">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 4. Center: Bold Book Title */}
      <div className="relative z-20 pl-3 my-auto py-2">
        <h2
          className={`font-black tracking-tight ${palette.textColor} text-base sm:text-lg md:text-xl leading-tight line-clamp-4 drop-shadow-xs`}
        >
          {title}
        </h2>

        {/* Decorative divider */}
        <div className="w-12 h-1 bg-white/50 rounded-full mt-2.5" />
      </div>

      {/* 5. Bottom Footer: Author & Edition Specs */}
      <div className="relative z-20 pl-3 pt-2 border-t border-white/15 flex items-end justify-between text-xs">
        <div className="min-w-0 pr-2">
          <span className={`block text-[10px] uppercase tracking-wider font-semibold opacity-75 ${palette.subtitleColor}`}>
            ผู้แต่ง / เขียนโดย
          </span>
          <p className={`font-bold text-xs truncate ${palette.textColor}`}>
            {author || "Digital Library"}
          </p>
        </div>

        {pageCount && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white flex-shrink-0 backdrop-blur-xs">
            {pageCount} หน้า
          </span>
        )}
      </div>
    </div>
  );
}
