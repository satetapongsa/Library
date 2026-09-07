import Link from "next/link";
import { LibraryService } from "@/lib/data/libraryService";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  FileQuestion,
  Eye,
  HardDrive,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Shield,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [analytics, allDocsRes, recentRes, topRes] = await Promise.all([
    LibraryService.getAnalyticsSummary(),
    LibraryService.getDocuments({ includeUnpublished: true, limit: 1000 }),
    LibraryService.getDocuments({ includeUnpublished: true, limit: 6, sort: "newest" }),
    LibraryService.getDocuments({ limit: 5, sort: "popular" }),
  ]);

  const totalDocs = analytics.totalDocs;
  const publishedDocs = analytics.publishedDocs;
  const draftDocs = totalDocs - publishedDocs;
  const viewsAggregate = { _sum: { viewCount: analytics.totalViews } };
  const totalFileSize = allDocsRes.documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const storageAggregate = { _sum: { fileSize: totalFileSize } };
  const recentDocs = recentRes.documents;
  const topDocs = topRes.documents;

  const stats = [
    {
      label: "จำนวนหนังสือทั้งหมด",
      value: totalDocs,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "เผยแพร่แล้ว (พร้อมอ่าน)",
      value: publishedDocs,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "แบบร่าง / ซ่อนไว้",
      value: draftDocs,
      icon: FileQuestion,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "จำนวนการเข้าอ่านสะสม",
      value: (viewsAggregate._sum.viewCount || 0).toLocaleString(),
      icon: Eye,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "พื้นที่จัดเก็บที่ใช้",
      value: formatBytes(storageAggregate._sum.fileSize || 0),
      icon: HardDrive,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-600 text-xs font-bold">
            <Shield className="w-4 h-4" />
            <span>Digital Library Management Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            ภาพรวมระบบห้องสมุดดิจิทัล
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            ตรวจสอบสถานะการเผยแพร่ พื้นที่จัดเก็บ และสถิติการเข้าอ่านของผู้อ่าน
          </p>
        </div>

        <Link
          href="/admin/upload"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-white" />
          อัปโหลดหนังสือใหม่ (Upload PDF)
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-600">
                  {s.label}
                </span>
                <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* TWO COLUMN SECTION: TOP VIEWED & RECENT UPLOADS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Viewed Documents */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">หนังสือยอดนิยมที่มีผู้อ่านมากที่สุด</h2>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              ดูสถิติทั้งหมด →
            </Link>
          </div>

          <div className="space-y-3">
            {topDocs.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {doc.title}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {doc.category?.name || "ทั่วไป"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 flex-shrink-0 ml-2">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>{doc.viewCount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads Table */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900">หนังสือที่อัปโหลดล่าสุด</h2>
            <Link
              href="/admin/documents"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด ({totalDocs}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                  <th className="p-3">ชื่อหนังสือ</th>
                  <th className="p-3">หมวดหมู่</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3">วันที่</th>
                  <th className="p-3 text-right">เปิดดู</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">
                        {doc.title}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {doc.pageCount} หน้า • {formatBytes(doc.fileSize)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {doc.category?.name}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.isPublished ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/document/${doc.slug || doc.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-blue-600 inline-block"
                        title="ดูหน้ารายละเอียด"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
