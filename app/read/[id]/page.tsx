import { notFound } from "next/navigation";
import { Metadata } from "next";
import { LibraryService } from "@/lib/data/libraryService";
import { PdfReader } from "@/components/reader/PdfReader";

interface ReadPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await LibraryService.getDocument(id);

  if (!doc) return { title: "Document Reader | Digital Library" };

  return {
    title: `Reading: ${doc.title} | Digital Library`,
  };
}

export default async function ReadPage({ params, searchParams }: ReadPageProps) {
  const { id } = await params;
  const search = searchParams ? await searchParams : undefined;
  const initialPage = search?.page ? parseInt(search.page, 10) : undefined;
  const doc = await LibraryService.getDocument(id);

  if (!doc || !doc.isPublished || doc.status !== "READY") {
    notFound();
  }

  return <PdfReader document={doc} initialPage={initialPage} />;
}
