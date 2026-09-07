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
    <html lang="th" className="h-full light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-slate-900">{children}</body>
    </html>
  );
}
