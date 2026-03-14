import {
  createRouter as createTanStackRouter,
  isNotFound,
  isRedirect,
} from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { NotFound } from '@/components/shared/not-found';
import { captureException } from '@/lib/logger';
import { QueryClient } from '@tanstack/react-query';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

export function getRouter() {
  const queryClient = new QueryClient();
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ErrorBoundary,
    defaultNotFoundComponent: NotFound,
    defaultOnCatch(error) {
      if (isRedirect(error) || isNotFound(error)) return;
      captureException(error, { source: 'router' });
    },

    context: { queryClient },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // optional:
    // handleRedirects: true,
    // wrapQueryClient: true,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
