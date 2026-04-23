import { createFileRoute } from '@tanstack/react-router';
import { payment } from '@/lib/facades/payment';
import { rateLimiter } from '@/lib/facades/rate-limit';
import { handleWebhookEvent } from '@/services/subscription.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const ip =
          request.headers
            .get('x-forwarded-for')
            ?.split(',')[0]
            ?.trim() || 'unknown';
        const limit = await rateLimiter.check(`api:${ip}`, 'api');
        if (!limit.allowed) {
          return apiError('rate_limited', 'Too many requests', 429);
        }

        try {
          const event = await payment.use('stripe').handleWebhook(request);
          await handleWebhookEvent(event, 'stripe');
          return apiSuccess({ received: true });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Webhook processing failed';
          return apiError('webhook_error', message);
        }
      },
    },
  },
});
