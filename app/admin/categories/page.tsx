"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  documentCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeCat, setActiveCat] = useState<CategoryItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setActiveCat(null);
    setName("");
    setDescription("");
    setErrorMessage("");
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setModalMode("edit");
    setActiveCat(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setErrorMessage("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "สร้างหมวดหมู่ไม่สำเร็จ");
      } else if (modalMode === "edit" && activeCat) {
        const res = await fetch(`/api/categories/${activeCat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "แก้ไขหมวดหมู่ไม่สำเร็จ");
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${cat.name}"? หนังสือในหมวดหมู่นี้จะได้รับผลกระทบ`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            จัดการหมวดหมู่หนังสือ (Categories)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            จัดระเบียบหนังสือเป็นกลุ่มตามหัวข้อ และความสนใจของผู้อ่าน
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
                  {cat.documentCount} เล่ม
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {cat.description || "ไม่มีคำอธิบายเพิ่มเติม"}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                slug: {cat.slug}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-amber-600 cursor-pointer"
                  title="แก้ไขหมวดหมู่"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-rose-600 cursor-pointer"
                  title="ลบหมวดหมู่"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {modalMode === "create" ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
            </h3>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800">
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น วิทยาศาสตร์ & อวกาศ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800">
                  คำอธิบาย
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="คำอธิบายสั้นๆ เกี่ยวกับเนื้อหาในหมวดหมู่นี้..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {modalMode === "create" ? "สร้างหมวดหมู่" : "บันทึกการแก้ไข"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
