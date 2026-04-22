import type { z } from 'zod';

/**
 * Wraps a Zod schema + raw config object in a lazy proxy.
 * Validation runs on first property access, not at import time,
 * so the app won't crash due to missing env vars for unused providers.
 */
export function defineConfig<T extends z.ZodType<Record<string, unknown>>>(
  schema: T,
  raw: unknown,
): z.infer<T> {
  let parsed: z.infer<T>;
  const resolve = (): Record<string, unknown> => (parsed ??= schema.parse(raw));

  return new Proxy(
    {},
    {
      get: (_, p) => resolve()[p as string],
      has: (_, p) => p in resolve(),
      ownKeys: () => Reflect.ownKeys(resolve()),
      getOwnPropertyDescriptor: (_, p) =>
        Object.getOwnPropertyDescriptor(resolve(), p),
    },
  ) as z.infer<T>;
}
