import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/selia/button';
import { Badge } from '@/components/selia/badge';
import { pageTitle } from '@/lib/utils';

export const Route = createFileRoute('/_marketing/')({
  head: () => ({
    meta: [{ title: pageTitle() }],
  }),
  component: HomePage,
});

const features = [
  {
    label: 'Authentication',
    description:
      'Email/password, GitHub, Google OAuth, 2FA, email verification, password reset — all wired up.',
  },
  {
    label: 'Billing & Subscriptions',
    description:
      'Stripe checkout, subscription lifecycle, webhooks, customer portal, and plan entitlements.',
  },
  {
    label: 'Teams & Organizations',
    description:
      'Multi-tenant orgs, role-based access, invitations, team switcher, and per-org billing.',
  },
  {
    label: 'Transactional Email',
    description:
      'React Email templates with Resend. Driver-swappable — add any provider.',
  },
  {
    label: 'Admin Dashboard',
    description:
      'Overview, user management, subscriptions, plans, and audit logs — out of the box.',
  },
  {
    label: 'File Storage',
    description:
      'S3-compatible uploads with scoped keys. Works with Cloudflare R2, AWS S3, or MinIO.',
  },
];

const stack = [
  'TanStack Start',
  'React 19',
  'TypeScript',
  'Drizzle ORM',
  'PostgreSQL',
  'Stripe',
  'Tailwind CSS',
  'Better Auth',
];

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-20 text-center">
        <Badge variant="secondary" size="md" pill className="mb-6">
          SaaS Starter Kit
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Stop rebuilding the
          <br />
          same SaaS plumbing.
        </h1>
        <p className="mt-5 text-lg text-dimmed max-w-xl mx-auto leading-relaxed">
          Auth, billing, teams, email, storage, admin — already built, tested,
          and ready to ship. Just add your product.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            nativeButton={false}
            variant="primary"
            size="lg"
            render={<Link to="/register" />}
          >
            Get Started
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            size="lg"
            render={<Link to="/pricing" />}
          >
            View Pricing
          </Button>
        </div>

        {/* Install command */}
        <div className="mt-10 inline-flex items-center gap-3 rounded-lg border border-border bg-code px-5 py-3 font-mono text-sm text-foreground">
          <span className="text-muted select-none">$</span>
          <span>bun create tskit my-app</span>
        </div>
      </section>

      {/* Stack strip */}
      <section className="border-y border-border bg-accent/50 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted">
            {stack.map((tech, i) => (
              <span key={tech} className="flex items-center gap-6">
                {i > 0 && (
                  <span className="text-border" aria-hidden="true">
                    /
                  </span>
                )}
                <span>{tech}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Everything you need to launch.
          </h2>
          <p className="mt-3 text-dimmed max-w-lg mx-auto">
            Production-ready features so you can focus on what makes your
            product unique.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="bg-background p-6 flex flex-col gap-2"
            >
              <h3 className="font-semibold text-foreground">{feature.label}</h3>
              <p className="text-sm text-dimmed leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-accent/30 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to build?
          </h2>
          <p className="mt-3 text-dimmed">
            Skip the boilerplate. Start shipping your product today.
          </p>
          <div className="mt-8">
            <Button
              nativeButton={false}
              variant="primary"
              size="lg"
              render={<Link to="/register" />}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
