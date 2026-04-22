import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { ActivityLog } from '@/components/settings/activity-log';
import { userAuditLogsQuery } from '@/queries/audit.queries';
import { z } from 'zod';

const searchSchema = z.object({
  action: z.string().optional(),
  cursor: z.string().optional(),
});

export const Route = createFileRoute('/_app/settings/activity')({
  head: () => ({
    meta: [{ title: pageTitle('Activity') }],
  }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(userAuditLogsQuery({ action: deps.action, cursor: deps.cursor })),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={2} size="sm">
          Activity Log
        </Heading>
        <Text className="text-muted mt-1">
          A chronological record of actions performed on your account.
        </Text>
      </div>
      <ActivityLog />
    </div>
  );
}
