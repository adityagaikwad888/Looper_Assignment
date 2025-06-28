import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Filters {
  status: string;
  category: string;
  amountMin: string;
  amountMax: string;
  dateStart: string;
  dateEnd: string;
  sortBy: string;
  order: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface TransactionsListProps {
  filters: Filters;
}

// Mock data - in real app this would come from API
const allTransactions = [
  {
    id: 1,
    name: 'Matheus Ferrero',
    date: 'Mon, 25 Apr 2024',
    amount: 854.08,
    status: 'Completed',
    category: 'Revenue',
    type: 'income'
  },
  {
    id: 2,
    name: 'Floyd Miles',
    date: 'Sun, 24 Apr 2024',
    amount: -239.65,
    status: 'Completed',
    category: 'Transfer',
    type: 'expense'
  },
  {
    id: 3,
    name: 'Jerome Bell',
    date: 'Sat, 23 Apr 2024',
    amount: -129.78,
    status: 'Pending',
    category: 'Expense',
    type: 'expense'
  },
  {
    id: 4,
    name: 'Kristin Watson',
    date: 'Fri, 22 Apr 2024',
    amount: 1200.00,
    status: 'Paid',
    category: 'Revenue',
    type: 'income'
  },
  {
    id: 5,
    name: 'Brooklyn Simmons',
    date: 'Thu, 21 Apr 2024',
    amount: -450.25,
    status: 'Failed',
    category: 'Transfer',
    type: 'expense'
  },
];

const TransactionsList = ({ filters }: TransactionsListProps) => {
  // Filter transactions based on current filters
  const filteredTransactions = allTransactions.filter(transaction => {
    if (filters.status && transaction.status !== filters.status) return false;
    if (filters.category && transaction.category !== filters.category) return false;
    if (filters.amountMin && Math.abs(transaction.amount) < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax && Math.abs(transaction.amount) > parseFloat(filters.amountMax)) return false;
    
    // Date filtering
    if (filters.dateStart || filters.dateEnd) {
      const transactionDate = new Date(transaction.date);
      
      if (filters.dateStart) {
        const startDate = new Date(filters.dateStart);
        if (transactionDate < startDate) return false;
      }
      
      if (filters.dateEnd) {
        const endDate = new Date(filters.dateEnd);
        if (transactionDate > endDate) return false;
      }
    }
    
    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'amount':
        aValue = Math.abs(a.amount);
        bValue = Math.abs(b.amount);
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'date':
      default:
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
    }

    if (filters.order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'Failed':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  const totalPages = Math.ceil(sortedTransactions.length / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + filters.limit);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            All Transactions ({sortedTransactions.length})
          </CardTitle>
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1}-{Math.min(startIndex + filters.limit, sortedTransactions.length)} of {sortedTransactions.length}
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
                <th className="text-left py-3 text-slate-400 font-medium">Category</th>
                <th className="text-left py-3 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
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
                    <span className={`font-semibold ${
                      transaction.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {transaction.category}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === filters.page ? "default" : "outline"}
                  size="sm"
                  className={page === filters.page 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "border-slate-700 text-slate-300"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page >= totalPages}
              className="border-slate-700 text-slate-300"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
