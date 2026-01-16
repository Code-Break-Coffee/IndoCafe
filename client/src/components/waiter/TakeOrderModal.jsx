import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextValues';
import api from '../../lib/axios';

export default function TakeOrderModal({
  tableId: initialTableId,
  outletId,
  onClose,
  onOrderCreated,
  availableTables = [],
}) {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderType, setOrderType] = useState(initialTableId ? 'table' : 'takeaway'); // 'table' or 'takeaway'
  const [selectedTable, setSelectedTable] = useState(initialTableId || null);

  // Fetch menu items for the outlet
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get(`/api/public/menu/${outletId}`);
        setMenuItems(response.data.data || []);
      } catch (err) {
        setError('Failed to load menu');
        console.error(err);
      }
    };

    fetchMenu();
  }, [outletId]);

  // Add item to selected items with default quantity 1
  const handleAddItem = (item) => {
    const existingItem = selectedItems.find((selected) => selected.menuItem._id === item._id);

    if (existingItem) {
      // Increase quantity
      setSelectedItems(
        selectedItems.map((selected) =>
          selected.menuItem._id === item._id ? { ...selected, quantity: selected.quantity + 1 } : selected
        )
      );
    } else {
      // Add new item
      setSelectedItems([
        ...selectedItems,
        {
          menuItem: item,
          quantity: 1,
          modifiers: [],
          name: item.name,
          price: item.price,
        },
      ]);
    }
  };

  // Remove item from selected items
  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItem._id !== itemId));
  };

  // Update quantity
  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setSelectedItems(selectedItems.map((item) => (item.menuItem._id === itemId ? { ...item, quantity } : item)));
  };

  // Update modifiers (special notes like "no onions")
  // Commented out: not currently used
  // const handleAddModifier = (itemId, modifier) => {
  //   setSelectedItems(
  //     selectedItems.map((item) =>
  //       item.menuItem._id === itemId
  //         ? {
  //             ...item,
  //             modifiers: item.modifiers.includes(modifier)
  //               ? item.modifiers.filter((m) => m !== modifier)
  //               : [...item.modifiers, modifier],
  //           }
  //         : item
  //     )
  //   );
  // };

  // Calculate total amount
  const totalAmount = selectedItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  // Submit order
  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        outletId,
        tableId: orderType === 'table' ? selectedTable : null,
        items: selectedItems.map((item) => ({
          menuItem: item.menuItem._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers,
        })),
        totalAmount: totalAmount.toFixed(2),
        notes,
        takenBy: user._id,
      };

      const response = await api.post('/api/public/orders', orderData);

      if (response.data.success) {
        onOrderCreated(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to create order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 sticky top-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Take New Order</h2>
            <button
              onClick={onClose}
              className="text-2xl font-bold hover:bg-blue-700 w-8 h-8 flex items-center justify-center rounded"
            >
              ×
            </button>
          </div>

          {/* Order Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('table')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                orderType === 'table' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              Dine-In (Table)
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                orderType === 'takeaway' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              Takeaway
            </button>
          </div>

          {/* Table Selector - only show if dine-in */}
          {orderType === 'table' && availableTables.length > 0 && (
            <div className="mt-3">
              <label className="block text-sm font-semibold mb-2">Select Table</label>
              <select
                value={selectedTable || ''}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-gray-800 font-semibold"
              >
                <option value="">Choose a table...</option>
                {availableTables.map((table) => (
                  <option key={table._id} value={table._id}>
                    Table {table.label} - {table.capacity} seats (Floor {table.floor})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col lg:flex-row gap-6">
          {/* Menu Items Section */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">Available Items</h3>
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-lg p-3 hover:shadow-md cursor-pointer transition"
                    onClick={() => handleAddItem(item)}
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-20 object-cover rounded mb-2" />
                    )}
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-blue-600 font-bold">₹{item.price}</div>
                  </div>
                ))
              ) : (
                <div>Loading menu...</div>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:w-80 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

            {/* Order Notes */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Special Instructions / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., No onions, Extra spicy, Extra salt"
                className="w-full border rounded px-3 py-2 text-sm h-20 resize-none"
              />
            </div>

            {/* Selected Items */}
            <div className="max-h-48 overflow-y-auto mb-4 border-t pt-3">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <div key={item.menuItem._id} className="mb-3 pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">₹{item.price} each</div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.menuItem._id)}
                        className="text-red-600 hover:bg-red-100 px-2 py-1 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 my-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItem._id, item.quantity - 1)}
                        className="bg-gray-300 px-2 py-1 rounded text-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.menuItem._id, parseInt(e.target.value) || 1)}
                        className="w-12 border rounded px-2 py-1 text-center text-sm"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItem._id, item.quantity + 1)}
                        className="bg-gray-300 px-2 py-1 rounded text-sm"
                      >
                        +
                      </button>
                      <span className="text-sm font-semibold ml-auto">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    {/* Modifiers */}
                    <div className="text-xs mt-2">
                      {item.modifiers.length > 0 && (
                        <div className="text-gray-600">
                          Modifiers:{' '}
                          {item.modifiers.map((m, idx) => (
                            <span key={idx} className="inline-block">
                              {m}
                              {idx < item.modifiers.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">Click items to add to order</div>
              )}
            </div>

            {/* Total and Submit */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={handleSubmitOrder}
                disabled={loading || selectedItems.length === 0}
                className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Order...' : 'Create Order'}
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
