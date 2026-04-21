export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const UPLOAD_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const CURRENCIES = [
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
  { value: 'gbp', label: 'GBP' },
];

export const BILLING_INTERVALS = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

const subscriptionStatuses = {
  active: { variant: 'success', label: 'Active' },
  trialing: { variant: 'info', label: 'Trial' },
  past_due: { variant: 'warning', label: 'Past Due' },
  canceled: { variant: 'secondary', label: 'Canceled' },
  incomplete: { variant: 'warning', label: 'Incomplete' },
  unpaid: { variant: 'danger', label: 'Unpaid' },
} as const;

export type SubscriptionStatus = keyof typeof subscriptionStatuses;

export const SUBSCRIPTION_STATUSES: Record<
  string,
  { variant: 'success' | 'info' | 'warning' | 'danger' | 'secondary'; label: string }
> = subscriptionStatuses;

export const SUBSCRIPTION_STATUS_KEYS = Object.keys(
  subscriptionStatuses,
) as SubscriptionStatus[];

