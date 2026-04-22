import { plans, planPrices } from '../schemas/billing';
import type { SeedDb } from './types';

export async function seedBilling(db: SeedDb) {
  console.log('Syncing billing providers...');

  const allPlans = await db.select().from(plans);

  if (allPlans.length === 0) {
    console.log('  No plans found — run `bun run db:seed plans` first');
    return;
  }

  await syncStripe(db, allPlans);
  // await syncPolar(db, allPlans);
}

async function syncStripe(
  db: SeedDb,
  allPlans: { id: string; slug: string; name: string; description: string | null; price: number; currency: string; interval: string }[],
) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('  STRIPE_SECRET_KEY not set, skipping Stripe sync');
    return;
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  for (const plan of allPlans) {
    const existing = await stripe.products.search({
      query: `metadata["slug"]:"${plan.slug}"`,
    });

    let productId: string;
    let priceId: string;

    if (existing.data.length > 0) {
      productId = existing.data[0].id;
      const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
      priceId = prices.data[0].id;
      console.log(`  [stripe] ${plan.name}: exists (product=${productId} price=${priceId})`);
    } else {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description ?? undefined,
        metadata: { slug: plan.slug },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: plan.currency,
        recurring: { interval: plan.interval as 'month' | 'year' },
      });

      productId = product.id;
      priceId = price.id;
      console.log(`  [stripe] ${plan.name}: created (product=${productId} price=${priceId})`);
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
}

// async function syncPolar(
//   db: SeedDb,
//   allPlans: { id: string; slug: string; name: string; description: string | null; price: number; currency: string; interval: string }[],
// ) {
//   if (!process.env.POLAR_ACCESS_TOKEN) {
//     console.log('  POLAR_ACCESS_TOKEN not set, skipping Polar sync');
//     return;
//   }
//
//   const { Polar } = await import('@polar-sh/sdk');
//   const polar = new Polar({
//     accessToken: process.env.POLAR_ACCESS_TOKEN,
//     server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
//   });
//
//   for (const plan of allPlans) {
//     const existing = await polar.products.list({ query: plan.slug, limit: 1 });
//     let productId: string;
//
//     if (existing.result.items.length > 0 && existing.result.items[0].name === plan.name) {
//       productId = existing.result.items[0].id;
//       console.log(`  [polar] ${plan.name}: exists (product=${productId})`);
//     } else {
//       const product = await polar.products.create({
//         name: plan.name,
//         description: plan.description ?? undefined,
//         recurringInterval: plan.interval as 'month' | 'year',
//         prices: [
//           {
//             amountType: 'fixed',
//             priceAmount: plan.price,
//             priceCurrency: plan.currency as 'usd',
//           },
//         ],
//       });
//
//       productId = product.id;
//       console.log(`  [polar] ${plan.name}: created (product=${productId})`);
//     }
//
//     await db
//       .insert(planPrices)
//       .values({
//         planId: plan.id,
//         channel: 'polar',
//         externalProductId: productId,
//         externalPriceId: productId,
//       })
//       .onConflictDoUpdate({
//         target: [planPrices.planId, planPrices.channel],
//         set: { externalProductId: productId, externalPriceId: productId },
//       });
//   }
// }
