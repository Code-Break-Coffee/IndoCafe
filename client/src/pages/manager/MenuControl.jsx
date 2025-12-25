import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Check, X, Loader, Image as ImageIcon, ChevronDown } from 'lucide-react';

const MenuControl = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // State for selected outlet
  const [selectedOutletId, setSelectedOutletId] = useState(user?.defaultOutletId || user?.outletId);

  // Update selected outlet if user data changes (e.g. on refresh)
  useEffect(() => {
    if (user && !selectedOutletId) {
        setSelectedOutletId(user.defaultOutletId || user.outletId);
    }
  }, [user]);

  useEffect(() => {
    if (selectedOutletId) {
      fetchMenu(selectedOutletId);
    } else if (user && !selectedOutletId) {
      // If user has assigned outlets but no default, pick the first one
      if (user.assignedOutlets && user.assignedOutlets.length > 0) {
          setSelectedOutletId(user.assignedOutlets[0]._id);
      } else {
          setError("No outlet assigned to this manager.");
          setLoading(false);
      }
    }
  }, [selectedOutletId, user]);

  const fetchMenu = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await menuService.getOutletMenu(id);
      setItems(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load menu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      setUpdatingId(item._id);
      const newStatus = !item.isAvailable;
      
      // Optimistic update
      setItems(prev => prev.map(i => 
        i._id === item._id ? { ...i, isAvailable: newStatus } : i
      ));

      await menuService.updateItemStatus(item._id, {
        isAvailable: newStatus,
        price: item.price, // Keep existing price
        outletId: selectedOutletId // Pass selected outlet ID
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert on error
      setItems(prev => prev.map(i => 
        i._id === item._id ? { ...i, isAvailable: !item.isAvailable } : i
      ));
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const startEditingPrice = (item) => {
    setEditingPriceId(item._id);
    setTempPrice(item.price);
  };

  const cancelEditingPrice = () => {
    setEditingPriceId(null);
    setTempPrice('');
  };

  const savePrice = async (item) => {
    try {
      setUpdatingId(item._id);
      const newPrice = parseFloat(tempPrice);
      
      if (isNaN(newPrice) || newPrice < 0) {
        alert('Please enter a valid price.');
        return;
      }

      // Optimistic update
      setItems(prev => prev.map(i => 
        i._id === item._id ? { ...i, price: newPrice } : i
      ));

      await menuService.updateItemStatus(item._id, {
        isAvailable: item.isAvailable,
        price: newPrice,
        outletId: selectedOutletId // Pass selected outlet ID
      });
      
      setEditingPriceId(null);
    } catch (err) {
      console.error('Failed to update price:', err);
      // Revert is harder here without fetching, but we can just alert
      alert('Failed to update price.');
      fetchMenu(selectedOutletId); // Refresh to be safe
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !items.length) {
    return (
      <div className="flex items-center justify-center h-screen text-primary">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => fetchMenu(selectedOutletId)}
          className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-background min-h-screen text-text">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Outlet Menu Control</h1>
          <p className="text-secondary">Manage availability and pricing for your outlet.</p>
        </div>
        
        {/* Outlet Switcher */}
        {user?.assignedOutlets?.length > 0 && (
          <div className="relative min-w-[200px]">
            <label className="block text-xs font-medium text-secondary mb-1">Select Outlet</label>
            <div className="relative">
              <select
                value={selectedOutletId || ''}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                className="w-full appearance-none bg-surface border border-secondary/20 text-text py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm"
              >
                {user.assignedOutlets.map(outlet => (
                  <option key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary pointer-events-none" size={16} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div 
            key={item._id} 
            className={`bg-surface rounded-xl shadow-sm border border-secondary/10 overflow-hidden transition-all duration-300 ${
              !item.isAvailable ? 'opacity-60 grayscale-[0.5]' : ''
            }`}
          >
            {/* Image Section */}
            <div className="relative h-48 bg-secondary/10">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary">
                  <ImageIcon size={32} />
                </div>
              )}
              
              {/* Stock Toggle Overlay */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  disabled={updatingId === item._id}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    item.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span className="sr-only">Toggle Stock</span>
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      item.isAvailable ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg truncate pr-2" title={item.name}>{item.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>
              
              <p className="text-sm text-secondary mb-4 line-clamp-2 h-10">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-secondary/10">
                <div className="flex items-center gap-2 w-full">
                  {editingPriceId === item._id ? (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-secondary font-medium">₹</span>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-secondary/30 focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button 
                        onClick={() => savePrice(item)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={cancelEditingPrice}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="text-xs text-secondary">Price</span>
                        <span className="text-xl font-bold text-primary">₹{item.price}</span>
                      </div>
                      <button 
                        onClick={() => startEditingPrice(item)}
                        className="ml-auto p-2 text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                        title="Edit Price"
                      >
                        <Edit2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuControl;
