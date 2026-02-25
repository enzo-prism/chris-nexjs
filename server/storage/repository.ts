import type { IStorage } from "../storage";
import { MemStorage } from "../storage";
import { createDatabaseStorage } from "./db";

let storageInstance: IStorage | null = null;
let storageMode: "database" | "memory" = "memory";
let initializing: Promise<IStorage> | null = null;

async function createStorage(): Promise<IStorage> {
  try {
    const dbStorage = await createDatabaseStorage();
    if (dbStorage) {
      storageMode = "database";
      return dbStorage;
    }
  } catch (error) {
    // Database migration can fail if credentials are unavailable.
    console.error("[storage] Falling back to in-memory storage:", error);
  }

  storageMode = "memory";
  return new MemStorage();
}

async function getStorageInstance(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }
  if (!initializing) {
    initializing = createStorage()
      .then((instance) => {
        storageInstance = instance;
        return instance;
      })
      .finally(() => {
        initializing = null;
      });
  }
  return initializing;
}

export async function getStorage(): Promise<IStorage> {
  return getStorageInstance();
}

export function getStorageMode(): "database" | "memory" {
  return storageMode;
}
