import { NextRequest, NextResponse } from "next/server";
import { LibraryService } from "@/lib/data/libraryService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const newCount = await LibraryService.incrementViewCount(id);

    if (!newCount) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, viewCount: newCount });
  } catch (error: any) {
    console.error("View increment error:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
