"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  BookOpen,
  Eye,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
}

type UploadState = "IDLE" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";

export default function AdminUploadPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("th");
  const [isPublished, setIsPublished] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Status & Progress
  const [uploadState, setUploadState] = useState<UploadState>("IDLE");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState<{ id: string; slug: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Handle PDF file selection
  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("กรุณาเลือกไฟล์ PDF (.pdf) เท่านั้น");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("ขนาดไฟล์เกินขีดจำกัด 100MB");
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);

    // Auto-fill title from filename if title is empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Cover file
  const handleCoverSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("หน้าปกต้องเป็นไฟล์รูปภาพ (PNG, JPG, WebP)");
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Submit Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("กรุณาเลือกไฟล์เอกสาร PDF ก่อน");
      return;
    }

    setErrorMessage("");
    setUploadState("UPLOADING");
    setProgress(30);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (coverFile) formData.append("cover", coverFile);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("tags", tags);
    formData.append("language", language);
    formData.append("isPublished", isPublished.toString());
    formData.append("allowDownload", allowDownload.toString());
    formData.append("isFeatured", isFeatured.toString());

    try {
      const progressTimer = setTimeout(() => {
        setProgress(75);
        setUploadState("PROCESSING");
      }, 500);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearTimeout(progressTimer);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "การอัปโหลดล้มเหลว");
      }

      setProgress(100);
      setUploadState("COMPLETED");
      setUploadedDoc(data.document);
    } catch (err: any) {
      setUploadState("FAILED");
      setErrorMessage(err.message || "เกิดข้อผิดพลาดระหว่างการอัปโหลด");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setTitle("");
    setAuthor("");
    setDescription("");
    setTags("");
    setUploadState("IDLE");
    setProgress(0);
    setUploadedDoc(null);
    setErrorMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          อัปโหลดหนังสือหรือเอกสาร (Upload PDF)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          เพิ่มหนังสือใหม่เข้าสู่คลังเอกสาร พร้อมระบบสกัดหน้าปกและข้อมูลจำเพาะอัตโนมัติ
        </p>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUCCESS CARD */}
      {uploadState === "COMPLETED" && uploadedDoc && (
        <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            อัปโหลดและประมวลผลไฟล์สำเร็จแล้ว!
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            หนังสือ "{uploadedDoc.title}" ถูกจัดเก็บและพร้อมเปิดอ่านบนคลังหนังสือออนไลน์แล้ว
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={`/document/${uploadedDoc.slug || uploadedDoc.id}`}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              ดูหน้ารายละเอียด
            </Link>
            <Link
              href={`/read/${uploadedDoc.slug || uploadedDoc.id}`}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold text-xs shadow-xs hover:bg-slate-50 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              เปิดอ่านออนไลน์
            </Link>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              อัปโหลดเล่มอื่นเพิ่ม
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD PROGRESS MODAL / OVERLAY */}
      {(uploadState === "UPLOADING" || uploadState === "PROCESSING") && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {uploadState === "UPLOADING" ? "กำลังอัปโหลดเอกสาร..." : "กำลังประมวลผลและจัดทำดัชนี PDF..."}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {uploadState === "UPLOADING"
                ? "กำลังส่งข้อมูลไฟล์ไปยังระบบพื้นที่จัดเก็บ..."
                : "ตรวจสอบ Magic bytes สกัดจำนวนหน้า และสร้างเวกเตอร์พรีวิว..."}
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-blue-600">
            {progress}% สำเร็จ
          </span>
        </div>
      )}

      {/* FORM */}
      {uploadState !== "COMPLETED" && (
        <form onSubmit={handleUpload} className="space-y-6">
          {/* DROPZONE */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
              isDragging
                ? "border-blue-600 bg-blue-50"
                : selectedFile
                ? "border-emerald-500 bg-emerald-50/50"
                : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-white"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-slate-600">
                  {formatBytes(selectedFile.size)} • พร้อมอัปโหลด
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="inline-block mt-2 text-xs font-bold text-rose-600 hover:underline"
                >
                  เปลี่ยนไฟล์
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    ลากไฟล์ PDF มาวางที่นี่
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    หรือคลิกเพื่อเลือกไฟล์จากเครื่อง (รองรับขนาดสูงสุด 100MB)
                  </p>
                </div>
                <span className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs">
                  เลือกไฟล์ PDF
                </span>
              </div>
            )}
          </div>

          {/* METADATA FIELDS */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              ข้อมูลหนังสือและการตั้งค่า
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ชื่อหนังสือ / เอกสาร *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น คู่มือการเขียนโปรแกรม Next.js"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ชื่อผู้แต่ง / ผู้จัดทำ
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="เช่น อ.สมชาย หรือ Digital Library"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  หมวดหมู่ *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="เช่น มังงะ, การ์ตูน, ความรู้"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                รายละเอียดและเรื่องย่อ
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุคำอธิบายหรือเนื้อหาโดยย่อของหนังสือ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Custom Cover Upload (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                รูปภาพหน้าปก (ไม่บังคับ — ระบบจะสร้างปกเวกเตอร์สวยงามให้อัตโนมัติหากไม่ใส่)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCoverSelect(e.target.files[0]);
                    }
                  }}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {coverPreview && (
                  <div className="w-12 h-16 rounded-md overflow-hidden border border-slate-300">
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-800">
                  เผยแพร่ทันที (พร้อมอ่าน)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-800">
                  อนุญาตให้ดาวน์โหลดไฟล์ PDF
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-800">
                  ปักหมุดเป็นหนังสือแนะนำ
                </span>
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploadState === "UPLOADING" || uploadState === "PROCESSING"}
              className="py-3.5 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              อัปโหลดและจัดเก็บหนังสือ
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
