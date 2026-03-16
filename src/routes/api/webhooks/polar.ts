import { createFileRoute } from '@tanstack/react-router';
import { payment } from '@/lib/payment';
import { handleWebhookEvent } from '@/services/subscription.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export const Route = createFileRoute('/api/webhooks/polar')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const event = await payment.use('polar').handleWebhook(request);
          await handleWebhookEvent(event, 'polar');
          return apiSuccess({ received: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Webhook processing failed';
          return apiError('webhook_error', message);
        }
      },
    },
  },
});
