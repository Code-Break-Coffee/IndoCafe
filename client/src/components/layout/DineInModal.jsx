import React, { useState, useEffect } from 'react';
import ClassicLoader from '@/components/ui/loader';
import { useOutlet } from '../../context/OutletContextValues';
import { useCart } from '../../context/CartContextValues';
import api from '../../lib/axios';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DineInModal = ({ onClose }) => {
  const { selectedOutlet } = useOutlet();
  const { setTableInfo } = useCart();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      if (!selectedOutlet) return;
      try {
        const res = await api.get(`/api/public/outlet/${selectedOutlet._id}/tables`);
        if (res.data.success) {
          setTables(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch tables:', error);
        toast.error('Failed to load tables');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [selectedOutlet]);

  const handleSelectTable = (table) => {
    setTableInfo({
      tableId: table._id,
      tableName: table.label,
      floor: table.floor,
    });
    toast.success(`Table ${table.label} selected!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full mx-4 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Select Your Table</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose where you're sitting to place your order</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <ClassicLoader className="h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : tables.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">No tables available</p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                Please contact staff or try again later
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Group tables by floor */}
            {[...new Set(tables.map((t) => t.floor))].sort().map((floor) => (
              <div key={floor} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Floor {floor}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tables
                    .filter((t) => t.floor === floor)
                    .map((table) => {
                      // Allow selecting tables even when occupied; re-orders now handled via table links
                      const canSelectTable = true;
                      const isOccupied = table.isOccupied;
                      return (
                        <button
                          key={table._id}
                          onClick={() => canSelectTable && handleSelectTable(table)}
                          disabled={!canSelectTable}
                          className={`p-4 rounded-lg font-semibold transition-all ${
                            isOccupied
                              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-400'
                              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-400'
                          }`}
                        >
                          <div className="text-lg">Table {table.label}</div>
                          <div className="text-xs opacity-75 mt-1">{table.capacity} seats</div>
                          {isOccupied && <div className="text-xs mt-1 font-semibold">Has Active Order</div>}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Continue without table option */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold transition-colors"
              >
                Continue without selecting a table
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DineInModal;
