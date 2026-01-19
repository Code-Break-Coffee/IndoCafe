import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutlet } from '../../context/OutletContextValues';
import { useCart } from '../../context/CartContextValues';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ShoppingBag, UtensilsCrossed, Clock, ChevronRight, Search, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import CartDrawer from '../../components/cart/CartDrawer';
import FeaturedItems from '../../features/home/FeaturedItems';
// Reusing FeaturedItems for now, but ideally this should be a "MenuSection" component that takes categories.
// Since FeaturedItems fetches its own data, we might need a dedicated MenuList component.
// For this MVP step, let's create a wrapper that looks mobile-native.

const OrderSession = () => {
  const { outletId, tableId } = useParams();
  const navigate = useNavigate();
  const { setOutlet, selectedOutlet } = useOutlet();
  const { setTableInfo, tableInfo, setIsCartOpen, cartItems } = useCart();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders' | 'bill'
  const [isLoading, setIsLoading] = useState(true);

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
        if (tableOutletId !== outletId) {
          toast.error('Table code mismatch');
          // Redirect or handle error
        }

        // Set Contexts
        setOutlet(outletId);
        setTableInfo({
          tableId: table._id,
          tableName: table.label,
          floor: table.floor,
        });

        toast.success(`Welcome to Table ${table.label}!`);
      } catch (err) {
        console.error(err);
        toast.error('Invalid session. Redirecting...');
        navigate('/home');
      } finally {
        setIsLoading(false);
      }
    };

    if (outletId && tableId) {
      initSession();
    }
  }, [outletId, tableId, navigate, setOutlet, setTableInfo]);

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium tracking-wide">Setting up your table...</p>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-background pb-20 relative font-sans">
      {/* 1. Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-primary">{selectedOutlet?.name || 'Indo Cafe'}</h1>
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <UtensilsCrossed size={12} />
            Table {tableInfo?.tableName}
          </span>
        </div>
        <button className="p-2 rounded-full bg-zinc-800 text-white">
          <Search size={20} />
        </button>
      </header>

      {/* 2. Content Tabs */}
      <div className="p-4">
        {/* Simple Tab Switcher */}
        <div className="flex items-center bg-zinc-900 rounded-xl p-1 mb-6">
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
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Hungry? 😋</h2>
                <p className="text-sm text-zinc-400">Select items to add to your table order.</p>
              </div>

              {/* Reusing FeaturedItems for content population for now. 
                         Ideally refactor this to be a pure MenuList later. */}
              <FeaturedItems />
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 text-zinc-500"
            >
              <Clock size={48} className="mb-4 opacity-50" />
              <p>No active orders yet.</p>
              <Button
                onClick={() => setActiveTab('menu')}
                variant="link"
                className="mt-4 text-amber-500 font-medium text-sm"
              >
                Go to Menu
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Floating Cart Button (FAB) */}
      {cartItems.length > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-4 right-4 z-50">
          <Button
            onClick={() => setIsCartOpen(true)}
            size="lg"
            className="w-full py-8 px-6 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-between font-bold text-lg"
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
