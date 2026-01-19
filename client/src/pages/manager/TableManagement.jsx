import React, { useState, useEffect } from 'react';
import FloorPlanEditor from '../../components/floorplan/FloorPlanEditor';
import TableReservationUI from '../../components/waiter/TableReservationUI';
import { useAuth } from '../../context/AuthContextValues';
import { useOutlet } from '../../context/OutletContextValues';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { LayoutDashboard, List, Plus, Trash2, Edit2, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const TableManagement = () => {
  const { user } = useAuth();
  const { selectedOutlet } = useOutlet();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'floor-plan'
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'reservations'
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [editTable, setEditTable] = useState(null);

  const [formData, setFormData] = useState({
    label: '',
    capacity: 4,
    floor: 1,
    shape: 'rect-table',
  });

  // For admin: use selected outlet from context, for manager: use their assigned outlet
  const outletId = user?.role === 'SUPER_ADMIN' ? selectedOutlet?._id : user?.defaultOutletId || user?.outletId;

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (outletId) {
      fetchTables();
    }
  }, [outletId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/manager/tables/${outletId}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTable) {
        // Update existing table
        const res = await api.put(`/api/manager/tables/${editTable._id}`, formData);
        if (res.data.success) {
          toast.success('Table updated successfully');
          setTables(tables.map((t) => (t._id === editTable._id ? res.data.data : t)));
        }
      } else {
        // Create new table
        const res = await api.post('/api/manager/tables', {
          ...formData,
          outletId,
        });
        if (res.data.success) {
          toast.success('Table created successfully');
          setTables([...tables, res.data.data]);
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error(error.response?.data?.message || 'Failed to save table');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await api.delete(`/api/manager/tables/${id}`);
      setTables(tables.filter((t) => t._id !== id));
      toast.success('Table deleted');
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
    }
  };

  const handleReleaseAfterBilling = async (id) => {
    try {
      const res = await api.post(`/api/waiter/tables/${id}/release`);
      if (res.data.success) {
        toast.success('Table marked available');
        fetchTables();
      }
    } catch (error) {
      console.error('Error releasing table:', error);
      toast.error('Failed to mark available');
    }
  };

  const openModal = (table = null) => {
    if (table) {
      setEditTable(table);
      setFormData({
        label: table.label,
        capacity: table.capacity,
        floor: table.floor,
        shape: table.shape,
      });
    } else {
      setEditTable(null);
      setFormData({
        label: '',
        capacity: 4,
        floor: selectedFloor,
        shape: 'rect-table',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTable(null);
  };

  // Filter tables by floor for display
  const filteredTables = tables.filter((t) => t.floor === selectedFloor);
  const distinctFloors = [...new Set(tables.map((t) => t.floor))].sort((a, b) => a - b);
  if (!distinctFloors.includes(1)) distinctFloors.unshift(1); // Ensure floor 1 is always option

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm z-10 transition-colors duration-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Table Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage seating layout and capacity</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              title="List View"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('floor-plan')}
              className={`p-2 rounded-md transition-all ${viewMode === 'floor-plan' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              title="Floor Plan View"
            >
              <LayoutDashboard size={20} />
            </button>
          </div>

          {/* Floor Selector */}
          <div className="relative">
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(Number(e.target.value))}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-gray-700 dark:text-gray-200"
            >
              {[...new Set([...distinctFloors, selectedFloor])].sort().map((f) => (
                <option key={f} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter size={14} />
            </div>
          </div>

          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <Plus size={18} /> Add Table
          </Button>
        </div>
      </div>

      {/* Occupied tables quick actions */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Occupied Tables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tables.length === 0 && (
            <div className="col-span-full text-gray-500 dark:text-gray-400 text-sm">No tables yet.</div>
          )}
          {tables.map((table) => (
            <div
              key={table._id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {table.label}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Floor {table.floor}</p>
                  <p className="text-xs text-gray-500">{table.capacity} seats</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    table.isOccupied
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                  }`}
                >
                  {table.isOccupied ? 'Occupied' : 'Available'}
                </span>
                <button
                  onClick={() => handleReleaseAfterBilling(table._id)}
                  disabled={!table.isOccupied}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
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
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-0 flex gap-8 shadow-sm sticky top-0 z-5">
        <button
          onClick={() => setActiveTab('tables')}
          className={`py-4 px-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'tables'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Tables ({tables.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`py-4 px-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'reservations'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Reservations
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'tables' && (
          <>
            {viewMode === 'list' && (
              <div className="p-6 overflow-y-auto h-full">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <p>Loading tables...</p>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p>No tables found. Add a table to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTables.map((table) => (
                      <div
                        key={table._id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {table.label}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openModal(table)}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(table._id)}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium text-gray-800 dark:text-white">Capacity:</span>{' '}
                            {table.capacity} Persons
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium text-gray-800 dark:text-white">Shape:</span>{' '}
                            {table.shape.replace('-table', '')}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium text-gray-800 dark:text-white">Status:</span>
                            <span
                              className={`ml-2 inline-block w-2 h-2 rounded-full ${table.isOccupied ? 'bg-red-500' : 'bg-green-500'}`}
                            ></span>
                            {table.isOccupied ? ' Occupied' : ' Available'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {filteredTables.length === 0 && (
                      <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400">
                        No tables on this floor.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {viewMode === 'floor-plan' && (
              <FloorPlanEditor
                tables={filteredTables}
                allTables={tables}
                floor={selectedFloor}
                onUpdate={() => {
                  // Update local state to reflect dragged changes immediately (optional, for smooth UX)
                  // The actual save will happen inside FloorPlanEditor via API, then it might reload tables
                  fetchTables();
                }}
              />
            )}
          </>
        )}

        {activeTab === 'reservations' && (
          <div className="p-6 overflow-y-auto h-full">
            <TableReservationUI tables={tables} onTableReserved={fetchTables} onTableReleased={fetchTables} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                {editTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Table Label / Number
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. T-01 or Table 5"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shape</label>
                <div className="grid grid-cols-3 gap-2">
                  {['rect-table', 'round-table', 'square-table'].map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setFormData({ ...formData, shape })}
                      className={`py-2 px-1 text-xs border rounded-lg transition-all ${
                        formData.shape === shape
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50'
                      }`}
                    >
                      {shape === 'rect-table' && 'Rectangle'}
                      {shape === 'round-table' && 'Round'}
                      {shape === 'square-table' && 'Square'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editTable ? 'Save Changes' : 'Create Table'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TableManagement;
