import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import TransactionFilters from "@/components/TransactionFilters";
import TransactionsList from "@/components/TransactionsList";

const Transactions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
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

  const handleFiltersChange = (newFilters: typeof filters) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1 });
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
