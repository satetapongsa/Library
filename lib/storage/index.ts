import { IStorageProvider } from "./types";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";

let storageProviderInstance: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (!storageProviderInstance) {
    const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();
    if (provider === "s3") {
      storageProviderInstance = new S3StorageProvider();
    } else {
      storageProviderInstance = new LocalStorageProvider();
    }
  }
  return storageProviderInstance;
}

export * from "./types";
export * from "./local";
export * from "./s3";
