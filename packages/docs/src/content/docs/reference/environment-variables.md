---
title: Environment Variables
description: All environment variables used by TSKit.
sidebar:
  order: 5
---

Copy `.env.example` to `.env` and fill in the values. Variables prefixed with `VITE_` are available on the client side. All others are server-only.

## App

| Variable | Description | Required |
|----------|-------------|:--------:|
| `VITE_APP_URL` | Base URL of the app (e.g., `http://localhost:3000`) | Yes |
| `VITE_APP_NAME` | App name shown in the UI | Yes |

## Database

| Variable | Description | Required |
|----------|-------------|:--------:|
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Auth

| Variable | Description | Required |
|----------|-------------|:--------:|
| `BETTER_AUTH_SECRET` | Random secret for signing sessions. Generate with `openssl rand -base64 32` | Yes |
| `BETTER_AUTH_URL` | Auth callback base URL (usually same as `VITE_APP_URL`) | Yes |

## Social login

| Variable | Description | Required |
|----------|-------------|:--------:|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | No |
| `GOOGLE_CLIENT_ID` | Google OAuth credentials client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth credentials client secret | No |

Create a GitHub OAuth app at [github.com/settings/developers](https://github.com/settings/developers). Create Google credentials at the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

## Email

| Variable | Description | Required |
|----------|-------------|:--------:|
| `EMAIL_PROVIDER` | Email driver to use (`resend` or `sendgrid`) | Yes |
| `EMAIL_FROM` | Sender email address | Yes |
| `RESEND_API_KEY` | Resend API key | If using Resend |
| `SENDGRID_API_KEY` | SendGrid API key | If using SendGrid |

## Storage

| Variable | Description | Required |
|----------|-------------|:--------:|
| `S3_ENDPOINT` | S3-compatible endpoint URL | Yes |
| `S3_ACCESS_KEY_ID` | S3 access key | Yes |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | Yes |
| `S3_BUCKET` | Public bucket name | Yes |
| `S3_PRIVATE_BUCKET` | Private bucket name | No |
| `S3_PUBLIC_URL` | Public URL for the bucket (for constructing file URLs) | Yes |
| `VITE_STORAGE_URL` | Client-side storage URL (usually same as `S3_PUBLIC_URL`) | Yes |

## Billing

| Variable | Description | Required |
|----------|-------------|:--------:|
| `PAYMENT_PROVIDER` | Payment driver to use (`stripe`) | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `POLAR_ACCESS_TOKEN` | Polar access token | No |
| `POLAR_WEBHOOK_SECRET` | Polar webhook secret | No |
| `POLAR_SERVER` | Polar server (`sandbox` or `production`) | No |
