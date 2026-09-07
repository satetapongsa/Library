import { NextRequest, NextResponse } from "next/server";
import { getStorageProvider } from "@/lib/storage";
import { PdfProcessor } from "@/lib/pdf/processor";
import { LibraryService } from "@/lib/data/libraryService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const coverFile = formData.get("cover") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    // 1. Validate file extension & mime
    const filename = file.name || "document.pdf";
    if (!filename.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF documents (.pdf) are allowed" },
        { status: 400 }
      );
    }

    // 2. Validate file size (e.g., max 100MB)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 100MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Validate Magic Bytes (%PDF-)
    if (!PdfProcessor.validateMagicBytes(buffer)) {
      return NextResponse.json(
        { error: "Security check failed: Corrupted or invalid PDF header" },
        { status: 400 }
      );
    }

    // 4. Extract PDF metadata & page count
    const pdfMeta = await PdfProcessor.extractMetadata(buffer);
    if (!pdfMeta.isValid) {
      return NextResponse.json(
        { error: pdfMeta.error || "Failed to process PDF content" },
        { status: 400 }
      );
    }

    // 5. Upload document to Storage
    const storage = getStorageProvider();
    const uploadResult = await storage.upload(buffer, filename, "application/pdf");

    // Form inputs
    const formTitle = (formData.get("title") as string)?.trim();
    const formAuthor = (formData.get("author") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const categoryId = formData.get("categoryId") as string;
    const language = (formData.get("language") as string) || "en";
    const isPublished = formData.get("isPublished") !== "false";
    const allowDownload = formData.get("allowDownload") !== "false";
    const isFeatured = formData.get("isFeatured") === "true";
    const tagsString = (formData.get("tags") as string) || "";

    const title = formTitle || pdfMeta.title || filename.replace(/\.[^/.]+$/, "");
    const author = formAuthor || pdfMeta.author || "Unknown Author";

    // Validate or retrieve category
    const categories = await LibraryService.getCategories();
    let category = categoryId ? categories.find((c) => c.id === categoryId || c.slug === categoryId) : null;

    if (!category) {
      category = categories[0] || {
        id: "cat-general",
        name: "General",
        slug: "general",
        description: "General documents",
        icon: "FileText",
        order: 1,
      };
    }

    // 6. Handle Cover Image
    let coverUrl: string;
    if (coverFile && coverFile.size > 0) {
      const coverArrayBuffer = await coverFile.arrayBuffer();
      const coverBuffer = Buffer.from(coverArrayBuffer);
      const coverResult = await storage.upload(
        coverBuffer,
        coverFile.name,
        coverFile.type || "image/jpeg"
      );
      coverUrl = coverResult.url;
    } else {
      // Auto-generate vector cover SVG
      coverUrl = PdfProcessor.generateCoverSvg(
        title,
        author,
        category.name,
        pdfMeta.pageCount
      );
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .substring(0, 80) || "document";
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    // 7. Process Tags
    const tagList = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // 8. Save Document to Library Store
    const document = await LibraryService.createDocument({
      title,
      slug,
      description,
      author,
      categoryId: category.id,
      categorySlug: category.slug,
      fileUrl: uploadResult.url,
      storageKey: uploadResult.storageKey,
      coverUrl,
      mimeType: "application/pdf",
      fileSize: uploadResult.size,
      pageCount: pdfMeta.pageCount,
      viewCount: 0,
      status: "READY",
      isPublished,
      allowDownload,
      isFeatured,
      tags: tagList,
    });

    return NextResponse.json({
      success: true,
      message: "Document uploaded and processed successfully",
      document,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document upload" },
      { status: 500 }
    );
  }
}
