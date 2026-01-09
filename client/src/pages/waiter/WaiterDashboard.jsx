import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContextValues';
import api from '../../lib/axios';
import { UtensilsCrossed, CheckCircle, Clock, MapPin, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const WaiterOrderCard = ({ order, onMarkServed }) => {
  const timeElapsed = Math.floor((new Date() - new Date(order.updatedAt)) / 60000); // Time since ready

  return (
    <div className="bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            Order #{order._id.slice(-4)}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Clock size={12} /> Ready {timeElapsed}m ago
          </p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          Ready to Serve
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-gray-700 dark:text-gray-300 flex gap-2">
            <span className="font-bold">{item.quantity}x</span>
            <span>{item.menuItem?.name || item.name}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onMarkServed(order._id)}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <CheckCircle size={20} />
        Mark Served / Delivered
      </button>
    </div>
  );
};

const ActiveTableCard = ({ table }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">
        {table.label}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{table.capacity} Seats</p>
        <p className="text-xs text-gray-500">Floor {table.floor}</p>
      </div>
    </div>
    <div className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Occupied</div>
  </div>
);

const WaiterDashboard = () => {
  const { user } = useAuth();
  const [readyOrders, setReadyOrders] = useState([]);
  const [occupiedTables, setOccupiedTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const outletId = user?.defaultOutletId || user?.outletId;

  const fetchData = useCallback(async () => {
    if (!outletId) return;
    try {
      // 1. Fetch Ready Orders
      const ordersRes = await api.get(`/api/manager/orders/${outletId}?status=active`);
      if (ordersRes.data.success) {
        // Filter for 'ready' status
        setReadyOrders(ordersRes.data.data.filter((o) => o.status === 'ready'));
      }

      // 2. Fetch Active Tables (Occupied)
      const tablesRes = await api.get(`/api/manager/tables/${outletId}`);
      if (tablesRes.data.success) {
        setOccupiedTables(tablesRes.data.data.filter((t) => t.isOccupied));
      }
    } catch (error) {
      console.error('Failed to fetch waiter data:', error);
    } finally {
      setLoading(false);
    }
  }, [outletId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkServed = async (orderId) => {
    try {
      const res = await api.put(`/api/manager/orders/${orderId}/status`, { status: 'delivered' });
      if (res.data.success) {
        toast.success('Order delivered successfully!');
        fetchData();
      }
    } catch {
      toast.error('Failed to update order');
    }
  };

  if (loading && readyOrders.length === 0 && occupiedTables.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-4 pb-20">
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <UtensilsCrossed size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">Waiter Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Serving {occupiedTables.length} Active Tables
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ready to Serve List (Takes up 2/3 on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
            <CheckCircle size={20} /> Ready to Serve ({readyOrders.length})
          </h2>

          {readyOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-200 dark:border-gray-700 border-dashed">
              <p>No orders ready for pickup.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyOrders.map((order) => (
                <WaiterOrderCard key={order._id} order={order} onMarkServed={handleMarkServed} />
              ))}
            </div>
          )}
        </div>

        {/* Active Tables List (Sidebar) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
            <MapPin size={20} /> Occupied Tables
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 min-h-[300px]">
            {occupiedTables.map((table) => (
              <ActiveTableCard key={table._id} table={table} />
            ))}
            {occupiedTables.length === 0 && (
              <div className="text-center text-gray-400 py-10 text-sm">No tables occupied.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;
