import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContextValues';
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
        <div className="flex items-center gap-2">
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-mono font-bold px-2 py-1 rounded text-lg">
            #{order._id.slice(-4)}
          </span>
          {isUrgent && (
            <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase animate-pulse">
              <AlertTriangle size={14} /> Urgent
            </span>
          )}
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
        {order.status === 'placed' ? (
          <button
            onClick={() => onStatusUpdate(order._id, 'cooking')}
            className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <Flame size={24} />
            Start Cooking
          </button>
        ) : (
          <button
            onClick={() => onStatusUpdate(order._id, 'ready')}
            className="w-full py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200 dark:shadow-none"
          >
            <CheckCircle size={24} />
            Mark Ready
          </button>
        )}
      </div>
    </div>
  );
};

const KitchenDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kitchen mainly cares about default outlet
  const outletId = user?.defaultOutletId || user?.outletId;

  const fetchOrders = useCallback(async () => {
    if (!outletId) return;
    try {
      // Kitchen wants Placed and Cooking orders
      const res = await api.get(`/api/manager/orders/${outletId}?status=active`);
      if (res.data.success) {
        // Filter mainly for kitchen relevant statuses
        const kitchenOrders = res.data.data.filter((o) => ['placed', 'cooking'].includes(o.status));
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
        toast.success(newStatus === 'cooking' ? 'Order started!' : 'Order ready for service!');
        fetchOrders(); // Refresh to remove 'ready' orders or update 'placed'->'cooking'
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'placed');
  const cookingOrders = orders.filter((o) => o.status === 'cooking');

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
        {/* New Orders Column */}
        <div className="flex flex-col bg-gray-200/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            New Orders ({pendingOrders.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {pendingOrders.map((order) => (
              <KitchenOrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-20 text-gray-400 font-medium">No new orders</div>
            )}
          </div>
        </div>

        {/* Cooking Column */}
        <div className="flex flex-col bg-orange-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-orange-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
            Cooking ({cookingOrders.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {cookingOrders.map((order) => (
              <KitchenOrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
            {cookingOrders.length === 0 && (
              <div className="text-center py-20 text-gray-400 font-medium">Nothing on the grill</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
