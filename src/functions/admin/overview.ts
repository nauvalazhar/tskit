import { createServerFn } from '@tanstack/react-start';
import { adminMiddleware } from '@/middleware/admin';
import { getOverviewStats } from '@/services/admin/overview.service';

export const getAdminOverview = createServerFn()
  .middleware([adminMiddleware])
  .handler(async () => {
    return getOverviewStats();
  });
