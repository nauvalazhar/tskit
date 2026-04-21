import { getRequestIP, getRequestHeaders } from '@tanstack/react-start/server';
import { log, type AuditLogEntry } from '@/services/audit.service';

export const audit = {
  async log(entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent'>): Promise<void> {
    const ip = getRequestIP({ xForwardedFor: true });
    const headers = await getRequestHeaders();
    const userAgent = headers.get('user-agent');

    return log({
      ...entry,
      ipAddress: ip || null,
      userAgent: userAgent || null,
    });
  },
};
