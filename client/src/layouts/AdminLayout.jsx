import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextValues';
import { useTheme } from '../context/useTheme';
import { LayoutDashboard, Store, Users, BarChart3, LogOut, Menu, Bell, Sun, Moon, Utensils } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path)
      ? 'bg-primary text-on-primary'
      : 'text-secondary hover:bg-secondary/10 hover:text-text';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-secondary/10 hidden md:flex flex-col">
        <div className="p-6 border-b border-secondary/10">
          <h1 className="text-2xl font-bold text-primary">IndoCafe</h1>
          <p className="text-xs text-secondary mt-1">Super Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin/overview"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/overview')}`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Overview
          </Link>
          <Link
            to="/admin/outlets"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/outlets')}`}
          >
            <Store className="h-5 w-5 mr-3" />
            Outlets
          </Link>
          <Link
            to="/admin/menu"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/menu')}`}
          >
            <Utensils className="h-5 w-5 mr-3" />
            Global Menu
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/users')}`}
          >
            <Users className="h-5 w-5 mr-3" />
            Staff
          </Link>
          <Link
            to="/admin/analytics"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/analytics')}`}
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-secondary/10">
          <div className="flex items-center px-4 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="text-xs text-secondary capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-surface shadow-sm z-10 border-b border-secondary/10">
          <div className="flex items-center justify-between px-6 py-4">
            <button className="md:hidden text-secondary focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold text-text">
              {location.pathname.split('/').pop().replace('-', ' ').toUpperCase()}
            </h2>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-secondary hover:text-text rounded-full hover:bg-secondary/10 transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button className="p-2 text-secondary hover:text-text rounded-full hover:bg-secondary/10 transition-colors">
                <Bell className="h-5 w-5" />
              </button>

              <div className="h-6 w-px bg-secondary/20 mx-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
