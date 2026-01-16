import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContextValues';
import { useOutlet } from '../../context/OutletContextValues';
import api from '../../lib/axios';
import { UtensilsCrossed, CheckCircle, Clock, MapPin, RefreshCw, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import TakeOrderModal from '../../components/waiter/TakeOrderModal';
import TableReservationUI from '../../components/waiter/TableReservationUI';

const WaiterOrderCard = ({ order, onMarkServed, onAccept, isPending }) => {
  const timeElapsed = Math.floor((new Date() - new Date(order.updatedAt)) / 60000); // Time since order updated

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500' };
      case 'cooking':
        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500' };
      case 'ready':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' };
      case 'out_for_delivery':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' };
    }
  };

  const colors = getStatusColor(order.status);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-l-4 ${colors.border} rounded-lg shadow-sm p-4 hover:shadow-md transition-all`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2 flex-wrap">
            Order #{order._id.slice(-4)}
            {order.tableId && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-semibold">
                Table {order.tableId?.label || 'N/A'}
              </span>
            )}
            {!order.tableId && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded font-semibold">
                Takeaway
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Clock size={12} /> {timeElapsed}m ago
          </p>
          {order.notes && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold">Notes: {order.notes}</p>
          )}
        </div>
        <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
          {order.status}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-gray-700 dark:text-gray-300 flex gap-2">
            <span className="font-bold">{item.quantity}x</span>
            <span>{item.menuItem?.name || item.name}</span>
            {item.modifiers?.length > 0 && <span className="text-xs text-gray-500">({item.modifiers.join(', ')})</span>}
          </div>
        ))}
      </div>

      {isPending && order.status === 'placed' && (
        <button
          onClick={() => onAccept(order._id)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <UtensilsCrossed size={20} />
          Accept & Start Cooking
        </button>
      )}

      {order.status === 'ready' && (
        <button
          onClick={() => onMarkServed(order._id)}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle size={20} />
          Mark Served / Delivered
        </button>
      )}
    </div>
  );
};

const ActiveTableCard = ({ table, onTakeOrder }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-between items-center">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">
        {table.label}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{table.capacity} Seats</p>
        <p className="text-xs text-gray-500">Floor {table.floor}</p>
      </div>
    </div>
    <div className="flex gap-2 items-center">
      <div className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Occupied</div>
      <button
        onClick={() => onTakeOrder(table._id)}
        className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
      >
        <Plus size={14} className="inline" /> Order
      </button>
    </div>
  </div>
);

const WaiterDashboard = () => {
  const { user } = useAuth();
  const { selectedOutlet } = useOutlet();
  const [activeTab, setActiveTab] = useState('tables'); // 'tables', 'pending', 'orders', 'occupied'
  const [pendingOrders, setPendingOrders] = useState([]); // Orders with status='placed' awaiting acceptance
  const [allActiveOrders, setAllActiveOrders] = useState([]); // ALL active orders
  const [readyOrders, setReadyOrders] = useState([]); // Just ready orders
  const [occupiedTables, setOccupiedTables] = useState([]);
  const [allTables, setAllTables] = useState([]);
  const [_tableOrders, setTableOrders] = useState({}); // tableId -> orders array
  const [loading, setLoading] = useState(true);
  const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState(null);

  // For admin: use selected outlet from context, for staff: use their assigned outlet
  const outletId = user?.role === 'SUPER_ADMIN' ? selectedOutlet?._id : user?.defaultOutletId || user?.outletId;

  const fetchData = useCallback(async () => {
    if (!outletId) {
      console.warn('No outletId available for waiter');
      setLoading(false);
      return;
    }
    try {
      console.log('Fetching data for outlet:', outletId);

      // 1. Fetch Active Orders (not just ready - include placed, cooking, ready)
      const ordersRes = await api.get(`/api/manager/orders/${outletId}?status=active`);
      if (ordersRes.data.success) {
        // Get all active orders
        const allActiveOrders = ordersRes.data.data;
        setAllActiveOrders(allActiveOrders); // Store ALL active orders
        // Filter pending orders: ALL orders with status='placed' (both dine-in and takeaway from customers)
        setPendingOrders(allActiveOrders.filter((o) => o.status === 'placed'));
        setReadyOrders(allActiveOrders.filter((o) => o.status === 'ready')); // Filter just ready
      }

      // 2. Fetch All Tables
      const tablesRes = await api.get(`/api/manager/tables/${outletId}`);
      console.log('Tables response:', tablesRes.data);

      if (tablesRes.data.success) {
        const fetchedTables = tablesRes.data.data;
        console.log('Fetched tables:', fetchedTables.length);
        setAllTables(fetchedTables);
        setOccupiedTables(fetchedTables.filter((t) => t.isOccupied));

        // 3. Fetch orders for each occupied table
        const occupiedTableIds = fetchedTables.filter((t) => t.isOccupied).map((t) => t._id);

        for (const tableId of occupiedTableIds) {
          try {
            const tableOrdersRes = await api.get(`/api/manager/table/${tableId}/orders`);
            if (tableOrdersRes.data.success) {
              setTableOrders((prev) => ({
                ...prev,
                [tableId]: tableOrdersRes.data.data,
              }));
            }
          } catch (err) {
            console.error(`Failed to fetch orders for table ${tableId}:`, err);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch waiter data:', error);
      toast.error('Failed to load data. Check console for details.');
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

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await api.put(`/api/manager/orders/${orderId}/status`, { status: 'cooking' });
      if (res.data.success) {
        toast.success('Order accepted & sent to kitchen!');
        fetchData();
      }
    } catch {
      toast.error('Failed to accept order');
    }
  };

  const handleTakeOrder = (tableId) => {
    setSelectedTableForOrder(tableId);
    setShowTakeOrderModal(true);
  };

  const handleOrderCreated = () => {
    toast.success('Order created successfully!');
    fetchData();
  };

  const handleTableReserved = (table) => {
    toast.success(`Table ${table.label} reserved!`);
    fetchData();
  };

  const handleTableReleased = (table) => {
    toast.success(`Table ${table.label} released!`);
    fetchData();
  };

  const handleReleaseAfterBilling = async (tableId) => {
    try {
      const res = await api.post(`/api/waiter/tables/${tableId}/release`);
      if (res.data.success) {
        toast.success('Table marked available');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to release table', error);
      toast.error('Failed to mark available');
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
              {selectedOutlet && <span className="ml-2 text-blue-600 dark:text-blue-400">@ {selectedOutlet.name}</span>}
              {!selectedOutlet && user?.role === 'SUPER_ADMIN' && (
                <span className="ml-2 text-red-600"> - Please select outlet</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTableForOrder(null);
              setShowTakeOrderModal(true);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Take Order
          </button>
          <button
            onClick={fetchData}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex gap-2 p-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold transition-colors ${
            activeTab === 'tables'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          My Tables ({allTables.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Pending Orders{' '}
          {pendingOrders.length > 0 && (
            <span className="ml-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold transition-colors ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Active Orders ({readyOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('occupied')}
          className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'occupied'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Occupied Tables ({allTables.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tables' && (
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">Available Tables</h2>
          <TableReservationUI
            tables={allTables}
            onTableReserved={handleTableReserved}
            onTableReleased={handleTableReleased}
          />
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-yellow-700 dark:text-yellow-400">
            <AlertCircle size={20} /> Pending Customer Orders ({pendingOrders.length})
          </h2>

          {pendingOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-200 dark:border-gray-700 border-dashed">
              <p>No pending orders waiting for acceptance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map((order) => (
                <WaiterOrderCard
                  key={order._id}
                  order={order}
                  onMarkServed={handleMarkServed}
                  onAccept={handleAcceptOrder}
                  isPending={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* All Active Orders List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
              <CheckCircle size={20} /> All Active Orders ({allActiveOrders.length})
            </h2>

            {allActiveOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-200 dark:border-gray-700 border-dashed">
                <p>No active orders at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allActiveOrders.map((order) => (
                  <WaiterOrderCard key={order._id} order={order} onMarkServed={handleMarkServed} />
                ))}
              </div>
            )}

            {/* Ready to Serve Summary */}
            {readyOrders.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  ✓ {readyOrders.length} order(s) ready for pickup!
                </p>
              </div>
            )}
          </div>

          {/* Occupied Tables */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
              <MapPin size={20} /> Occupied Tables
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 min-h-[300px]">
              {occupiedTables.map((table) => (
                <ActiveTableCard key={table._id} table={table} onTakeOrder={handleTakeOrder} />
              ))}
              {occupiedTables.length === 0 && (
                <div className="text-center text-gray-400 py-10 text-sm">No tables occupied.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'occupied' && (
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-700 dark:text-red-400">
            <MapPin size={20} /> Occupied Tables ({occupiedTables.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {occupiedTables.map((table) => (
              <div
                key={table._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {table.label}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Floor {table.floor}</p>
                      <p className="text-xs text-gray-500">{table.capacity} seats</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      table.isOccupied
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                    }`}
                  >
                    {table.isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>

                {table.currentOrderId && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
                    Active Order • {table.currentOrderId.items?.length || 0} items • Status{' '}
                    {table.currentOrderId.status}
                  </div>
                )}

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => handleTakeOrder(table._id)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Order
                  </button>
                  <button
                    onClick={() => handleReleaseAfterBilling(table._id)}
                    disabled={!table.isOccupied}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border ${
                      table.isOccupied
                        ? 'border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Mark Available
                  </button>
                </div>
              </div>
            ))}
            {occupiedTables.length === 0 && (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-200 dark:border-gray-700 border-dashed">
                <p>No tables currently occupied.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Take Order Modal */}
      {showTakeOrderModal && (
        <TakeOrderModal
          tableId={selectedTableForOrder}
          outletId={outletId}
          availableTables={allTables}
          onClose={() => {
            setShowTakeOrderModal(false);
            setSelectedTableForOrder(null);
          }}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default WaiterDashboard;
