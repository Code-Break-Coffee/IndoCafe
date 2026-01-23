import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClassicLoader from '@/components/ui/loader';
import { useOutlet } from '../../context/OutletContextValues';
import { useCart } from '../../context/CartContextValues';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
  ShoppingBag,
  UtensilsCrossed,
  Clock,
  ChevronRight,
  ChevronDown,
  Search,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import CartDrawer from '../../components/cart/CartDrawer';
import FeaturedItems from '../../features/home/FeaturedItems';
import TrendingItems from '../../features/home/TrendingItems';
// Reusing FeaturedItems for now, but ideally this should be a "MenuSection" component that takes categories.

const OrderSession = () => {
  const { outletId, tableId } = useParams();
  const navigate = useNavigate();
  const { setOutlet, selectedOutlet } = useOutlet();
  const { setTableInfo, tableInfo, setIsCartOpen, cartItems } = useCart();
  const initializationRef = useRef(false);

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders' | 'bill'
  const [isLoading, setIsLoading] = useState(true);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState([]);

  // --- 1. Session Initialization ---
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        // Fetch Table Details
        const res = await api.get(`/api/public/table/${tableId}`);

        const table = res.data?.data || res.data;

        if (!table) throw new Error('Table not found');

        // Validate Outlet
        const tableOutletId = typeof table.outletId === 'string' ? table.outletId : table.outletId?._id;

        // Compare as strings to handle ObjectId comparison
        if (String(tableOutletId) !== String(outletId)) {
          throw new Error('Table code mismatch - This table belongs to a different outlet');
        }

        // Set Contexts
        setOutlet({ _id: String(outletId) });
        setTableInfo({
          tableId: table._id,
          tableName: table.label,
          floor: table.floor,
          outletId: String(tableOutletId),
        });

        toast.success(`Welcome to Table ${table.label}!`);
      } catch (err) {
        console.error('Session init error:', err);
        toast.error('Invalid session. Redirecting...');
        navigate('/home');
      } finally {
        setIsLoading(false);
      }
    };

    if (outletId && tableId && !initializationRef.current) {
      initializationRef.current = true;
      initSession();
    }
  }, [outletId, tableId, navigate, setOutlet, setTableInfo]);

  // Fetch orders for this table
  const fetchOrders = useCallback(async () => {
    if (!tableId) return;
    try {
      setIsOrdersLoading(true);
      // Get stored customer token (set after first order)
      const customerToken = localStorage.getItem(`customerToken_${tableId}`);
      const url = customerToken
        ? `/api/public/orders/table/${tableId}?customerToken=${customerToken}`
        : `/api/public/orders/table/${tableId}`;
      const res = await api.get(url);
      if (res.data?.success) {
        const fetched = res.data.data || [];
        setOrders(fetched);
        setExpandedOrders(fetched.map((o) => o._id)); // auto-expand to show items
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error('Could not load orders');
    } finally {
      setIsOrdersLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchOrders();
    // Set up refresh callback for cart drawer
    window.refreshOrders = fetchOrders;
    return () => {
      delete window.refreshOrders;
    };
  }, [tableId, fetchOrders]);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]));
  };

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
        <ClassicLoader className="w-12 h-12 border-4 border-amber-500 border-t-transparent mb-4" />
        <p className="font-medium tracking-wide">Setting up your table...</p>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-background relative font-sans pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
      <div className="max-w-5xl mx-auto w-full px-3 sm:px-4">
        {/* 1. Header (Sticky) */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 px-2 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold text-primary">{selectedOutlet?.name || 'Indo Cafe'}</h1>
            <span className="text-[11px] sm:text-xs text-zinc-400 flex items-center gap-1">
              <UtensilsCrossed size={12} />
              Table {tableInfo?.tableName}
            </span>
          </div>
          <button className="p-2 rounded-full bg-zinc-800 text-white">
            <Search size={20} />
          </button>
        </header>

        {/* 2. Content Tabs */}
        <div className="py-4 space-y-6 sm:space-y-8">
          {/* Simple Tab Switcher */}
          <div className="flex items-center bg-zinc-900 rounded-xl p-1 mb-4 sm:mb-6">
            <TabButton
              active={activeTab === 'menu'}
              onClick={() => setActiveTab('menu')}
              label="Menu"
              icon={<MenuIcon size={16} />}
            />
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              label="My Orders"
              icon={<Clock size={16} />}
            />
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Hungry? 😋</h2>
                  <p className="text-sm text-zinc-400">Select items to add to your table order.</p>
                </div>

                {/* Trending Items Section - only show when not viewing full menu */}
                {!showFullMenu && <TrendingItems outletId={outletId} />}

                {/* All Menu Items */}
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {showFullMenu ? 'Full Menu' : 'Our Menu'}
                    </h2>
                    <Button
                      onClick={() => setShowFullMenu(!showFullMenu)}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm px-3 py-2"
                    >
                      {showFullMenu ? 'Show Less' : 'View Full Menu'}
                    </Button>
                  </div>
                  <FeaturedItems outletId={outletId} showAll={showFullMenu} />
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">My Orders</h2>
                    <p className="text-sm text-zinc-400">Most recent first</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={fetchOrders} disabled={isOrdersLoading}>
                    {isOrdersLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                {isOrdersLoading ? (
                  <div className="flex items-center justify-center py-16 text-zinc-400">
                    <ClassicLoader className="w-8 h-8 border-4 border-amber-500 border-t-transparent mr-3" />
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                    <Clock size={48} className="mb-4 opacity-50" />
                    <p>No orders yet for this table.</p>
                    <Button
                      onClick={() => setActiveTab('menu')}
                      variant="link"
                      className="mt-4 text-amber-500 font-medium text-sm"
                    >
                      Go to Menu
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const isOpen = expandedOrders.includes(order._id);
                      return (
                        <div key={order._id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
                          <button
                            className="w-full text-left flex items-center justify-between gap-3"
                            onClick={() => toggleOrder(order._id)}
                          >
                            <div>
                              <p className="text-xs text-zinc-400">Order #{order._id?.slice(-6)}</p>
                              <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleString()}</p>
                              <p className="text-xs text-zinc-400 mt-1">{(order.items || []).length} item(s)</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">
                                {order.status}
                              </span>
                              <ChevronDown
                                size={18}
                                className={`transition-transform ${isOpen ? 'rotate-180' : ''} text-zinc-300`}
                              />
                            </div>
                          </button>

                          {!isOpen && (order.items || []).length > 0 && (
                            <div className="mt-2 text-xs text-zinc-400 line-clamp-2">
                              {(order.items || [])
                                .slice(0, 2)
                                .map((item) => item.name || 'Item')
                                .join(', ')}
                              {(order.items || []).length > 2 ? '…' : ''}
                            </div>
                          )}

                          {isOpen && (
                            <div className="space-y-2">
                              {(order.items || []).map((item, idx) => (
                                <div
                                  key={`${order._id}-item-${idx}`}
                                  className="flex justify-between items-start gap-3 bg-zinc-950/70 rounded-xl p-3 border border-white/5"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-text line-clamp-2">
                                      {item.name || item.menuItem?.name || 'Item'}
                                    </p>
                                    {Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                                      <div className="mt-1 text-xs text-secondary space-y-1">
                                        {item.modifiers.map((mod, mIdx) => (
                                          <div key={`${idx}-mod-${mIdx}`} className="flex gap-2 items-center">
                                            <span>{mod}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right whitespace-nowrap">
                                    <p className="text-sm font-semibold text-text">x{item.quantity}</p>
                                    {item.price !== undefined && (
                                      <p className="text-xs text-secondary">
                                        ${item.price?.toFixed?.(2) ?? item.price}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <p className="text-sm text-secondary">Total</p>
                            <p className="text-base font-bold text-text">
                              ${order.totalAmount?.toFixed?.(2) ?? order.totalAmount}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Floating Cart Button (FAB) */}
        {cartItems.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed inset-x-3 sm:inset-x-4 bottom-4 z-50">
            <Button
              onClick={() => setIsCartOpen(true)}
              size="lg"
              className="w-full py-6 sm:py-7 px-4 sm:px-6 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-between font-bold text-base sm:text-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">{cartItems.length}</div>
                <span>View Cart</span>
              </div>
              <span className="flex items-center gap-2">
                ₹{cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
                <ChevronRight size={20} />
              </span>
            </Button>
          </motion.div>
        )}

        {/* Drawers/Modals */}
        <CartDrawer />
      </div>
    </div>
  );
};

// Helper Component
const TabButton = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
      active
        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default OrderSession;
