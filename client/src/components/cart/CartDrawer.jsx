import React from 'react';
import { useCart } from '../../context/CartContextValues';
import { useOutlet } from '../../context/OutletContextValues';
import { Button } from '../ui/button';
import { X, Minus, Plus, ShoppingBag, MapPin } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const CartDrawer = () => {
  const { cartItems, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, clearCart, tableInfo } = useCart();
  const { selectedOutlet } = useOutlet();

  const handleCheckout = async () => {
    const outletId = selectedOutlet?._id || selectedOutlet || tableInfo?.outletId;
    if (!outletId) {
      toast.error('Please select an outlet first.');
      return;
    }

    try {
      // Transform cart items to match API expectation
      const orderItems = cartItems.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        modifiers: item.modifiers,
      }));

      // Get existing session token if customer already placed an order
      const existingToken = tableInfo?.tableId ? localStorage.getItem(`customerToken_${tableInfo.tableId}`) : null;

      const payload = {
        outletId,
        items: orderItems,
        totalAmount: cartTotal,
        ...(tableInfo && { tableId: tableInfo.tableId }),
        ...(existingToken && { customerToken: existingToken }),
      };

      // API call to create order
      const res = await api.post('/api/public/orders', payload);

      if (res.data.success) {
        // Always store server-provided token
        if (res.data.customerToken && tableInfo?.tableId) {
          localStorage.setItem(`customerToken_${tableInfo.tableId}`, res.data.customerToken);
        }
        toast.success('Order Placed Successfully!');
        clearCart();
        setIsCartOpen(false);
        // Trigger order refresh if there's a callback
        if (window.refreshOrders) window.refreshOrders();
      }
    } catch (error) {
      console.error('Checkout failed', error);
      toast.error(error.response?.data?.message || 'Failed to place order.');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsCartOpen(false);
        }}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Order
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-secondary hover:text-text">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-secondary">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCartOpen(false)}>
                Browse Menu
              </Button>
            </div>
          ) : (
            cartItems.map((item) => {
              const imageUrl = typeof item.image === 'string' ? item.image.trim() : '';
              const hasImage = Boolean(imageUrl);

              return (
                <div key={item._id} className="flex gap-4 p-3 bg-background rounded-xl border border-white/5">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-secondary/10 flex items-center justify-center">
                    {hasImage ? (
                      <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-secondary">No image</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text line-clamp-1">{item.name}</h3>
                        {Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                          <div className="mt-1 text-xs text-secondary space-y-1">
                            {item.modifiers.map((mod, idx) => (
                              <div key={`${mod.name}-${mod.option}-${idx}`} className="flex items-center gap-2">
                                <span className="text-text font-semibold">{mod.name}:</span>
                                <span>{mod.option || 'No selection'}</span>
                                {mod.priceAdjustment ? (
                                  <span className="text-[11px] text-zinc-400">
                                    {mod.priceAdjustment > 0 ? `+${mod.priceAdjustment}` : mod.priceAdjustment}
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-primary whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3 bg-surface rounded-lg p-1 border border-white/10">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1, item.modifiers)}
                          className="p-1 hover:text-primary transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1, item.modifiers)}
                          className="p-1 hover:text-primary transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-surface">
            {/* Table Info Display */}
            {tableInfo && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs text-secondary">Dine-In</p>
                  <p className="text-sm font-semibold text-text">
                    Table {tableInfo.tableName} • Floor {tableInfo.floor}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-400">
                Clear Cart
              </button>
            </div>
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-text">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <Button variant="primary" className="w-full py-4 text-lg font-bold" onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
