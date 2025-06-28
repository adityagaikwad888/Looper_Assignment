
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../App';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden mr-4 text-slate-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
          
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
