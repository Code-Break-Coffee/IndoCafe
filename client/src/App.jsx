import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OutletProvider } from './context/OutletContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/admin/Login';
import Home from './pages/Home/Home';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';
import KitchenLayout from './layouts/KitchenLayout';
import WaiterLayout from './layouts/WaiterLayout';

// Admin Pages
import OutletManagement from './pages/admin/OutletManagement';
import Dashboard from './pages/admin/Dashboard';
import GlobalMenu from './pages/admin/GlobalMenu';
import Analytics from './pages/admin/Analytics';
import UserManagement from './pages/admin/UserManagement';

// Manager Pages
import MenuControl from './pages/manager/MenuControl';
import StaffManagement from './pages/manager/StaffManagement';
import TableManagement from './pages/manager/TableManagement';
import LiveOrders from './pages/manager/LiveOrders';

// Kitchen Pages
import KitchenDashboard from './pages/kitchen/KitchenDashboard';

// Waiter Pages
import WaiterDashboard from './pages/waiter/WaiterDashboard';

import { CartProvider } from './context/CartContext';
import CartDrawer from './components/cart/CartDrawer';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OutletProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/home" element={<Home />} />
                <Route path="/:outletId/:tableId" element={<Home />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/unauthorized"
                  element={<div className="p-10 text-center text-2xl text-red-600">Unauthorized Access</div>}
                />

                {/* Super Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="overview" element={<Dashboard />} />
                  <Route path="outlets" element={<OutletManagement />} />
                  <Route path="menu" element={<GlobalMenu />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route index element={<Navigate to="/admin/overview" replace />} />
                </Route>

                {/* Manager Routes */}
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'OUTLET_MANAGER']}>
                      <ManagerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="live-orders" element={<LiveOrders />} />
                  <Route path="menu" element={<MenuControl />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="tables" element={<TableManagement />} />
                  <Route index element={<Navigate to="/manager/live-orders" replace />} />
                </Route>

                {/* Kitchen Routes */}
                <Route
                  path="/kitchen"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'OUTLET_MANAGER', 'KITCHEN']}>
                      <KitchenLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<KitchenDashboard />} />
                </Route>

                {/* Waiter Routes */}
                <Route
                  path="/waiter"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'OUTLET_MANAGER', 'WAITER']}>
                      <WaiterLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<WaiterDashboard />} />
                </Route>

                {/* Dispatcher Routes */}
                <Route
                  path="/dispatcher"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'OUTLET_MANAGER', 'DISPATCHER']}>
                      <div className="p-4">Dispatcher Interface (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>

              <CartDrawer />
              <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            </Router>
          </CartProvider>
        </OutletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
