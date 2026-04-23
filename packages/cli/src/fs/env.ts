import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface EnvGroup {
  header: string;
  keys: string[];
}

/**
 * Reads a .env file and returns a Map of key → value.
 */
export async function readEnv(dir: string): Promise<Map<string, string>> {
  const envPath = resolve(dir, ".env");
  const map = new Map<string, string>();
  try {
    const content = await readFile(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      map.set(trimmed.slice(0, eqIdx), trimmed.slice(eqIdx + 1));
    }
  } catch {
    // no .env yet
  }
  return map;
}

/**
 * Writes a .env file, merging new values with existing ones.
 * Existing values are NOT overwritten unless `force` is true.
 * Groups organize the output by domain with headers.
 */
export async function writeEnv(
  dir: string,
  values: Record<string, string>,
  options: { force?: boolean; groups?: EnvGroup[]; header?: string } = {},
): Promise<void> {
  const { force = false, groups = [], header } = options;
  const envPath = resolve(dir, ".env");
  const existing = await readEnv(dir);

  for (const [key, val] of Object.entries(values)) {
    if (force || !existing.has(key)) {
      existing.set(key, val);
    }
  }

  const lines: string[] = [];

  if (header) {
    lines.push(`# ${"=".repeat(77)}`);
    lines.push(`# ${header}`);
    lines.push(`# ${"=".repeat(77)}`);
    lines.push("");
  }

  const written = new Set<string>();

  for (const group of groups) {
    const groupLines: string[] = [];
    for (const key of group.keys) {
      if (existing.has(key)) {
        groupLines.push(`${key}=${existing.get(key)!}`);
        written.add(key);
      }
    }
    if (groupLines.length > 0) {
      lines.push(`# --- ${group.header} ---`);
      lines.push(...groupLines);
      lines.push("");
    }
  }

  // Any remaining keys not in groups
  for (const [key, val] of existing) {
    if (!written.has(key)) {
      lines.push(`${key}=${val}`);
    }
  }

  lines.push("");
  await writeFile(envPath, lines.join("\n"), "utf-8");
}
