import type { drizzle } from 'drizzle-orm/node-postgres';

export type SeedDb = ReturnType<typeof drizzle>;
