"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
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
      <div className="p-12 text-center text-slate-500 text-xs">
        กำลังโหลดข้อมูลสถิติ...
      </div>
    );
  }

  const maxDailyViews = Math.max(1, ...data.viewsPerDay.map((d) => d.views));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          สถิติและการอ่าน (Analytics & Telemetry)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          ติดตามยอดการอ่านรายวัน ความนิยมของเอกสาร และการเติบโตของคลังหนังสือ
        </p>
      </div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">
              ยอดการอ่านสะสม
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {data.overview.totalViews.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">
              หนังสือที่เผยแพร่
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {data.overview.publishedDocuments} เล่ม
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">
              พื้นที่จัดเก็บที่ใช้
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatBytes(data.overview.totalStorageBytes)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">
              จำนวนหมวดหมู่
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {data.categoryDistribution.length} หมวด
          </div>
        </div>
      </div>

      {/* VIEWS PER DAY BAR CHART */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              สถิติการเข้าอ่าน 7 วันย้อนหลัง (Reader Traffic)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              จำนวนครั้งการเปิดอ่านเอกสารรายวัน
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Telemetry</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-60 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-slate-200">
          {data.viewsPerDay.map((d) => {
            const heightPercent = Math.round((d.views / maxDailyViews) * 100);

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-10">
                  {d.views} ครั้ง • {d.date}
                </div>

                <div
                  className="w-full max-w-[48px] rounded-t-xl bg-blue-600 group-hover:bg-blue-700 transition-all duration-300 shadow-xs"
                  style={{ height: `${Math.max(10, heightPercent)}%` }}
                />

                <span className="text-[11px] font-bold text-slate-600 mt-2 truncate max-w-full">
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
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            5 อันดับหนังสือที่มีผู้อ่านมากที่สุด
          </h2>

          <div className="space-y-3">
            {data.topDocuments.map((doc, i) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-bold text-xs text-blue-600 w-4">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-slate-900">
                      {doc.title}
                    </p>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {doc.category?.name} • {doc.author || "ไม่ระบุผู้แต่ง"}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-800 pl-2">
                  {doc.viewCount.toLocaleString()} ครั้ง
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            สัดส่วนหนังสือตามหมวดหมู่
          </h2>

          <div className="space-y-3">
            {data.categoryDistribution.map((cat) => {
              const pct = Math.round(
                (cat.count / Math.max(1, data.overview.totalDocuments)) * 100
              );

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{cat.name}</span>
                    <span className="text-slate-500">
                      {cat.count} เล่ม ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
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
