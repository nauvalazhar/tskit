import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { seedAdmin } from './seeders/admin';
import { seedPlans } from './seeders/plans';
import { seedBilling } from './seeders/billing';
import type { SeedDb } from './seeders/types';

const db: SeedDb = drizzle(process.env.DATABASE_URL!);

const seeders: Record<string, (db: SeedDb) => Promise<void>> = {
  admin: seedAdmin,
  plans: seedPlans,
  billing: seedBilling,
};

async function seed() {
  const requested = process.argv.slice(2);
  const toRun = requested.length > 0
    ? requested
    : Object.keys(seeders);

  for (const name of toRun) {
    const seeder = seeders[name];
    if (!seeder) {
      console.error(`Unknown seeder: ${name}`);
      console.error(`Available: ${Object.keys(seeders).join(', ')}`);
      process.exit(1);
    }
    await seeder(db);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
