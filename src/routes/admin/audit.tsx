import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { adminAuditLogsQuery } from '@/queries/admin/audit.queries';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';
import { auditSearchSchema } from '@/validations/audit';

export const Route = createFileRoute('/admin/audit')({
  validateSearch: auditSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      adminAuditLogsQuery({ action: deps.action, cursor: deps.cursor }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Audit Log</Heading>
      </PageHeader>
      <Suspense>
        <AuditLogTable />
      </Suspense>
    </div>
  );
}
