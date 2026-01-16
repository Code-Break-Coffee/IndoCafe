import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContextValues';
import { useOutlet } from '../../context/OutletContextValues';
import api from '../../lib/axios';
import { ChefHat, Flame, CheckCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const KitchenOrderCard = ({ order, onStatusUpdate }) => {
  const timeElapsed = Math.floor((new Date() - new Date(order.createdAt)) / 60000);
  const isUrgent = timeElapsed > 20;

  return (
    <div
      className={`flex flex-col border-2 rounded-xl p-4 shadow-sm transition-all
      ${
        order.status === 'placed'
          ? 'bg-white border-blue-200 dark:bg-gray-800 dark:border-blue-900/50'
          : 'bg-orange-50 border-orange-200 dark:bg-gray-800 dark:border-orange-900/50'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-mono font-bold px-2 py-1 rounded text-lg">
              #{order._id.slice(-4)}
            </span>
            {order.tableId && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-bold">
                Table {order.tableId?.label || 'N/A'}
              </span>
            )}
            {!order.tableId && (
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm font-bold">
                Takeaway
              </span>
            )}
            {isUrgent && (
              <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase animate-pulse">
                <AlertTriangle size={14} /> Urgent
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium">
          <Clock size={16} />
          <span>{timeElapsed}m</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-3 mb-6">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-lg">
            <span className="font-extrabold text-primary min-w-6">{item.quantity}x</span>
            <div className="leading-tight">
              <span className="text-gray-800 dark:text-white font-medium block">
                {item.menuItem?.name || item.name}
              </span>
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="text-sm text-gray-500 mt-1 italic">{item.modifiers.join(', ')}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onStatusUpdate(order._id, 'ready')}
          className="w-full py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200 dark:shadow-none"
        >
          <CheckCircle size={24} />
          Mark Ready
        </button>
      </div>
    </div>
  );
};

const KitchenDashboard = () => {
  const { user } = useAuth();
  const { selectedOutlet } = useOutlet();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // For admin: use selected outlet from context, for staff: use their assigned outlet
  const outletId = user?.role === 'SUPER_ADMIN' ? selectedOutlet?._id : user?.defaultOutletId || user?.outletId;

  const fetchOrders = useCallback(async () => {
    if (!outletId) return;
    try {
      // Kitchen only sees orders that have been accepted (cooking status)
      const res = await api.get(`/api/manager/orders/${outletId}?status=active`);
      if (res.data.success) {
        // Kitchen only shows 'cooking' orders (already accepted by waiter/manager)
        const kitchenOrders = res.data.data.filter((o) => o.status === 'cooking');
        setOrders(kitchenOrders);
      }
    } catch (error) {
      console.error('Failed to fetch kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  }, [outletId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/api/manager/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success('Order ready for service!');
        fetchOrders(); // Refresh
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const cookingOrders = orders; // All orders are 'cooking' status

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ChefHat size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-none">Kitchen Display</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{orders.length} Active Tickets</p>
          </div>
        </div>
        <button
          onClick={fetchOrders}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 h-[calc(100vh-140px)]">
        {/* Cooking Column - Single column showing all accepted orders */}
        <div className="flex flex-col bg-orange-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-orange-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
            Orders to Prepare ({cookingOrders.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {cookingOrders.map((order) => (
              <KitchenOrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
            {cookingOrders.length === 0 && (
              <div className="text-center py-20 text-gray-400 font-medium">
                No orders to prepare. Waiting for waiter/manager to accept orders.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
