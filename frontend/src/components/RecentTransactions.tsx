import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fetchRecentTransactions = async () => {
  const response = await axios.get(
    "http://localhost:3000/api/transactions/recent"
  );
  return response.data;
};

const RecentTransactions = () => {
  const [hoveredTransaction, setHoveredTransaction] = useState(null);
  const navigate = useNavigate();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: fetchRecentTransactions,
  });

  const handleSeeAllClick = () => {
    // Navigate to transactions page with default sort by date descending
    navigate("/transactions", {
      state: {
        defaultFilters: {
          search: "",
          status: "",
          category: "",
          amountMin: "",
          amountMax: "",
          dateStart: "",
          dateEnd: "",
          sortBy: "date",
          order: "desc",
          page: 1,
          limit: 10,
        },
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  };

  const getAmountColor = (transaction) => {
    // Check category first, then amount
    // Use type field which is the lowercase version of category
    const category = transaction.type ? transaction.type.toLowerCase() : "";

    if (category === "revenue") {
      return "text-emerald-400"; // Green for revenue
    } else if (category === "expense") {
      if (transaction.status === "Paid") {
        return "text-red-400"; // Red for paid expenses
      } else {
        return "text-yellow-400"; // Yellow for unpaid expenses
      }
    } else if (transaction.amount > 0) {
      return "text-emerald-400"; // Green for positive amounts (fallback)
    }
    return "text-red-400"; // Red for negative amounts (fallback)
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <TooltipProvider>
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <button
              onClick={handleSeeAllClick}
              className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
            >
              See all
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-slate-400">Loading transactions...</div>
          ) : (
            transactions.map((transaction) => (
              <Tooltip key={transaction.id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredTransaction(transaction)}
                    onMouseLeave={() => setHoveredTransaction(null)}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {transaction.user_id
                          ? transaction.user_id.charAt(0).toUpperCase()
                          : "T"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {transaction.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${getAmountColor(
                        transaction
                      )}`}
                    >
                      {transaction.amount > 0 ? "+" : ""}$
                      {Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-slate-800 border-slate-700 text-white p-3 max-w-xs"
                >
                  <div className="space-y-2">
                    <div className="font-semibold">
                      Transaction #{transaction.id}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-slate-400">User:</span>{" "}
                        {transaction.user_id}
                      </div>
                      <div>
                        <span className="text-slate-400">Category:</span>{" "}
                        {transaction.type
                          ? transaction.type.charAt(0).toUpperCase() +
                            transaction.type.slice(1)
                          : "Unknown"}
                      </div>
                      <div>
                        <span className="text-slate-400">Date:</span>{" "}
                        {formatFullDate(transaction.date)}
                      </div>
                      <div>
                        <span className="text-slate-400">Amount:</span>
                        <span
                          className={`ml-1 font-semibold ${getAmountColor(
                            transaction
                          )}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}$
                          {Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default RecentTransactions;
