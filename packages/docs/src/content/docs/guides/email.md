---
title: Email
description: How transactional email works in TSKit.
sidebar:
  order: 4
---

TSKit sends transactional emails using [React Email](https://react.email) for templates and [Resend](https://resend.dev) as the default delivery provider. The email driver is swappable - SendGrid is also supported.

## Setting up Resend

Resend is the default provider.

1. Create a [Resend account](https://resend.com/signup).
2. Go to [API Keys](https://resend.com/api-keys) and create a new key.
3. Add it to your `.env`:

```bash
EMAIL_PROVIDER=resend
EMAIL_FROM=onboarding@resend.dev
RESEND_API_KEY=re_...
```

For development, you can use the default `onboarding@resend.dev` sender address. For production, you need to verify your own domain under [Domains](https://resend.com/domains) in the Resend dashboard and update `EMAIL_FROM` to an address on that domain.

## Setting up SendGrid

To use SendGrid instead of Resend:

1. Create a [SendGrid account](https://signup.sendgrid.com/).
2. Go to Settings > [API Keys](https://app.sendgrid.com/settings/api_keys) and create a key with "Mail Send" permissions.
3. Verify a sender identity under Settings > [Sender Authentication](https://app.sendgrid.com/settings/sender_auth). SendGrid requires either a verified single sender or domain authentication before it will deliver emails.
4. Add it to your `.env`:

```bash
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=you@your-domain.com
SENDGRID_API_KEY=SG....
```

## How it works

The email system follows the same config-driver-facade pattern as storage and payment:

1. `config/mail.ts` defines email channels with provider and credentials.
2. `core/drivers/email/` implements the `EmailDriver` interface for each provider.
3. `lib/facades/mailer.ts` provides the `mailer` facade that loads templates, renders them, and sends.

## Sending an email

Use the `mailer.send()` function. The template name is the file name without the extension:

```ts
await mailer.send('verify-email', 'user@example.com', {
  name: 'Jane',
  url: 'https://app.example.com/verify?token=abc',
})
```

The function is type-safe. TypeScript knows which props each template expects based on the type map in `emails/index.ts`.

## Built-in templates

TSKit ships with six email templates:

| Template | When it's sent |
|----------|---------------|
| `verify-email` | After signup, to verify the email address |
| `reset-password` | When a user requests a password reset |
| `password-changed` | After a password is changed |
| `subscription-created` | After a new subscription is created |
| `payment-failed` | When a payment fails |
| `team-invitation` | When a user is invited to a team |

Each template file in `src/emails/` exports two things: a `subject` function that returns the email subject line, and a default React component for the email body.

## Previewing templates

Run the React Email dev server to preview templates in your browser:

```bash
bun run email:dev
```

This starts a preview server on port 3001 where you can see each template rendered with sample data.

## Adding a new template

See the [Adding an Email Template](/reference/adding-an-email-template/) reference for step-by-step instructions.

## Adding a new provider

To add a provider beyond Resend and SendGrid, implement the `EmailDriver` interface in `core/drivers/email/` and register it in the driver factory. See the [Adding a Driver](/reference/adding-a-driver/) reference for the general pattern.

## Key files

| File | Purpose |
|------|---------|
| `lib/facades/mailer.ts` | Mailer facade (template loading, rendering, sending) |
| `config/mail.ts` | Email channel config (provider, credentials) |
| `core/drivers/email/resend.ts` | Resend driver |
| `core/drivers/email/sendgrid.ts` | SendGrid driver |
| `core/drivers/email/types.ts` | EmailDriver interface |
| `emails/index.ts` | Template registry and type map |
| `emails/*.tsx` | Individual email templates |
