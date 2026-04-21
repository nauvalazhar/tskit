const ACTION_LABELS: Record<string, string> = {
  // Auth
  'user.login': 'Signed in',
  'user.logout': 'Signed out',

  // Settings
  'settings.profile.updated': 'Updated profile setting',
  'settings.password.changed': 'Changed password',
  'settings.2fa.enabled': 'Enabled two-factor authentication',
  'settings.2fa.disabled': 'Disabled two-factor authentication',
  'settings.account.deleted': 'Deleted account',

  // Billing
  'billing.checkout.created': 'Started checkout',
  'billing.subscription.cancelled': 'Cancelled subscription',

  // Admin
  'admin.user.banned': 'Banned user',
  'admin.user.unbanned': 'Unbanned user',
  'admin.user.role.changed': 'Changed user role',
  'admin.user.removed': 'Removed user',
  'admin.subscription.cancelled': 'Cancelled subscription (admin)',
  'admin.subscription.plan.changed': 'Changed subscription plan (admin)',
  'admin.plan.saved': 'Saved plan',
  'admin.plan.activated': 'Activated plan',
  'admin.plan.deactivated': 'Deactivated plan',
};

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function getActionDomain(action: string): string {
  return action.split('.')[0] ?? action;
}

const DOMAIN_OPTIONS = [
  { label: 'All Actions', value: '' },
  { label: 'Settings', value: 'settings' },
  { label: 'Billing', value: 'billing' },
  { label: 'Admin', value: 'admin' },
  { label: 'Auth', value: 'user' },
];

export { DOMAIN_OPTIONS };
