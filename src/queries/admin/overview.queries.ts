import { queryOptions } from '@tanstack/react-query';
import { getAdminOverview } from '@/functions/admin/overview';

export function adminOverviewQuery() {
  return queryOptions({
    queryKey: ['admin', 'overview'],
    queryFn: () => getAdminOverview(),
  });
}
