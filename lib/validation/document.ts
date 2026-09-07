import { z } from "zod";

export const documentCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().optional(),
  description: z.string().max(3000).optional(),
  author: z.string().max(150).optional().default("Unknown"),
  categoryId: z.string().min(1, "Category is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  storageKey: z.string().min(1, "Storage key is required"),
  coverUrl: z.string().optional(),
  mimeType: z.string().default("application/pdf"),
  fileSize: z.number().int().nonnegative().default(0),
  pageCount: z.number().int().positive().default(1),
  language: z.string().default("en"),
  isPublished: z.boolean().default(true),
  allowDownload: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export const documentUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(3000).nullable().optional(),
  author: z.string().max(150).optional(),
  categoryId: z.string().optional(),
  coverUrl: z.string().nullable().optional(),
  language: z.string().optional(),
  isPublished: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional().default("Book"),
  order: z.number().int().optional().default(0),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
