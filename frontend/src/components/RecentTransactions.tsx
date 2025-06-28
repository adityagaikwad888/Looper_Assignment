import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchRecentTransactions = async () => {
  const response = await axios.get(
    "http://localhost:3000/api/transactions/recent"
  );
  return response.data;
};

const RecentTransactions = () => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: fetchRecentTransactions,
  });
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <button className="text-emerald-400 text-sm hover:text-emerald-300">
            See all
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-slate-400">Loading transactions...</div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {transaction.name ? transaction.name.charAt(0) : "T"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {transaction.type}
                </p>
                <p className="text-xs text-slate-400">
                  {transaction.name || `Transaction #${transaction.id}`}
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  transaction.amount > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}$
                {Math.abs(transaction.amount).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
