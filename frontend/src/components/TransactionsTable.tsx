
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar } from 'lucide-react';

const transactions = [
  {
    id: 1,
    name: 'Matheus Ferrero',
    date: 'Sat,20 Apr 2020',
    amount: '+$80.09',
    status: 'Completed',
    color: 'text-emerald-400',
    statusColor: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    id: 2,
    name: 'Floyd Miles',
    date: 'Fri,19 Apr 2020',
    amount: '-$7.03',
    status: 'Completed',
    color: 'text-red-400',
    statusColor: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    id: 3,
    name: 'Jerome Bell',
    date: 'Tue,19 Apr 2020',
    amount: '-$30.09',
    status: 'Pending',
    color: 'text-red-400',
    statusColor: 'bg-yellow-500/10 text-yellow-400',
  },
];

const TransactionsTable = () => {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Transactions</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search for anything..."
                className="pl-10 w-64 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">10 May - 20 May</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 text-slate-400 font-medium">Date</th>
                <th className="text-left py-3 text-slate-400 font-medium">Amount</th>
                <th className="text-left py-3 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-800/50">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {transaction.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white font-medium">{transaction.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-400">{transaction.date}</td>
                  <td className="py-4">
                    <span className={`font-semibold ${transaction.color}`}>
                      {transaction.amount}
                    </span>
                  </td>
                  <td className="py-4">
                    <Badge className={transaction.statusColor}>
                      {transaction.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;
