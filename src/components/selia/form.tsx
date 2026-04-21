'use client';

import { cn } from '@/lib/utils.ts';

export function Form({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  return (
    <form
      data-slot="form"
      className={cn('flex flex-col gap-6', className)}
      {...props}
    />
  );
}
