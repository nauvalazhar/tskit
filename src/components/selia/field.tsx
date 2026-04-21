'use client';

import { cn } from '@/lib/utils.ts';

export function Field({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field"
      className={cn('flex gap-2 flex-col', className)}
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn('text-foreground flex items-center gap-3', className)}
      {...props}
    />
  );
}

export function FieldDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-muted text-sm leading-relaxed', className)}
      {...props}
    />
  );
}

export function FieldError({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="field-error"
      className={cn('text-danger text-sm', className)}
      {...props}
    />
  );
}
