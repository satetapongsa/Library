import { NextRequest, NextResponse } from "next/server";
import { LibraryService } from "@/lib/data/libraryService";
import { getSession } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validation/document";

export async function GET() {
  try {
    const categories = await LibraryService.getCategories();

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      documentCount: cat._count?.documents || 0,
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, icon, order } = result.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const existing = await LibraryService.getCategoryBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await LibraryService.createCategory({
      name,
      slug,
      description: description || "",
      icon: icon || "Layers",
      order: order || 1,
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
