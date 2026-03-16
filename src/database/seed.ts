import 'dotenv/config';
import Stripe from 'stripe';
import { Polar } from '@polar-sh/sdk';
import { drizzle } from 'drizzle-orm/node-postgres';
import { plans, planPrices } from './schemas/billing';

const db = drizzle(process.env.DATABASE_URL!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
    })
  : null;

const seedPlans = [
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

async function syncStripe(
  plan: { id: string },
  seedPlan: (typeof seedPlans)[number],
) {
  const existing = await stripe.products.search({
    query: `metadata["slug"]:"${seedPlan.slug}"`,
  });

  let productId: string;
  let priceId: string;

  if (existing.data.length > 0) {
    productId = existing.data[0].id;
    const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
    priceId = prices.data[0].id;
    console.log(`  [stripe] ${seedPlan.name}: exists (product=${productId} price=${priceId})`);
  } else {
    const product = await stripe.products.create({
      name: seedPlan.name,
      description: seedPlan.description,
      metadata: { slug: seedPlan.slug },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: seedPlan.price,
      currency: seedPlan.currency,
      recurring: { interval: seedPlan.interval },
    });

    productId = product.id;
    priceId = price.id;
    console.log(`  [stripe] ${seedPlan.name}: created (product=${productId} price=${priceId})`);
  }

  await db
    .insert(planPrices)
    .values({
      planId: plan.id,
      channel: 'stripe',
      externalProductId: productId,
      externalPriceId: priceId,
    })
    .onConflictDoUpdate({
      target: [planPrices.planId, planPrices.channel],
      set: { externalProductId: productId, externalPriceId: priceId },
    });
}

async function syncPolar(
  plan: { id: string },
  seedPlan: (typeof seedPlans)[number],
) {
  if (!polar) return;

  // Search for existing product by metadata slug
  const existing = await polar.products.list({ query: seedPlan.slug, limit: 1 });
  let productId: string;

  if (existing.result.items.length > 0 && existing.result.items[0].name === seedPlan.name) {
    productId = existing.result.items[0].id;
    console.log(`  [polar] ${seedPlan.name}: exists (product=${productId})`);
  } else {
    const product = await polar.products.create({
      name: seedPlan.name,
      description: seedPlan.description ?? undefined,
      recurringInterval: seedPlan.interval,
      prices: [
        {
          amountType: 'fixed',
          priceAmount: seedPlan.price,
          priceCurrency: seedPlan.currency as 'usd',
        },
      ],
    });

    productId = product.id;
    console.log(`  [polar] ${seedPlan.name}: created (product=${productId})`);
  }

  // In Polar, the product ID is used as both product and price identifier
  await db
    .insert(planPrices)
    .values({
      planId: plan.id,
      channel: 'polar',
      externalProductId: productId,
      externalPriceId: productId,
    })
    .onConflictDoUpdate({
      target: [planPrices.planId, planPrices.channel],
      set: { externalProductId: productId, externalPriceId: productId },
    });
}

async function seed() {
  console.log('Syncing plans...');
  if (!polar) console.log('  POLAR_ACCESS_TOKEN not set, skipping Polar sync');

  for (const seedPlan of seedPlans) {
    const [plan] = await db
      .insert(plans)
      .values({
        slug: seedPlan.slug,
        name: seedPlan.name,
        description: seedPlan.description,
        price: seedPlan.price,
        currency: seedPlan.currency,
        interval: 'monthly',
        entitlements: seedPlan.entitlements,
        sortOrder: seedPlan.sortOrder,
      })
      .onConflictDoUpdate({
        target: plans.slug,
        set: {
          name: seedPlan.name,
          description: seedPlan.description,
          price: seedPlan.price,
          entitlements: seedPlan.entitlements,
          sortOrder: seedPlan.sortOrder,
        },
      })
      .returning();

    await syncStripe(plan, seedPlan);
    await syncPolar(plan, seedPlan);
  }

  console.log(`Seeded ${seedPlans.length} plans.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
