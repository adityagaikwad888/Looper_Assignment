import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import TransactionFilters from "@/components/TransactionFilters";
import TransactionsList from "@/components/TransactionsList";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Transactions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    amountMin: "",
    amountMax: "",
    dateStart: "",
    dateEnd: "",
    sortBy: "date",
    order: "desc" as "asc" | "desc",
    page: 1,
    limit: 10,
  });

  // Handle navigation state from "See all" button
  useEffect(() => {
    if (location.state?.defaultFilters) {
      setFilters(location.state.defaultFilters);
    }
  }, [location.state]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1 });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setFilters((prev) => ({
      ...prev,
      search: searchValue,
      page: 1, // Reset to first page when searching
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
          </div>

          <div className="relative w-full max-w-md mx-auto mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search transactions, users, amounts, categories..."
              className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          <TransactionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          <TransactionsList filters={filters} />
        </main>
      </div>
    </div>
  );
};

export default Transactions;
