import {
  readFile,
  writeFile,
  appendFile,
  access,
  unlink,
  mkdir,
} from "node:fs/promises";
import { dirname } from "node:path";

export { readEnv, writeEnv } from "./env.js";
export type { EnvGroup } from "./env.js";

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

export function file(path: string) {
  return {
    async read(): Promise<string> {
      return readFile(path, "utf-8");
    },

    async write(content: string): Promise<void> {
      await ensureDir(path);
      await writeFile(path, content, "utf-8");
    },

    async append(content: string): Promise<void> {
      if (await this.contains(content)) return;
      await ensureDir(path);
      await appendFile(path, content, "utf-8");
    },

    async prepend(content: string): Promise<void> {
      if (await this.contains(content)) return;
      await ensureDir(path);
      let existing = "";
      try {
        existing = await readFile(path, "utf-8");
      } catch {
        // file doesn't exist yet
      }
      await writeFile(path, content + existing, "utf-8");
    },

    async insertAfter(marker: string, content: string): Promise<void> {
      const existing = await readFile(path, "utf-8");
      if (existing.includes(content)) return;
      const idx = existing.indexOf(marker);
      if (idx === -1) return;
      const insertAt = idx + marker.length;
      const result =
        existing.slice(0, insertAt) + content + existing.slice(insertAt);
      await writeFile(path, result, "utf-8");
    },

    async insertBefore(marker: string, content: string): Promise<void> {
      const existing = await readFile(path, "utf-8");
      if (existing.includes(content)) return;
      const idx = existing.indexOf(marker);
      if (idx === -1) return;
      const result =
        existing.slice(0, idx) + content + existing.slice(idx);
      await writeFile(path, result, "utf-8");
    },

    async replace(search: string, replacement: string): Promise<void> {
      const existing = await readFile(path, "utf-8");
      await writeFile(path, existing.replace(search, replacement), "utf-8");
    },

    async contains(search: string): Promise<boolean> {
      try {
        const content = await readFile(path, "utf-8");
        return content.includes(search);
      } catch {
        return false;
      }
    },

    async exists(): Promise<boolean> {
      try {
        await access(path);
        return true;
      } catch {
        return false;
      }
    },

    async remove(): Promise<void> {
      try {
        await unlink(path);
      } catch {
        // file may not exist
      }
    },
  };
}

export function json(path: string) {
  return {
    async read<T>(): Promise<T> {
      const content = await readFile(path, "utf-8");
      return JSON.parse(content) as T;
    },

    async write(data: unknown): Promise<void> {
      await ensureDir(path);
      await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
    },

    async merge(partial: Record<string, unknown>): Promise<void> {
      let existing: Record<string, unknown> = {};
      try {
        const content = await readFile(path, "utf-8");
        existing = JSON.parse(content) as Record<string, unknown>;
      } catch {
        // file doesn't exist yet
      }
      await ensureDir(path);
      const merged = { ...existing, ...partial };
      await writeFile(path, JSON.stringify(merged, null, 2) + "\n", "utf-8");
    },
  };
}
