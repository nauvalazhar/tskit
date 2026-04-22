import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import {
  PlanCard,
  PlanCardPopularBadge,
  PlanCardBody,
  PlanCardHeader,
  PlanCardName,
  PlanCardDescription,
  PlanCardPrice,
  PlanCardPriceAmount,
  PlanCardPriceInterval,
  PlanCardAction,
  PlanCardFeatures,
  PlanCardFeature,
} from '@/components/billing/plan-card';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import { Text } from '@/components/selia/text';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { ChangePlanButton } from '@/components/billing/change-plan-button';
import { getPlans, getSubscription } from '@/functions/billing';
import { formatPrice, formatEntitlement, pageTitle } from '@/lib/utils';
import { featureRegistry } from '@/config/features';

export const Route = createFileRoute('/_marketing/pricing')({
  head: () => ({
    meta: [{ title: pageTitle('Pricing') }],
  }),
  loader: async ({ context }) => {
    const isAuthenticated = !!context.session?.user;
    const [plans, subscription] = await Promise.all([
      getPlans(),
      isAuthenticated
        ? getSubscription().catch(() => null)
        : Promise.resolve(null),
    ]);
    return { plans, subscription, isAuthenticated };
  },
  component: PricingPage,
});

function PricingPage() {
  const { plans, subscription, isAuthenticated } = Route.useLoaderData();
  const currentPlanId = subscription?.planId;
  const currentPlanPrice = subscription?.plan?.price;

  return (
    <section>
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Simple, transparent pricing.
        </h1>
        <Text className="text-dimmed text-xl max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Always flexible to scale up or
          down.
        </Text>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const hasSubscription = currentPlanId !== undefined;
          const featureLines = Object.entries(plan.entitlements)
            .map(([key, value]) =>
              formatEntitlement(key, value, featureRegistry),
            )
            .filter((line): line is string => line !== null);

          return (
            <PlanCard key={plan.id} popular={plan.popular}>
              {plan.popular && (
                <PlanCardPopularBadge>Most Popular</PlanCardPopularBadge>
              )}
              <PlanCardBody>
                <PlanCardHeader>
                  <PlanCardName>{plan.name}</PlanCardName>
                  {isCurrentPlan && (
                    <Badge variant="success" size="sm">
                      Current
                    </Badge>
                  )}
                </PlanCardHeader>
                {plan.description && (
                  <PlanCardDescription>{plan.description}</PlanCardDescription>
                )}
                <PlanCardPrice>
                  <PlanCardPriceAmount>
                    {formatPrice(plan.price, plan.currency)}
                  </PlanCardPriceAmount>
                  <PlanCardPriceInterval>
                    per {plan.interval === 'yearly' ? 'year' : 'month'}
                  </PlanCardPriceInterval>
                </PlanCardPrice>
                <PlanCardAction>
                  {isCurrentPlan ? (
                    <Text className="text-muted text-sm">
                      Your current plan
                    </Text>
                  ) : hasSubscription ? (
                    <ChangePlanButton
                      planId={plan.id}
                      planName={plan.name}
                      planPrice={plan.price}
                      planCurrency={plan.currency}
                      planInterval={plan.interval}
                      direction={
                        plan.price > (currentPlanPrice ?? 0)
                          ? 'upgrade'
                          : 'downgrade'
                      }
                      variant={
                        plan.price > (currentPlanPrice ?? 0)
                          ? 'primary'
                          : 'outline'
                      }
                    />
                  ) : !isAuthenticated ? (
                    <Button
                      nativeButton={false}
                      variant={plan.popular ? 'primary' : 'outline'}
                      block
                      render={<Link to="/login" />}
                    >
                      Get Started
                    </Button>
                  ) : (
                    <CheckoutButton
                      planId={plan.id}
                      planName={plan.name}
                      variant={plan.popular ? 'primary' : 'outline'}
                    />
                  )}
                </PlanCardAction>
                {featureLines.length > 0 && (
                  <PlanCardFeatures>
                    {featureLines.map((feature) => (
                      <PlanCardFeature key={feature}>{feature}</PlanCardFeature>
                    ))}
                  </PlanCardFeatures>
                )}
              </PlanCardBody>
            </PlanCard>
          );
        })}
      </div>
    </section>
  );
}
