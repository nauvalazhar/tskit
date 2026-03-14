import { createMiddleware } from '@tanstack/react-start';
import { isRedirect, isNotFound } from '@tanstack/react-router';
import { requestLogger, captureException } from '@/lib/logger';

export const loggingMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request, pathname }) => {
    const start = Date.now();

    try {
      const result = await next();
      const duration = Date.now() - start;

      requestLogger.info(
        {
          method: request.method,
          pathname,
          status: result.response.status,
          duration,
        },
        'Request handled',
      );

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      if (isRedirect(error) || isNotFound(error)) {
        throw error;
      }

      requestLogger.error(
        {
          method: request.method,
          pathname,
          duration,
          err: error,
        },
        'Request error',
      );

      throw error;
    }
  },
);

export const serverFnErrorMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (isRedirect(error) || isNotFound(error)) {
      throw error;
    }

    captureException(error, { source: 'serverFn' });
    throw error;
  }
});
