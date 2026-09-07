"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Trash2,
  Edit2,
  BookOpen,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

interface DocItem {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  categoryId: string;
  category: { id: string; name: string };
  pageCount: number;
  fileSize: number;
  viewCount: number;
  isPublished: boolean;
  allowDownload: boolean;
  isFeatured: boolean;
  status: string;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Edit Modal State
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAllowDownload, setEditAllowDownload] = useState(true);
  const [editIsFeatured, setEditIsFeatured] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        all: "true",
        sort,
        limit: "50",
      });
      if (search) params.set("q", search);
      if (selectedCategory !== "all") params.set("category", selectedCategory);

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let docs: DocItem[] = data.documents || [];

        if (selectedStatus === "published") {
          docs = docs.filter((d) => d.isPublished);
        } else if (selectedStatus === "draft") {
          docs = docs.filter((d) => !d.isPublished);
        }

        setDocuments(docs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedStatus, sort]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Toggle Publish
  const togglePublish = async (doc: DocItem) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !doc.isPublished }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, isPublished: !d.isPublished } : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete single document
  const deleteDocument = async (id: string, title: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${title}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Actions
  const handleBulkPublish = async (publish: boolean) => {
    for (const id of selectedIds) {
      await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: publish }),
      });
    }
    fetchDocuments();
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${selectedIds.length} เล่มที่เลือกอย่างถาวร?`)
    ) {
      return;
    }

    for (const id of selectedIds) {
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
    }
    fetchDocuments();
    setSelectedIds([]);
  };

  // Open Edit Modal
  const openEditModal = (doc: DocItem) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditAuthor(doc.author || "");
    setEditCategory(doc.categoryId);
    setEditAllowDownload(doc.allowDownload);
    setEditIsFeatured(doc.isFeatured);
  };

  const saveEdit = async () => {
    if (!editingDoc) return;
    try {
      const res = await fetch(`/api/documents/${editingDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          author: editAuthor,
          categoryId: editCategory,
          allowDownload: editAllowDownload,
          isFeatured: editIsFeatured,
        }),
      });
      if (res.ok) {
        setEditingDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map((d) => d.id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            คลังรายการหนังสือและเอกสาร
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            จัดการการเผยแพร่ แก้ไขข้อมูล และควบคุมสิทธิ์การดาวน์โหลด
          </p>
        </div>

        <Link
          href="/admin/upload"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          + อัปโหลดหนังสือใหม่
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ หรือ ผู้แต่ง..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="published">เผยแพร่แล้ว (Published)</option>
            <option value="draft">แบบร่าง (Drafts)</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold"
          >
            <option value="newest">อัปเดตล่าสุด</option>
            <option value="oldest">เก่าที่สุด</option>
            <option value="popular">ยอดนิยมที่สุด</option>
            <option value="title">ชื่อ (ก-ฮ / A-Z)</option>
          </select>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="p-3 px-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-bold text-blue-900">
            เลือกไว้ {selectedIds.length} เล่ม
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkPublish(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
            >
              เผยแพร่ที่เลือก
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer"
            >
              ซ่อนที่เลือก
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer"
            >
              ลบที่เลือก
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENTS TABLE */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={documents.length > 0 && selectedIds.length === documents.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded-md accent-blue-600"
                  />
                </th>
                <th className="py-4 pr-3">หน้าปก & ชื่อหนังสือ</th>
                <th className="py-4 px-3">หมวดหมู่</th>
                <th className="py-4 px-3">สถานะ</th>
                <th className="py-4 px-3">หน้า / ขนาด</th>
                <th className="py-4 px-3">ยอดอ่าน</th>
                <th className="py-4 px-3">วันที่</th>
                <th className="py-4 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {documents.length > 0 ? (
                documents.map((doc) => {
                  const isSelected = selectedIds.includes(doc.id);

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, doc.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((i) => i !== doc.id));
                            }
                          }}
                          className="w-4 h-4 rounded-md accent-blue-600"
                        />
                      </td>

                      {/* Cover & Title */}
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            {doc.coverUrl ? (
                              <img
                                src={doc.coverUrl}
                                alt={doc.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-blue-500">
                                <BookOpen className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 truncate">
                                {doc.title}
                              </p>
                              {doc.isFeatured && (
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {doc.author || "ไม่ระบุผู้แต่ง"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold">
                          {doc.category?.name}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => togglePublish(doc)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            doc.isPublished
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                          title="คลิกเพื่อสลับสถานะการเผยแพร่"
                        >
                          {doc.isPublished ? "PUBLISHED" : "DRAFT"}
                        </button>
                      </td>

                      {/* Pages / Size */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        <span>{doc.pageCount} หน้า</span>
                        <span className="mx-1">•</span>
                        <span>{formatBytes(doc.fileSize)}</span>
                      </td>

                      {/* Views */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {doc.viewCount.toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(doc.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/read/${doc.slug || doc.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                            title="เปิดอ่านออนไลน์"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/document/${doc.slug || doc.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                            title="ดูหน้ารายละเอียด"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => openEditModal(doc)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-amber-600 cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteDocument(doc.id, doc.title)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-rose-600 cursor-pointer"
                            title="ลบหนังสือ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-medium">
                    {isLoading ? "กำลังโหลดรายการ..." : "ไม่พบหนังสือที่ตรงตามเงื่อนไข"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              แก้ไขข้อมูลหนังสือ
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800">
                  ชื่อหนังสือ
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800">
                  ผู้แต่ง
                </label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800">
                  หมวดหมู่
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editAllowDownload}
                    onChange={(e) => setEditAllowDownload(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-blue-600"
                  />
                  <span className="font-bold text-slate-800">อนุญาตให้ดาวน์โหลด</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-blue-600"
                  />
                  <span className="font-bold text-slate-800">หนังสือแนะนำ</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setEditingDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
