import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://library-satetapongsa.vercel.app"),
  title: "Digital Library — อ่านหนังสือและเอกสารออนไลน์ได้ทุกที่",
  description:
    "คลังหนังสือและเอกสารออนไลน์ อ่านฟรีทุกที่ทุกเวลา รองรับทั้งอนิเมะ มังงะ นิยาย เรื่องผี วิทยาศาสตร์ การเรียน และธุรกิจ",
  keywords: [
    "digital library",
    "pdf reader",
    "อ่านหนังสือออนไลน์",
    "อ่านการ์ตูน",
    "นิยาย",
    "วิทยาศาสตร์",
    "ebook viewer",
  ],
  authors: [{ name: "satetapongsa" }],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Digital Library — อ่านหนังสือและเอกสารออนไลน์ได้ทุกที่",
    description:
      "คลังหนังสือและเอกสารออนไลน์ อ่านฟรีทุกที่ทุกเวลา ด้วยระบบอ่าน PDF ประสิทธิภาพสูง",
    url: "https://library-satetapongsa.vercel.app",
    siteName: "Digital Library",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Digital Library Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Digital Library — อ่านหนังสือและเอกสารออนไลน์ได้ทุกที่",
    description: "คลังหนังสือและเอกสารออนไลน์ อ่านฟรีทุกที่ทุกเวลา",
    images: ["/logo.svg"],
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
