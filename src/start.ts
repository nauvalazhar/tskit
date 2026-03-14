import { createStart } from '@tanstack/react-start';
import { loggingMiddleware } from '@/middleware/logging';

export const startInstance = createStart(() => ({
  requestMiddleware: [loggingMiddleware],
}));
