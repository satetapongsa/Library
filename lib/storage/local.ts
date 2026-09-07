import fs from "fs/promises";
import path from "path";
import { IStorageProvider, StorageUploadResult } from "./types";

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), "public", "uploads");
  }

  private async ensureDirectory(subDir: string = ""): Promise<string> {
    const targetDir = path.join(this.baseDir, subDir);
    await fs.mkdir(targetDir, { recursive: true });
    return targetDir;
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
  }

  async upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<StorageUploadResult> {
    const isCover = mimeType.startsWith("image/");
    const folder = isCover ? "covers" : "documents";
    const targetDir = await this.ensureDirectory(folder);

    const safeName = this.sanitizeFilename(filename);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeName}`;
    const filePath = path.join(targetDir, uniqueName);

    await fs.writeFile(filePath, fileBuffer);

    const storageKey = `${folder}/${uniqueName}`;
    const url = `/uploads/${storageKey}`;

    return {
      url,
      storageKey,
      size: fileBuffer.length,
      mimeType,
    };
  }

  getFileUrl(storageKey: string): string {
    const safeKey = storageKey.replace(/\.\./g, "");
    return `/uploads/${safeKey}`;
  }

  async getDownloadUrl(storageKey: string, filename?: string): Promise<string> {
    const safeKey = storageKey.replace(/\.\./g, "");
    const downloadParam = filename ? `?name=${encodeURIComponent(filename)}` : "";
    return `/api/storage/download/${safeKey}${downloadParam}`;
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const safeKey = storageKey.replace(/\.\./g, "");
      const filePath = path.join(this.baseDir, safeKey);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getBuffer(storageKey: string): Promise<Buffer | null> {
    try {
      const safeKey = storageKey.replace(/\.\./g, "");
      const filePath = path.join(this.baseDir, safeKey);
      return await fs.readFile(filePath);
    } catch {
      return null;
    }
  }
}
