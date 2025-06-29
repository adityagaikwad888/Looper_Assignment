import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar } from "lucide-react";

interface Transaction {
  id: string;
  name: string;
  lastDate: string;
  totalRevenue: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  formattedRevenue: string;
  revenueColor: string;
  formattedExpenses: string;
  expensesColor: string;
  formattedNetAmount: string;
  netAmountColor: string;
}

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/transactions/table?page=${currentPage}&limit=10`
      );
      const data = await response.json();

      if (data.transactions) {
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-slate-400">Loading transactions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Transactions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 text-slate-400 font-medium">
                  User Name
                </th>
                <th className="text-left py-3 text-slate-400 font-medium">
                  Last Transaction
                </th>
                <th className="text-left py-3 text-slate-400 font-medium">
                  Revenue
                </th>
                <th className="text-left py-3 text-slate-400 font-medium">
                  Expenses
                </th>
                <th className="text-left py-3 text-slate-400 font-medium">
                  Net Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-800/50"
                >
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {transaction.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white font-medium">
                          {transaction.name}
                        </span>
                        <div className="text-xs text-slate-400">
                          {transaction.transactionCount} transactions
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-400">
                    {transaction.lastDate}
                  </td>
                  <td className="py-4">
                    <span
                      className={`font-semibold ${transaction.revenueColor}`}
                    >
                      {transaction.formattedRevenue}
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`font-semibold ${transaction.expensesColor}`}
                    >
                      {transaction.formattedExpenses}
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`font-semibold ${transaction.netAmountColor}`}
                    >
                      {transaction.formattedNetAmount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;
