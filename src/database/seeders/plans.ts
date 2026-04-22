import { plans } from '../schemas/billing';
import type { SeedDb } from './types';

const seedPlanData = [
  {
    slug: 'starter',
    name: 'Starter',
    description: 'For individuals getting started',
    price: 900,
    currency: 'usd',
    interval: 'month' as const,
    entitlements: { projects: 3, storage: 1 } as Record<string, boolean | number>,
    sortOrder: 0,
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'For professionals and small teams',
    price: 2900,
    currency: 'usd',
    interval: 'month' as const,
    entitlements: {
      projects: -1,
      storage: 50,
      analytics: true,
      'priority-support': true,
      'custom-integrations': true,
    } as Record<string, boolean | number>,
    sortOrder: 1,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 9900,
    currency: 'usd',
    interval: 'month' as const,
    entitlements: {
      projects: -1,
      storage: 500,
      analytics: true,
      'priority-support': true,
      'custom-integrations': true,
      sso: true,
      'dedicated-support': true,
    } as Record<string, boolean | number>,
    sortOrder: 2,
  },
];

export async function seedPlans(db: SeedDb) {
  console.log('Seeding plans...');

  for (const seedPlan of seedPlanData) {
    await db
      .insert(plans)
      .values({
        slug: seedPlan.slug,
        name: seedPlan.name,
        description: seedPlan.description,
        price: seedPlan.price,
        currency: seedPlan.currency,
        interval: seedPlan.interval,
        entitlements: seedPlan.entitlements,
        sortOrder: seedPlan.sortOrder,
      })
      .onConflictDoUpdate({
        target: plans.slug,
        set: {
          name: seedPlan.name,
          description: seedPlan.description,
          price: seedPlan.price,
          interval: seedPlan.interval,
          entitlements: seedPlan.entitlements,
          sortOrder: seedPlan.sortOrder,
        },
      });

    console.log(`  ${seedPlan.name}: upserted`);
  }

  console.log(`Seeded ${seedPlanData.length} plans.`);
}
