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
  Sparkles,
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
  const [language, setLanguage] = useState("en");
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
      setErrorMessage("Please select a valid PDF document (.pdf)");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File size exceeds 100MB limit");
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
      setErrorMessage("Cover must be an image file (PNG, JPG, WebP)");
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
      setErrorMessage("Please select a PDF document first");
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
      // Simulate progress progression for smooth UX
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
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setUploadState("COMPLETED");
      setUploadedDoc(data.document);
    } catch (err: any) {
      setUploadState("FAILED");
      setErrorMessage(err.message || "An unexpected error occurred during upload");
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
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Upload Document
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add publications and books to the library archive with automated PDF metadata processing.
        </p>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUCCESS CARD */}
      {uploadState === "COMPLETED" && uploadedDoc && (
        <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Document Uploaded & Processed Successfully!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            "{uploadedDoc.title}" is now archived, indexed, and available in the library.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={`/document/${uploadedDoc.slug || uploadedDoc.id}`}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
            <Link
              href={`/read/${uploadedDoc.slug || uploadedDoc.id}`}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Read in Viewer
            </Link>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD PROGRESS MODAL / OVERLAY */}
      {(uploadState === "UPLOADING" || uploadState === "PROCESSING") && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {uploadState === "UPLOADING" ? "Uploading Document..." : "Processing & Indexing PDF..."}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {uploadState === "UPLOADING"
                ? "Streaming document chunks to storage layer..."
                : "Validating magic bytes, extracting page count, and generating vector preview..."}
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {progress}% Completed
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
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]"
                : selectedFile
                ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                : "border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-indigo-400"
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
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(selectedFile.size)} • PDF Ready for Upload
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="inline-block mt-2 text-xs font-semibold text-rose-500 hover:underline"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                    Drag & Drop your document here
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Or click to browse PDF files (Up to 100MB)
                  </p>
                </div>
                <span className="inline-block px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm">
                  Choose File
                </span>
              </div>
            )}
          </div>

          {/* METADATA FIELDS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Document Metadata & Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Clean Architecture & Patterns"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Author / Organization
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g., Robert C. Martin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., Architecture, Microservices, Cloud"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description & Summary
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a concise description or synopsis of the document..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Custom Cover Upload (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Cover Image (Optional — automated cover will be generated if skipped)
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
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
                {coverPreview && (
                  <div className="w-12 h-16 rounded-md overflow-hidden border border-slate-300">
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-indigo-600"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Publish Immediately
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-indigo-600"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Allow PDF Download
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-indigo-600"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Mark as Featured Pick
                </span>
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploadState === "UPLOADING" || uploadState === "PROCESSING"}
              className="py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Upload & Process Document
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
