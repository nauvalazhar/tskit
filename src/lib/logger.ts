import pino from 'pino';
import { createIsomorphicFn } from '@tanstack/react-start';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['password', 'token', 'secret', 'cookie', 'authorization'],
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined,
});

export const requestLogger = logger.child({ domain: 'request' });
export const authLogger = logger.child({ domain: 'auth' });

/**
 * Logs errors on the server, no-op on the client.
 * You can swap out the implementation to send logs to an external service like Sentry, LogRocket, etc.
 */
export const captureException = createIsomorphicFn()
  .server((err: unknown, context?: Record<string, unknown>) => {
    logger.error({ err, ...context }, 'Captured exception');
  })
  .client(() => {
    // No-op on the client for now, you can add client-side logging here if needed
  });
