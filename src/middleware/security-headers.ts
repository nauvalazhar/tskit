import { createMiddleware } from '@tanstack/react-start';

/**
 * Security headers middleware for SSR responses.
 *
 * For full coverage in production, also configure these headers at your
 * reverse proxy / CDN (e.g. Cloudflare, nginx, Vercel headers config).
 */
export const securityHeadersMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next }) => {
  const result = await next();

  const headers = result.response.headers;
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  );

  return result;
});
