
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchDashboardSummary = async () => {
  const response = await axios.get('http://localhost:3000/api/dashboard/summary');
  return response.data;
};

const MetricsCards = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
  });

  const metrics = [
    {
      title: 'Balance',
      value: isLoading ? 'Loading...' : `$${summary?.balance?.toLocaleString() || '0'}`,
      icon: CreditCard,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Revenue',
      value: isLoading ? 'Loading...' : `$${summary?.revenue?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Expenses',
      value: isLoading ? 'Loading...' : `$${summary?.expenses?.toLocaleString() || '0'}`,
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Savings',
      value: isLoading ? 'Loading...' : `$${summary?.savings?.toLocaleString() || '0'}`,
      icon: PiggyBank,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-2">{metric.title}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bg}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsCards;
