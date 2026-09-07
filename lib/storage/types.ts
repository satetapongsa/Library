export interface StorageUploadResult {
  url: string;
  storageKey: string;
  size: number;
  mimeType: string;
}

export interface IStorageProvider {
  upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<StorageUploadResult>;
  getFileUrl(storageKey: string): string;
  getDownloadUrl(storageKey: string, filename?: string): Promise<string>;
  deleteFile(storageKey: string): Promise<boolean>;
  getBuffer(storageKey: string): Promise<Buffer | null>;
}
