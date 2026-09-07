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
      label: "Total Documents",
      value: totalDocs,
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      label: "Published & Ready",
      value: publishedDocs,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      label: "Drafts / Hidden",
      value: draftDocs,
      icon: FileQuestion,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: "Total Read Views",
      value: (viewsAggregate._sum.viewCount || 0).toLocaleString(),
      icon: Eye,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-950/50",
    },
    {
      label: "Storage Consumed",
      value: formatBytes(storageAggregate._sum.fileSize || 0),
      icon: HardDrive,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>Digital Library Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Library Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1">
            Monitor system storage, publication status, and community reader engagement.
          </p>
        </div>

        <Link
          href="/admin/upload"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Upload New Document
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {s.label}
                </span>
                <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* TWO COLUMN SECTION: TOP VIEWED & RECENT UPLOADS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Viewed Documents */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold">Most Read Publications</h2>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Analytics →
            </Link>
          </div>

          <div className="space-y-3">
            {topDocs.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {doc.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {doc.category?.name || "General"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0 ml-2">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{doc.viewCount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold">Recent Uploads</h2>
            <Link
              href="/admin/documents"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all ({totalDocs}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {doc.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {doc.pageCount}p • {formatBytes(doc.fileSize)}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {doc.category?.name}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.isPublished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {doc.isPublished ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/document/${doc.slug || doc.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 inline-block"
                        title="View Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
