import { useState, useEffect } from 'react';
import ClassicLoader from '@/components/ui/loader';
import { useOutlet } from '../../context/OutletContextValues';
import api from '../../lib/axios';
import { Plus, Store, UserPlus, MapPin, Phone, X, Eye } from 'lucide-react';
import LocationPicker from '../../components/ui/LocationPicker';
import { Button } from '../../components/ui/button';
import LiveOrders from '../manager/LiveOrders';
import MenuControl from '../manager/MenuControl';
import TableManagement from '../manager/TableManagement';
import StaffManagement from '../manager/StaffManagement';

const OutletManagement = () => {
  const { setOutlet } = useOutlet();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, _setActiveTab] = useState('outlets'); // 'outlets' or 'managers'
  const [viewingOutlet, setViewingOutlet] = useState(null);
  const [viewMode, setViewMode] = useState('orders');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [outletForm, setOutletForm] = useState({
    name: '',
    address: '',
    type: 'dine_in',
    phoneNumber: '',
    latitude: '',
    longitude: '',
  });

  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    outletId: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      const res = await api.get('/api/admin/outlets');
      if (res.data.success) {
        setOutlets(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching outlets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOutletSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...outletForm,
        location: {
          type: 'Point',
          coordinates: [parseFloat(outletForm.longitude), parseFloat(outletForm.latitude)],
        },
      };

      const res = await api.post('/api/admin/outlets', payload);

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Outlet created successfully!' });
        setOutletForm({ name: '', address: '', type: 'dine_in', phoneNumber: '', latitude: '', longitude: '' });
        fetchOutlets();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create outlet' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...managerForm,
        role: 'OUTLET_MANAGER',
      };

      const res = await api.post('/api/admin/users', payload);

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Manager created successfully!' });
        setManagerForm({ name: '', email: '', password: '', phoneNumber: '', outletId: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create manager' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOutletClick = (outlet) => {
    setOutlet(outlet);
    setViewingOutlet(outlet);
    setViewMode('orders');
  };

  const closeOutletView = () => {
    setViewingOutlet(null);
    setViewMode('orders');
  };

  const handleOpenAddModal = () => {
    setOutletForm({
      name: '',
      address: '',
      type: 'dine_in',
      phoneNumber: '',
      latitude: '',
      longitude: '',
    });
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <ClassicLoader className="h-8 w-8 text-primary" />
      </div>
    );

  return (
    <div className="p-6 bg-background min-h-screen text-text">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Outlet Management</h1>
          <p className="text-secondary">Manage all outlets and view them.</p>
        </div>
      </div>
      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
        >
          {message.text}
        </div>
      )}

      {/* Outlets Tab */}
      {activeTab === 'outlets' && (
        <div>
          {/* Full Screen Manager View */}
          {viewingOutlet && (
            <div className="w-full h-[calc(100vh-220px)] bg-surface rounded-xl shadow-sm border border-secondary/10 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-secondary/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeOutletView}
                    className="p-2 text-secondary hover:text-text hover:bg-secondary/10 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium">← Back</span>
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-text">{viewingOutlet.name}</h3>
                    <p className="text-xs text-secondary">{viewingOutlet.address}</p>
                  </div>
                </div>
                <button
                  onClick={closeOutletView}
                  className="p-2 text-secondary hover:text-text hover:bg-secondary/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex border-b border-secondary/10 px-4 flex-shrink-0">
                {['orders', 'menu', 'tables', 'staff'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${viewMode === mode ? 'border-b-2 border-primary text-primary' : 'text-secondary hover:text-text'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {viewMode === 'orders' && <LiveOrders />}
                {viewMode === 'menu' && <MenuControl />}
                {viewMode === 'tables' && <TableManagement />}
                {viewMode === 'staff' && <StaffManagement />}
              </div>
            </div>
          )}

          {/* Side Panel View */}
          {!viewingOutlet && (
            <div className="flex gap-6 h-[calc(100vh-220px)] min-w-0">
              {/* List Outlets */}
              <div className="flex-1 min-w-0 bg-surface p-6 rounded-xl shadow-sm border border-secondary/10 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text flex items-center">
                    <Store className="h-5 w-5 mr-2 text-primary" />
                    Existing Outlets
                  </h3>
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 font-medium text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add an Outlet
                  </button>
                </div>
                <div className="space-y-3 max-h-125 overflow-y-auto">
                  {outlets.length === 0 ? (
                    <p className="text-secondary text-sm">No outlets found.</p>
                  ) : (
                    outlets.map((outlet) => (
                      <div
                        key={outlet._id}
                        className="p-3 border border-secondary/10 rounded-lg hover:bg-secondary/5 transition-all"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-medium text-text truncate">{outlet.name}</span>
                          </div>
                          <button
                            onClick={() => handleOutletClick(outlet)}
                            className="p-1 text-secondary hover:text-primary hover:bg-secondary/10 rounded transition-colors flex-shrink-0"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <span
                            className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${outlet.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {outlet.isActive ? 'A' : 'I'}
                          </span>
                        </div>
                        <p className="text-xs text-secondary mt-1 capitalize">{outlet.type.replace('_', ' ')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Managers Tab */}
            </div>
          )}
        </div>
      )}

      {/* Add Outlet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-secondary/10">
              <h2 className="text-xl font-bold text-primary">Add New Outlet</h2>
            </div>
            <form onSubmit={handleOutletSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Outlet Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  value={outletForm.name}
                  onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Address</label>
                <textarea
                  required
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
                  value={outletForm.address}
                  onChange={(e) => setOutletForm({ ...outletForm, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    value={outletForm.type}
                    onChange={(e) => setOutletForm({ ...outletForm, type: e.target.value })}
                  >
                    <option value="dine_in">Dine In</option>
                    <option value="cloud_kitchen">Cloud Kitchen</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    value={outletForm.phoneNumber}
                    onChange={(e) => setOutletForm({ ...outletForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Location</label>
                <LocationPicker
                  onChange={(pos) =>
                    setOutletForm((prev) => ({
                      ...prev,
                      latitude: pos.lat,
                      longitude: pos.lng,
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="number"
                    step="any"
                    readOnly
                    placeholder="Latitude"
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-sm text-secondary"
                    value={outletForm.latitude}
                  />
                  <input
                    type="number"
                    step="any"
                    readOnly
                    placeholder="Longitude"
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-sm text-secondary"
                    value={outletForm.longitude}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeTab === 'managers' && (
        <div className="max-w-2xl mx-auto bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-primary" />
            Assign New Manager
          </h3>
          <form onSubmit={handleManagerSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Select Outlet</label>
              <select
                required
                className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                value={managerForm.outletId}
                onChange={(e) => setManagerForm({ ...managerForm, outletId: e.target.value })}
              >
                <option value="">-- Select an Outlet --</option>
                {outlets.map((outlet) => (
                  <option key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Manager Name</label>
              <input
                type="text"
                required
                className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                value={managerForm.name}
                onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                value={managerForm.email}
                onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Phone</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                  value={managerForm.phoneNumber}
                  onChange={(e) => setManagerForm({ ...managerForm, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating...' : 'Create Manager'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OutletManagement;
