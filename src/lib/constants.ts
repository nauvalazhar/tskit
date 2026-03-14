export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const UPLOAD_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const SUBSCRIPTION_STATUS_BADGE: Record<
  string,
  { variant: 'success' | 'warning' | 'danger' | 'secondary'; label: string }
> = {
  active: { variant: 'success', label: 'Active' },
  trialing: { variant: 'info' as any, label: 'Trial' },
  past_due: { variant: 'warning', label: 'Past Due' },
  canceled: { variant: 'secondary', label: 'Canceled' },
  incomplete: { variant: 'warning', label: 'Incomplete' },
  unpaid: { variant: 'danger', label: 'Unpaid' },
};
