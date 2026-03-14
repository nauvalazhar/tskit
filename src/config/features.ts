export const featureRegistry = {
  projects: { label: 'Projects', type: 'limit' },
  storage: { label: 'Storage (GB)', type: 'limit' },
  analytics: { label: 'Advanced Analytics', type: 'boolean' },
  'priority-support': { label: 'Priority Support', type: 'boolean' },
  'custom-integrations': { label: 'Custom Integrations', type: 'boolean' },
  sso: { label: 'SSO & SAML', type: 'boolean' },
  'dedicated-support': { label: 'Dedicated Support', type: 'boolean' },
} as const;

export type FeatureKey = keyof typeof featureRegistry;
