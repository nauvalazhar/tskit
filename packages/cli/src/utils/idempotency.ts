import { access, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

const TSKIT_DIR = ".tskit";

function markerPath(name: string): string {
  return join(process.cwd(), TSKIT_DIR, name);
}

export async function markerExists(name: string): Promise<boolean> {
  try {
    await access(markerPath(name));
    return true;
  } catch {
    return false;
  }
}

export async function createMarker(name: string): Promise<void> {
  const dir = join(process.cwd(), TSKIT_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(markerPath(name), new Date().toISOString(), "utf-8");
}

export async function clearMarkers(): Promise<void> {
  try {
    await rm(join(process.cwd(), TSKIT_DIR), { recursive: true, force: true });
  } catch {
    // directory may not exist
  }
}
