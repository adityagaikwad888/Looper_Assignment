
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import MetricsCards from '@/components/MetricsCards';
import OverviewChart from '@/components/OverviewChart';
import RecentTransactions from '@/components/RecentTransactions';
import TransactionsTable from '@/components/TransactionsTable';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6 space-y-6">
          <MetricsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OverviewChart />
            </div>
            <div>
              <RecentTransactions />
            </div>
          </div>
          
          <TransactionsTable />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
