import { createStart } from '@tanstack/react-start';
import { loggingMiddleware } from '@/middleware/logging';
import { securityHeadersMiddleware } from '@/middleware/security-headers';

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeadersMiddleware, loggingMiddleware],
}));
