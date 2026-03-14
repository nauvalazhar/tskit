import 'dotenv/config';
import Stripe from 'stripe';
import { drizzle } from 'drizzle-orm/node-postgres';
import { plans } from './schemas/billing';

const db = drizzle(process.env.DATABASE_URL!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const seedPlans = [
  {
    name: 'Starter',
    description: 'For individuals getting started',
    price: 900,
    currency: 'usd',
    interval: 'month' as const,
    entitlements: { projects: 3, storage: 1 } as Record<string, boolean | number>,
    sortOrder: 0,
  },
  {
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

async function seed() {
  console.log('Syncing plans with Stripe...');

  for (const plan of seedPlans) {
    const slug = plan.name.toLowerCase().replace(/\s+/g, '-');

    // Search for existing product by metadata slug
    const existing = await stripe.products.search({
      query: `metadata["slug"]:"${slug}"`,
    });

    let productId: string;
    let priceId: string;

    if (existing.data.length > 0) {
      productId = existing.data[0].id;
      const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
      priceId = prices.data[0].id;
      console.log(`  ${plan.name}: exists (product=${productId} price=${priceId})`);
    } else {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { slug },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: plan.currency,
        recurring: { interval: plan.interval },
      });

      productId = product.id;
      priceId = price.id;
      console.log(`  ${plan.name}: created (product=${productId} price=${priceId})`);
    }

    await db
      .insert(plans)
      .values({
        channel: 'stripe',
        externalProductId: productId,
        externalPriceId: priceId,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        interval: 'monthly',
        entitlements: plan.entitlements,
        sortOrder: plan.sortOrder,
      })
      .onConflictDoUpdate({
        target: plans.externalPriceId,
        set: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          entitlements: plan.entitlements,
          sortOrder: plan.sortOrder,
        },
      });
  }

  console.log(`Seeded ${seedPlans.length} plans.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
