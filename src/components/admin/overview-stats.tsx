import { Card, CardBody } from '@/components/selia/card';
import { Building2Icon, CreditCardIcon, DollarSignIcon, UserPlusIcon, UsersIcon } from 'lucide-react';

type Stats = {
  totalUsers: number;
  totalTeams: number;
  activeSubscriptions: number;
  mrr: number;
  recentSignups: number;
};

export function OverviewStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
    },
    {
      label: 'Total Teams',
      value: stats.totalTeams.toLocaleString(),
      icon: Building2Icon,
    },
    {
      label: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      icon: CreditCardIcon,
    },
    {
      label: 'Estimated MRR',
      value: `$${(stats.mrr / 100).toFixed(2)}`,
      icon: DollarSignIcon,
    },
    {
      label: 'Signups (30d)',
      value: stats.recentSignups.toLocaleString(),
      icon: UserPlusIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardBody className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <card.icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-muted">{card.label}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
