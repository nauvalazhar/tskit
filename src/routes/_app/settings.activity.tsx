import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { createFileRoute } from '@tanstack/react-router';
import { ActivityLog } from '@/components/settings/activity-log';
import { userAuditLogsQuery } from '@/queries/audit.queries';

export const Route = createFileRoute('/_app/settings/activity')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userAuditLogsQuery()),
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
