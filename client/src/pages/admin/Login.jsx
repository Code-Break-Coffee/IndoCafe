import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassicLoader from '@/components/ui/loader';
import { useAuth } from '../../context/AuthContextValues';
import { useTheme } from '../../context/useTheme';
import { Lock, Mail, Sun, Moon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role
      const userRole = result.user?.role;

      if (userRole === 'SUPER_ADMIN') {
        navigate('/admin/overview', { replace: true });
      } else if (userRole === 'OUTLET_MANAGER') {
        navigate('/manager/live-orders', { replace: true });
      } else if (userRole === 'KITCHEN') {
        navigate('/kitchen', { replace: true });
      } else if (userRole === 'WAITER') {
        navigate('/waiter', { replace: true });
      } else if (['CASHIER', 'DISPATCHER', 'RIDER'].includes(userRole)) {
        // For other staff roles, redirect to their respective dashboards
        navigate(`/${userRole.toLowerCase()}`, { replace: true });
      } else {
        // Default fallback
        navigate('/', { replace: true });
      }
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-surface text-text shadow-md hover:bg-secondary/10 transition-colors"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="max-w-md w-full bg-surface rounded-xl shadow-lg overflow-hidden border border-secondary/10">
        <div className="bg-primary p-6 text-center">
          <h2 className="text-3xl font-bold text-on-primary">IndoCafe</h2>
          <p className="text-on-primary/80 mt-2">Login to Your Account</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary transition-colors placeholder-secondary/50"
                  placeholder="admin@indocafe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary transition-colors placeholder-secondary/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <ClassicLoader className="h-4 w-4 border-2 border-white/70 border-t-transparent" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} IndoCafe Restaurant System</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
