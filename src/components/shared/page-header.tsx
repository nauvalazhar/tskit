import { cn } from '@/lib/utils';

export function PageHeader({ children }: React.ComponentProps<'header'>) {
  return (
    <header
      className={cn(
        'mb-8',
        '**:data-[slot="tabline"]:mt-4',
        'has-data-[slot="tabline"]:pb-0',
        'has-data-[slot="tabline"]:border-b',
        'has-data-[slot="tabline"]:border-separator',
      )}
    >
      {children}
    </header>
  );
}
