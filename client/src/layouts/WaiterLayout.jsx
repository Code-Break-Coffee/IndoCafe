import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextValues';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon } from 'lucide-react';

const WaiterLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/waiter/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col flex-1">
        {/* Top Navigation */}
        <header className="bg-surface border-b border-secondary/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">IndoCafe Waiter</h1>
            <p className="text-xs text-secondary">Waiter Operations</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-text transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-secondary/10">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-600 flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0) || 'W'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-text">{user?.name}</p>
                <p className="text-xs text-secondary capitalize">Waiter Staff</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WaiterLayout;
