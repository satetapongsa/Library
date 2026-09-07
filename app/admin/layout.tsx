"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  FolderTree,
  BarChart3,
  LogOut,
  BookOpen,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "ภาพรวม (Overview)", icon: LayoutDashboard, exact: true },
    { href: "/admin/documents", label: "จัดการเอกสาร (Documents)", icon: FileText },
    { href: "/admin/upload", label: "อัปโหลดหนังสือ (Upload)", icon: UploadCloud },
    { href: "/admin/categories", label: "หมวดหมู่ (Categories)", icon: FolderTree },
    { href: "/admin/analytics", label: "สถิติการอ่าน (Analytics)", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <ThemeToggle />

      {/* ADMIN SIDEBAR */}
      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-slate-200 bg-white">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block">Digital Library</span>
              <span className="text-[11px] text-blue-600 font-bold block -mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          >
            <span>กลับสู่หน้าเว็บหลัก</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200 bg-white flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="md:hidden font-bold text-sm text-slate-900">Admin Console</span>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>ผู้ดูแลระบบ (Admin)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Links for mobile */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/admin"
                className="text-xs font-bold text-slate-700 hover:text-blue-600"
              >
                ภาพรวม
              </Link>
              <Link
                href="/admin/upload"
                className="text-xs font-bold text-blue-600"
              >
                อัปโหลด
              </Link>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none">System Admin</span>
                <span className="text-[11px] text-slate-500">admin@digitallibrary.local</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-grow p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
