import { NextRequest, NextResponse } from "next/server";
import { LibraryService } from "@/lib/data/libraryService";
import { getSession } from "@/lib/auth/session";
import { getStorageProvider } from "@/lib/storage";
import { documentUpdateSchema } from "@/lib/validation/document";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const document = await LibraryService.getDocument(id);

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Related documents (same category, different id)
    const relatedRes = await LibraryService.getDocuments({
      category: document.categorySlug,
      limit: 5,
      sort: "popular",
    });

    const related = relatedRes.documents.filter((d) => d.id !== document.id).slice(0, 4);

    return NextResponse.json({
      document: {
        ...document,
        tags: document.tags.map((name) => ({ id: name, name, slug: name.toLowerCase() })),
      },
      related,
    });
  } catch (error: any) {
    console.error("GET /api/documents/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = documentUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await LibraryService.updateDocument(id, result.data as any);
    if (!updated) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, document: updated });
  } catch (error: any) {
    console.error("PATCH /api/documents/[id] error:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await LibraryService.getDocument(id);
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete file from storage
    const storage = getStorageProvider();
    if (document.storageKey) {
      await storage.deleteFile(document.storageKey);
    }

    await LibraryService.deleteDocument(id);

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (error: any) {
    console.error("DELETE /api/documents/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
