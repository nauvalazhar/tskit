import { Card, CardBody } from '@/components/selia/card';
import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlanCard({
  popular,
  className,
  ...props
}: React.ComponentProps<'div'> & { popular?: boolean }) {
  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden',
        popular && 'ring-2 ring-primary',
        className,
      )}
      {...props}
    />
  );
}

export function PlanCardPopularBadge({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-primary text-primary-foreground text-center py-2 text-xs tracking-wider font-semibold uppercase',
        className,
      )}
      {...props}
    />
  );
}

export function PlanCardBody({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <CardBody className={cn('flex-1 flex flex-col p-8', className)} {...props} />;
}

export function PlanCardHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2 mb-2', className)} {...props} />;
}

export function PlanCardName({
  className,
  ...props
}: React.ComponentProps<'h3'>) {
  return <Heading level={3} size="sm" className={className} {...props} />;
}

export function PlanCardDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return <Text className={cn('text-muted text-sm mb-6', className)} {...props} />;
}

export function PlanCardPrice({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('mb-6', className)} {...props} />;
}

export function PlanCardPriceAmount({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return <span className={cn('text-5xl font-bold', className)} {...props} />;
}

export function PlanCardPriceInterval({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return <Text className={cn('text-muted text-sm', className)} {...props} />;
}

export function PlanCardAction({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('mb-8', className)} {...props} />;
}

export function PlanCardFeatures({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2.5', className)} {...props} />;
}

export function PlanCardFeature({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex gap-3', className)} {...props}>
      <CheckIcon className="size-5 text-success shrink-0 mt-0.5" />
      <Text className="text-sm">{children}</Text>
    </div>
  );
}
