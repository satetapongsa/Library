import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { stat } from "fs/promises";
import { LibraryService } from "@/lib/data/libraryService";

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { key } = await params;
    const storageKey = key.join("/");

    // Security check: verify if download is allowed for this document
    const docResult = await LibraryService.getDocuments({ limit: 1000 });
    const doc = docResult.documents.find((d) => d.storageKey === storageKey);

    if (doc && !doc.allowDownload) {
      return NextResponse.json(
        { error: "Download is disabled for this document by administrator" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const customName = searchParams.get("name") || doc?.title || "document.pdf";
    const downloadFilename = customName.endsWith(".pdf") ? customName : `${customName}.pdf`;

    const safeKey = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.resolve(process.cwd(), "public", "uploads", safeKey);

    let fileStats;
    try {
      fileStats = await stat(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileStream = fs.createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Length": fileStats.size.toString(),
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadFilename)}"`,
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
  }
}
