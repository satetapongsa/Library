import { NextRequest, NextResponse } from "next/server";

// Local in-memory store for server-side bookmarks session
const memoryBookmarks: { id: string; documentId: string; pageNumber: number }[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const bookmarks = memoryBookmarks.filter((b) => b.documentId === documentId);
    return NextResponse.json({ bookmarks });
  } catch (error: any) {
    console.error("GET /api/bookmarks error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, pageNumber } = body;

    if (!documentId || typeof pageNumber !== "number") {
      return NextResponse.json(
        { error: "Document ID and page number are required" },
        { status: 400 }
      );
    }

    const existingIdx = memoryBookmarks.findIndex(
      (b) => b.documentId === documentId && b.pageNumber === pageNumber
    );

    if (existingIdx !== -1) {
      // Toggle off / remove
      memoryBookmarks.splice(existingIdx, 1);
      return NextResponse.json({ bookmarked: false, message: "Bookmark removed" });
    }

    // Add bookmark
    const bookmark = {
      id: `bm-${Date.now()}`,
      documentId,
      pageNumber,
    };
    memoryBookmarks.push(bookmark);

    return NextResponse.json({ bookmarked: true, bookmark });
  } catch (error: any) {
    console.error("POST /api/bookmarks error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
