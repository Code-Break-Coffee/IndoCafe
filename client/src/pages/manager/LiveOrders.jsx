import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContextValues';
import api from '../../lib/axios';
import { Clock, CheckCircle, Package, ChefHat, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
// import { useTheme } from '../../context/ThemeContext';

// eslint-disable-next-line no-unused-vars
const StatusCard = ({ title, count, Icon, color, children }) => (
  <div
    className={`flex flex-col h-full bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
  >
    <div
      className={`p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center ${color} bg-opacity-10 dark:bg-opacity-20`}
    >
      <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
        <Icon size={18} />
        {title}
      </div>
      <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm text-gray-800 dark:text-gray-200">
        {count}
      </span>
    </div>
    <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">{children}</div>
  </div>
);

const OrderCard = ({ order, onStatusUpdate }) => {
  const timeElapsed = Math.floor((new Date() - new Date(order.createdAt)) / 60000);

  const getNextStatus = (current) => {
    switch (current) {
      case 'placed':
        return 'cooking';
      case 'cooking':
        return 'ready';
      case 'ready':
        return 'delivered'; // or out_for_delivery
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">#{order._id.slice(-6)}</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1
          ${timeElapsed > 30 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
        >
          <Clock size={10} /> {timeElapsed}m
        </span>
      </div>

      <div className="mb-3">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between text-sm py-1 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-gray-800 dark:text-gray-200">
              <span className="font-bold mr-2">{item.quantity}x</span>
              {item.menuItem?.name || item.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="font-bold text-gray-800 dark:text-white">${order.totalAmount?.toFixed(2)}</span>

        {nextStatus && (
          <button
            onClick={() => onStatusUpdate(order._id, nextStatus)}
            className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
          >
            Mark {nextStatus}
          </button>
        )}
      </div>
    </div>
  );
};

const LiveOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const outletId = user?.defaultOutletId || user?.outletId;

  const fetchOrders = useCallback(async () => {
    if (!outletId) return;
    try {
      // Fetch active orders only? or all and filter client side?
      // Let's fetch active for live board
      const res = await api.get(`/api/manager/orders/${outletId}?status=active`);
      if (res.data.success) {
        setOrders(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Don't toast on polling error to avoid spam
      if (loading) toast.error('Failed to load live orders');
    } finally {
      setLoading(false);
    }
  }, [outletId, loading]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchOrders]); // Remove loading from dep array

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/api/manager/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order updated to ${newStatus}`);
        fetchOrders(); // Refresh immediately
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update status');
    }
  };

  const getOrdersByStatus = (status) => orders.filter((o) => o.status === status);

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Package className="text-primary" /> Live Kitchen Display
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time order tracking • Auto-refreshing every 15s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={fetchOrders}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
            title="Refresh Now"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
        {/* New Orders */}
        <StatusCard
          title="New Orders"
          count={getOrdersByStatus('placed').length}
          Icon={AlertCircle}
          color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        >
          {getOrdersByStatus('placed').map((order) => (
            <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
          ))}
          {getOrdersByStatus('placed').length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No new orders</div>
          )}
        </StatusCard>

        {/* Preparing */}
        <StatusCard
          title="Preparing"
          count={getOrdersByStatus('cooking').length}
          Icon={ChefHat}
          color="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
        >
          {getOrdersByStatus('cooking').map((order) => (
            <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
          ))}
          {getOrdersByStatus('cooking').length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">Kitchen is clear</div>
          )}
        </StatusCard>

        {/* Ready / Delivery */}
        <StatusCard
          title="Ready for Pickup/Delivery"
          count={getOrdersByStatus('ready').length + getOrdersByStatus('out_for_delivery').length}
          Icon={CheckCircle}
          color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        >
          {[...getOrdersByStatus('ready'), ...getOrdersByStatus('out_for_delivery')].map((order) => (
            <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
          ))}
          {[...getOrdersByStatus('ready'), ...getOrdersByStatus('out_for_delivery')].length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">Nothing ready yet</div>
          )}
        </StatusCard>
      </div>
    </div>
  );
};

export default LiveOrders;
