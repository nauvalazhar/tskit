type Entitlements = Record<string, boolean | number>;

export function hasFeature(entitlements: Entitlements, key: string): boolean {
  return entitlements[key] === true;
}

export function withinLimit(
  entitlements: Entitlements,
  key: string,
  currentUsage: number,
): boolean {
  const limit = entitlements[key];
  if (typeof limit !== 'number') return false;
  if (limit === -1) return true;
  return currentUsage < limit;
}

export function remaining(
  entitlements: Entitlements,
  key: string,
  currentUsage: number,
): number {
  const limit = entitlements[key];
  if (typeof limit !== 'number') return 0;
  if (limit === -1) return Infinity;
  return Math.max(0, limit - currentUsage);
}

export function requireFeature(entitlements: Entitlements, key: string): void {
  if (!hasFeature(entitlements, key)) {
    throw new Error(`Feature "${key}" is not available on your plan`);
  }
}

export function requireLimit(
  entitlements: Entitlements,
  key: string,
  currentUsage: number,
): void {
  if (!withinLimit(entitlements, key, currentUsage)) {
    throw new Error(`Usage limit reached for "${key}"`);
  }
}
