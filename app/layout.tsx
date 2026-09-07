import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Library — อ่านหนังสือและเอกสารออนไลน์ได้ทุกที่",
  description:
    "Modern digital library platform with high-performance in-browser reader, PDF indexing, instant streaming, and comprehensive document catalog.",
  keywords: [
    "digital library",
    "pdf reader",
    "online documents",
    "books",
    "ebook viewer",
    "technical manuals",
  ],
  authors: [{ name: "Digital Library Team" }],
  openGraph: {
    title: "Digital Library — อ่านหนังสือและเอกสารออนไลน์ได้ทุกที่",
    description:
      "Modern digital library platform with high-performance in-browser reader, PDF indexing, and instant streaming.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100">{children}</body>
    </html>
  );
}
