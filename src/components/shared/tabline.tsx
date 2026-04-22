'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cn } from '@/lib/utils.ts';

export function Tabline({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Root>) {
  return (
    <BaseTabs.Root
      data-slot="tabline"
      className={cn('inline-flex flex-col gap-2.5 max-sm:w-full', className)}
      {...props}
    />
  );
}

export function TablineList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      data-slot="tabline-list"
      className={cn(
        'relative z-0 flex items-center gap-6 overflow-x-auto',
        className,
      )}
      {...props}
    >
      {children}
      <BaseTabs.Indicator
        data-slot="tabline-indicator"
        className={cn(
          'absolute bottom-0 left-0 h-0.5 w-(--active-tab-width)',
          'translate-x-(--active-tab-left)',
          'duration-100 z-[-1] transition-all',
          'bg-primary',
        )}
      />
    </BaseTabs.List>
  );
}

export function TablineItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      data-slot="tabline-item"
      className={cn(
        'flex items-center justify-center gap-2.5 rounded cursor-pointer',
        'h-12 py-1 text-muted hover:not-[[data-disabled]]:text-foreground flex-1 font-medium',
        'data-active:text-foreground transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        '[&_svg:not([class*=size-])]:size-4',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function TablinePanel({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      data-slot="tabline-panel"
      className={cn('outline-none', className)}
      {...props}
    />
  );
}
