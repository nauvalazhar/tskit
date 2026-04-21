import { createServerOnlyFn } from '@tanstack/react-start';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from '@/database/schemas/auth';
import * as settingsSchema from '@/database/schemas/settings';
import * as billingSchema from '@/database/schemas/billing';
import * as auditSchema from '@/database/schemas/audit';

const createDatabase = createServerOnlyFn(() =>
  drizzle(process.env.DATABASE_URL!, {
    schema: {
      ...authSchema,
      ...settingsSchema,
      ...billingSchema,
      ...auditSchema,
    },
  }),
);

export const db = createDatabase();
