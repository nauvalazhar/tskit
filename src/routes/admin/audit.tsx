import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { getAuditLogs } from '@/functions/admin/audit';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';
import { auditSearchSchema } from '@/validations/audit';

export const Route = createFileRoute('/admin/audit')({
  validateSearch: auditSearchSchema,
  head: () => ({
    meta: [{ title: pageTitle('Audit Log') }],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getAuditLogs({ data: deps }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Audit Log</Heading>
      </PageHeader>
      <AuditLogTable />
    </div>
  );
}
