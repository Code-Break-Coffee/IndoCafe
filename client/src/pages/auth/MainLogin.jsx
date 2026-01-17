import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/useTheme';
import { Sun, Moon, Lock, ChefHat, Users, Shield, Briefcase } from 'lucide-react';

const MainLogin = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const loginOptions = [
    {
      role: 'Admin',
      icon: Shield,
      color: 'bg-red-600 hover:bg-red-700',
      path: '/login',
      description: 'Super Admin Access',
    },
    {
      role: 'Manager',
      icon: Briefcase,
      color: 'bg-green-600 hover:bg-green-700',
      path: '/login',
      description: 'Outlet Manager Access',
    },
    {
      role: 'Kitchen',
      icon: ChefHat,
      color: 'bg-orange-600 hover:bg-orange-700',
      path: '/kitchen/login',
      description: 'Kitchen Staff Access',
    },
    {
      role: 'Waiter',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/waiter/login',
      description: 'Waiter Staff Access',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-surface text-text shadow-md hover:bg-secondary/10 transition-colors"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">IndoCafe</h1>
          <p className="text-secondary text-lg">Select your role to login</p>
        </div>

        {/* Login Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loginOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.role}
                onClick={() => navigate(option.path)}
                className={`${option.color} text-white rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col items-center gap-4`}
              >
                <IconComponent className="h-12 w-12" />
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{option.role}</h3>
                  <p className="text-sm opacity-90 mt-1">{option.description}</p>
                </div>
                <Lock className="h-5 w-5 mt-4 opacity-75" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-secondary text-sm mt-8">Need help? Contact your administrator</p>
      </div>
    </div>
  );
};

export default MainLogin;
