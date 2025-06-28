import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

interface Filters {
  status: string;
  category: string;
  amountMin: string;
  amountMax: string;
  dateStart: string;
  dateEnd: string;
  sortBy: string;
  order: "asc" | "desc";
  page: number;
  limit: number;
}

interface TransactionsListProps {
  filters: Filters;
}

interface Transaction {
  _id: string;
  id: number;
  amount: number;
  category: string;
  status: string;
  date: string;
  user_id: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const fetchTransactions = async (
  filters: Filters
): Promise<TransactionsResponse> => {
  // Build the query parameters for the backend
  const queryParams = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    order: filters.order,
    ...(filters.status && { status: filters.status }),
    ...(filters.category && { category: filters.category }),
    ...(filters.dateStart && { dateFrom: filters.dateStart }),
    ...(filters.dateEnd && { dateTo: filters.dateEnd }),
  };

  // Use POST /transactions/query for advanced filtering with amount ranges
  if (filters.amountMin || filters.amountMax) {
    const response = await axios.post(
      "http://localhost:3000/api/transactions/query",
      {
        ...queryParams,
        ...(filters.amountMin &&
          filters.amountMin !== "" && {
            amountMin: parseFloat(filters.amountMin),
          }),
        ...(filters.amountMax &&
          filters.amountMax !== "" && {
            amountMax: parseFloat(filters.amountMax),
          }),
      }
    );

    // If the response has the expected format (from queryTransactions endpoint)
    if (response.data.data) {
      return {
        transactions: response.data.data,
        pagination: {
          currentPage: response.data.page,
          totalPages: response.data.totalPages,
          totalCount: response.data.total,
          hasNext: response.data.page < response.data.totalPages,
          hasPrev: response.data.page > 1,
        },
      };
    }
    return response.data;
  } else {
    // Use GET /transactions for simple filtering
    const response = await axios.get("http://localhost:3000/api/transactions", {
      params: queryParams,
    });
    return response.data;
  }
};

const TransactionsList = ({ filters }: TransactionsListProps) => {
  const [currentFilters, setCurrentFilters] = useState(filters);

  // Update query when filters change with a slight delay to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentFilters(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["transactions", currentFilters],
    queryFn: () => fetchTransactions(currentFilters),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  const handlePageChange = (newPage: number) => {
    setCurrentFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? "+" : "-";
    return `${sign}$${absAmount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <p>Error loading transactions</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Transactions</CardTitle>
          <div className="text-sm text-slate-400">
            {isLoading
              ? "Loading..."
              : `${pagination?.totalCount || 0} total transactions`}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && !transactionsData ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-32"></div>
                      <div className="h-3 bg-slate-700 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No transactions found</p>
            <p className="text-slate-500 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {transaction.user_id
                        ? transaction.user_id.charAt(0).toUpperCase()
                        : "T"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Transaction #{transaction.id}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {formatDate(transaction.date)} •{" "}
                      {transaction.user_id || "Unknown User"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatAmount(transaction.amount)}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {transaction.category}
                    </p>
                  </div>

                  <Badge
                    variant={getStatusBadgeVariant(transaction.status)}
                    className="min-w-[80px] justify-center"
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext || isLoading}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
