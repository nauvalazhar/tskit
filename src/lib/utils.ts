import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UAParser } from 'ua-parser-js';
import { SUBSCRIPTION_STATUSES } from '@/lib/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseUserAgent(ua?: string | null) {
  if (!ua) return { browser: 'Unknown browser', os: 'Unknown OS' };
  const result = UAParser(ua);
  const browser = result.browser;
  const os = result.os;
  return {
    browser: browser.name
      ? `${browser.name}${browser.version ? ` ${browser.version}` : ''}`
      : 'Unknown browser',
    os: os.name
      ? `${os.name}${os.version ? ` ${os.version}` : ''}`
      : 'Unknown OS',
  };
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function formatFullDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price / 100);
}

export function formatEntitlement(
  key: string,
  value: boolean | number,
  registry: Record<string, { label: string; type?: string }>,
): string | null {
  const entry = registry[key];
  if (!entry) return null;

  if (typeof value === 'boolean') {
    return value ? entry.label : null;
  }

  if (entry.type === 'limit') {
    if (value === -1) return `Unlimited ${entry.label.toLowerCase()}`;
    return `Up to ${value} ${entry.label.toLowerCase()}`;
  }

  return null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getSubscriptionStatus(status: string) {
  return SUBSCRIPTION_STATUSES[status];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

export function pageTitle(page?: string): string {
  const app = import.meta.env.VITE_APP_NAME;
  return page ? `${page} | ${app}` : app;
}
