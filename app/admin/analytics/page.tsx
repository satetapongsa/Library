"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Eye,
  HardDrive,
  BookOpen,
  Calendar,
  Layers,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface AnalyticsData {
  overview: {
    totalDocuments: number;
    publishedDocuments: number;
    draftDocuments: number;
    totalViews: number;
    totalStorageBytes: number;
  };
  topDocuments: {
    id: string;
    title: string;
    author: string | null;
    viewCount: number;
    category: { name: string };
  }[];
  categoryDistribution: {
    name: string;
    count: number;
  }[];
  viewsPerDay: {
    date: string;
    views: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading analytics telemetry...
      </div>
    );
  }

  const maxDailyViews = Math.max(1, ...data.viewsPerDay.map((d) => d.views));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Analytics & Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time reading metrics, visitor traffic logs, and library repository growth.
        </p>
      </div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Reading Views
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {data.overview.totalViews.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Documents
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {data.overview.publishedDocuments}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Storage Utilized
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatBytes(data.overview.totalStorageBytes)}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Topics & Categories
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {data.categoryDistribution.length}
          </div>
        </div>
      </div>

      {/* VIEWS PER DAY BAR CHART */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Reader Engagement Traffic (Last 7 Days)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily document reading sessions and page views
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Telemetry</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-60 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-slate-200 dark:border-slate-800">
          {data.viewsPerDay.map((d) => {
            const heightPercent = Math.round((d.views / maxDailyViews) * 100);

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-10">
                  {d.views} views • {d.date}
                </div>

                <div
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500 group-hover:from-indigo-500 group-hover:to-violet-400 transition-all duration-300 shadow-sm"
                  style={{ height: `${Math.max(8, heightPercent)}%` }}
                />

                <span className="text-[10px] sm:text-xs text-slate-400 mt-2 rotate-0 truncate max-w-full">
                  {d.date.split("-").slice(1).join("/")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN: LEADERBOARD & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Documents */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Top 5 Publications by Views
          </h2>

          <div className="space-y-3">
            {data.topDocuments.map((doc, i) => (
              <div
                key={doc.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 w-4">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
                      {doc.title}
                    </p>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {doc.category?.name} • {doc.author || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-2">
                  {doc.viewCount.toLocaleString()} views
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-500" />
            Catalog Category Distribution
          </h2>

          <div className="space-y-3">
            {data.categoryDistribution.map((cat) => {
              const pct = Math.round(
                (cat.count / Math.max(1, data.overview.totalDocuments)) * 100
              );

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-slate-400">
                      {cat.count} books ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
