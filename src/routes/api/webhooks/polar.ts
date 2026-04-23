import { createFileRoute } from '@tanstack/react-router';
// import { payment } from '@/lib/facades/payment';
// import { rateLimiter } from '@/lib/facades/rate-limit';
// import { handleWebhookEvent } from '@/services/subscription.service';
import { apiError } from '@/lib/api-response';

export const Route = createFileRoute('/api/webhooks/polar')({
  server: {
    handlers: {
      POST: async () => {
        // Enable polar channel in config/payment.ts and uncomment below:
        // const ip =
        //   request.headers
        //     .get('x-forwarded-for')
        //     ?.split(',')[0]
        //     ?.trim() || 'unknown';
        // const limit = await rateLimiter.check(`api:${ip}`, 'api');
        // if (!limit.allowed) {
        //   return apiError('rate_limited', 'Too many requests', 429);
        // }
        //
        // try {
        //   const event = await payment.use('polar').handleWebhook(request);
        //   await handleWebhookEvent(event, 'polar');
        //   return apiSuccess({ received: true });
        // } catch (error) {
        //   const message =
        //     error instanceof Error
        //       ? error.message
        //       : 'Webhook processing failed';
        //   return apiError('webhook_error', message);
        // }
        return apiError('not_configured', 'Polar is not configured', 501);
      },
    },
  },
});
