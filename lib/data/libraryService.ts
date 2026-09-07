import fs from "fs";
import path from "path";
import {
  CategoryData,
  DocumentData,
  INITIAL_CATEGORIES,
  INITIAL_DOCUMENTS,
} from "./initialData";

interface StoreData {
  categories: CategoryData[];
  documents: DocumentData[];
  viewsByDate: Record<string, number>;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "library-store.json");

// In-memory cache for fast SSR access
let memoryStore: StoreData | null = null;

function loadStore(): StoreData {
  if (memoryStore) return memoryStore;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.categories && parsed.documents) {
        memoryStore = parsed;
        return memoryStore!;
      }
    }
  } catch (err) {
    console.warn("Could not read local library-store.json, falling back to initial data:", err);
  }

  // Initialize with default datasets
  memoryStore = {
    categories: [...INITIAL_CATEGORIES],
    documents: [...INITIAL_DOCUMENTS],
    viewsByDate: {
      [new Date().toISOString().split("T")[0]]: 42,
    },
  };

  // Optionally persist initial store to disk
  saveStore(memoryStore);

  return memoryStore;
}

function saveStore(store: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist library-store.json:", err);
  }
}

export class LibraryService {
  // CATEGORIES
  static async getCategories(): Promise<
    (CategoryData & { _count: { documents: number } })[]
  > {
    const store = loadStore();
    return store.categories
      .sort((a, b) => a.order - b.order)
      .map((cat) => {
        const count = store.documents.filter(
          (d) =>
            d.isPublished &&
            d.status === "READY" &&
            (d.categoryId === cat.id || d.categorySlug === cat.slug)
        ).length;
        return {
          ...cat,
          _count: { documents: count },
        };
      });
  }

  static async getCategoryBySlug(slug: string): Promise<CategoryData | null> {
    const store = loadStore();
    return store.categories.find((c) => c.slug === slug) || null;
  }

  static async createCategory(
    data: Omit<CategoryData, "id">
  ): Promise<CategoryData> {
    const store = loadStore();
    const id = `cat-${Date.now()}`;
    const newCat: CategoryData = { id, ...data };
    store.categories.push(newCat);
    saveStore(store);
    return newCat;
  }

  static async updateCategory(
    id: string,
    data: Partial<CategoryData>
  ): Promise<CategoryData | null> {
    const store = loadStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    store.categories[idx] = { ...store.categories[idx], ...data };
    saveStore(store);
    return store.categories[idx];
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const store = loadStore();
    const initialLen = store.categories.length;
    store.categories = store.categories.filter((c) => c.id !== id);
    if (store.categories.length !== initialLen) {
      saveStore(store);
      return true;
    }
    return false;
  }

  // DOCUMENTS
  static async getDocuments(options: {
    query?: string;
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    includeUnpublished?: boolean;
  } = {}): Promise<{
    documents: DocumentData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const store = loadStore();
    const categoryMap = new Map(store.categories.map((c) => [c.id, c]));

    let docs = store.documents.map((d) => ({
      ...d,
      category: categoryMap.get(d.categoryId) || store.categories.find((c) => c.slug === d.categorySlug),
    }));

    if (!options.includeUnpublished) {
      docs = docs.filter((d) => d.isPublished && d.status === "READY");
    }

    if (options.featured) {
      docs = docs.filter((d) => d.isFeatured);
    }

    if (options.category && options.category !== "all") {
      docs = docs.filter(
        (d) => d.categorySlug === options.category || d.categoryId === options.category
      );
    }

    if (options.query) {
      const q = options.query.toLowerCase().trim();
      docs = docs.filter((d) => {
        const titleMatch = d.title.toLowerCase().includes(q);
        const authorMatch = d.author.toLowerCase().includes(q);
        const descMatch = d.description.toLowerCase().includes(q);
        const tagMatch = d.tags.some((t) => t.toLowerCase().includes(q));
        const catMatch = d.category?.name.toLowerCase().includes(q);
        return titleMatch || authorMatch || descMatch || tagMatch || catMatch;
      });
    }

    // Sorting
    const sort = options.sort || "newest";
    if (sort === "popular") {
      docs.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sort === "title") {
      docs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "pages") {
      docs.sort((a, b) => b.pageCount - a.pageCount);
    } else if (sort === "oldest") {
      docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // newest
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = docs.length;
    const page = Math.max(1, options.page || 1);
    const limit = options.limit || 12;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = docs.slice((page - 1) * limit, page * limit);

    return {
      documents: paginated,
      total,
      page,
      totalPages,
    };
  }

  static async getDocument(idOrSlug: string): Promise<DocumentData | null> {
    const store = loadStore();
    const doc = store.documents.find((d) => d.id === idOrSlug || d.slug === idOrSlug);
    if (!doc) return null;

    const category = store.categories.find(
      (c) => c.id === doc.categoryId || c.slug === doc.categorySlug
    );

    return { ...doc, category };
  }

  static async createDocument(
    data: Omit<DocumentData, "id" | "createdAt" | "updatedAt">
  ): Promise<DocumentData> {
    const store = loadStore();
    const id = `doc-${Date.now()}`;
    const now = new Date().toISOString();
    const newDoc: DocumentData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    store.documents.unshift(newDoc);
    saveStore(store);
    return newDoc;
  }

  static async updateDocument(
    id: string,
    data: Partial<DocumentData>
  ): Promise<DocumentData | null> {
    const store = loadStore();
    const idx = store.documents.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    store.documents[idx] = {
      ...store.documents[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
    return store.documents[idx];
  }

  static async deleteDocument(id: string): Promise<boolean> {
    const store = loadStore();
    const initialLen = store.documents.length;
    store.documents = store.documents.filter((d) => d.id !== id);
    if (store.documents.length !== initialLen) {
      saveStore(store);
      return true;
    }
    return false;
  }

  static async incrementViewCount(idOrSlug: string): Promise<number> {
    const store = loadStore();
    const doc = store.documents.find((d) => d.id === idOrSlug || d.slug === idOrSlug);
    if (!doc) return 0;

    doc.viewCount = (doc.viewCount || 0) + 1;
    const today = new Date().toISOString().split("T")[0];
    store.viewsByDate[today] = (store.viewsByDate[today] || 0) + 1;

    saveStore(store);
    return doc.viewCount;
  }

  // ANALYTICS & STATS
  static async getAnalyticsSummary() {
    const store = loadStore();
    const totalDocs = store.documents.length;
    const publishedDocs = store.documents.filter((d) => d.isPublished).length;
    const totalCategories = store.categories.length;
    const totalViews = store.documents.reduce((acc, d) => acc + (d.viewCount || 0), 0);

    const categoryDistribution = store.categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: store.documents.filter(
        (d) => d.categoryId === c.id || d.categorySlug === c.slug
      ).length,
    }));

    const topDocuments = [...store.documents]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        title: d.title,
        viewCount: d.viewCount,
        categoryName: store.categories.find((c) => c.id === d.categoryId)?.name || "General",
      }));

    return {
      totalDocs,
      publishedDocs,
      totalCategories,
      totalViews,
      categoryDistribution,
      topDocuments,
      viewsByDate: store.viewsByDate,
    };
  }
}
