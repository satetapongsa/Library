import { NextRequest, NextResponse } from "next/server";
import { LibraryService } from "@/lib/data/libraryService";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const categorySlug = searchParams.get("category") || undefined;
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const featured = searchParams.get("featured") === "true";
    const showAll = searchParams.get("all") === "true";

    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    const result = await LibraryService.getDocuments({
      query: q,
      category: categorySlug,
      sort,
      page,
      limit,
      featured,
      includeUnpublished: isAdmin && showAll,
    });

    const formatted = result.documents.map((doc) => ({
      ...doc,
      tags: doc.tags.map((name) => ({ id: name, name, slug: name.toLowerCase() })),
    }));

    return NextResponse.json({
      documents: formatted,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
