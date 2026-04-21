'use client';

import { cn } from '@/lib/utils.ts';

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <table
      data-slot="table"
      className={cn('w-full text-table-foreground text-left', className)}
      {...props}
    />
  );
}

export function TableContainer({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="table-container"
      {...props}
      className={cn('overflow-x-auto', props.className)}
    />
  );
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b [&_tr]:border-separator', className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-table-separator last:border-none hover:bg-table-accent',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'px-6 py-2 text-muted font-medium bg-table-head border-y border-table-separator',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-6 py-4',
        'has-[a]:p-0 *:[a]:px-6 *:[a]:py-4 *:[a]:inline-flex *:[a]:w-full',
        className,
      )}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted', className)}
      {...props}
    />
  );
}
