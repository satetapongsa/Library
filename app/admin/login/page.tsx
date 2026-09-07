"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Shield, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("admin@digitallibrary.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">Digital Library</span>
        </Link>
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600">
          <Shield className="w-4 h-4" />
          <span>ระบบจัดการผู้ดูแล (Admin Portal)</span>
        </div>
      </div>

      {/* Login Box */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 mb-1">เข้าสู่ระบบผู้ดูแล</h2>
        <p className="text-xs text-slate-500 mb-6">
          กรอกข้อมูลเพื่อจัดการคลังหนังสือ อัปโหลดไฟล์ และดูสถิติ
        </p>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700">
              อีเมลแอดมิน (Admin Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@digitallibrary.local"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* Hint for demonstration */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
            💡 <strong>ข้อมูลทดสอบระบบ:</strong>
            <br />
            Email: <code className="font-mono font-bold">admin@digitallibrary.local</code>
            <br />
            Password: <code className="font-mono font-bold">admin123</code>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>เข้าสู่ระบบ Dashboard</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-blue-600 font-bold"
          >
            ← กลับสู่หน้าหลัก (Public Library)
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900">
      <Suspense fallback={<div className="text-slate-500 text-xs">กำลังโหลด...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
