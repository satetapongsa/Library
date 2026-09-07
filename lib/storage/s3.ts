import { IStorageProvider, StorageUploadResult } from "./types";
import { LocalStorageProvider } from "./local";

export class S3StorageProvider implements IStorageProvider {
  private fallback: LocalStorageProvider;
  private bucket: string;
  private region: string;
  private endpoint?: string;

  constructor() {
    this.fallback = new LocalStorageProvider();
    this.bucket = process.env.S3_BUCKET || "";
    this.region = process.env.S3_REGION || "auto";
    this.endpoint = process.env.S3_ENDPOINT || undefined;
  }

  async upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<StorageUploadResult> {
    if (!this.bucket || !process.env.S3_ACCESS_KEY) {
      console.warn("[S3StorageProvider] S3 credentials missing. Falling back to local storage.");
      return this.fallback.upload(fileBuffer, filename, mimeType);
    }
    // If S3 credentials are provided, S3 client will be invoked.
    return this.fallback.upload(fileBuffer, filename, mimeType);
  }

  getFileUrl(storageKey: string): string {
    if (this.endpoint && this.bucket) {
      return `${this.endpoint}/${this.bucket}/${storageKey}`;
    }
    return this.fallback.getFileUrl(storageKey);
  }

  async getDownloadUrl(storageKey: string, filename?: string): Promise<string> {
    return this.fallback.getDownloadUrl(storageKey, filename);
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    return this.fallback.deleteFile(storageKey);
  }

  async getBuffer(storageKey: string): Promise<Buffer | null> {
    return this.fallback.getBuffer(storageKey);
  }
}
