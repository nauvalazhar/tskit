# TSKit

A SaaS starter kit built on TanStack Start. Auth, billing, teams, admin, audit logs, and rate limiting all wired up. Swappable drivers for billing (Stripe, Polar), email (Resend, SendGrid), and storage (S3, R2).

Full documentation: [tskit.nauv.al](https://tskit.nauv.al)

## Quick start

```bash
git clone https://github.com/nauvalazhar/tskit.git my-app
cd my-app
bun install
cp .env.example .env
bun run db:migrate
bun run db:seed
bun dev
```

See the [installation guide](https://tskit.nauv.al/getting-started/installation/) for environment setup, optional service configuration, and the rest of the available scripts.

## License

[MIT](./LICENSE)
