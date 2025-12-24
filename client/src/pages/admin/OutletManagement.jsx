import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Plus, Store, UserPlus, MapPin, Phone, Loader2 } from 'lucide-react';
import LocationPicker from '../../components/ui/LocationPicker';
import Button from '../../components/ui/Button';

const OutletManagement = () => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outlets'); // 'outlets' or 'managers'

  // Form States
  const [outletForm, setOutletForm] = useState({
    name: '',
    address: '',
    type: 'dine_in',
    phoneNumber: '',
    latitude: '',
    longitude: ''
  });

  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    outletId: ''
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
      console.error("Error fetching outlets", error);
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
          coordinates: [parseFloat(outletForm.longitude), parseFloat(outletForm.latitude)]
        }
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
        role: 'OUTLET_MANAGER'
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

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-secondary/10">
        <button
          onClick={() => setActiveTab('outlets')}
          className={`pb-2 px-4 font-medium text-sm transition-colors ${
            activeTab === 'outlets' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-text'
          }`}
        >
          Manage Outlets
        </button>
        <button
          onClick={() => setActiveTab('managers')}
          className={`pb-2 px-4 font-medium text-sm transition-colors ${
            activeTab === 'managers' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-text'
          }`}
        >
          Add Managers
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Outlets Tab */}
      {activeTab === 'outlets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List Outlets */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
              <Store className="h-5 w-5 mr-2 text-primary" />
              Existing Outlets
            </h3>
            <div className="space-y-3 max-h-125 overflow-y-auto">
              {outlets.length === 0 ? (
                <p className="text-secondary text-sm">No outlets found.</p>
              ) : (
                outlets.map((outlet) => (
                  <div key={outlet._id} className="p-3 border border-secondary/10 rounded-lg hover:bg-secondary/5 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-text">{outlet.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${outlet.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {outlet.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1 capitalize">{outlet.type.replace('_', ' ')}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Outlet Form */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              Add New Outlet
            </h3>
            <form onSubmit={handleOutletSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Outlet Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                  value={outletForm.name}
                  onChange={(e) => setOutletForm({...outletForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-1">Address</label>
                <textarea
                  required
                  rows="2"
                  className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                  value={outletForm.address}
                  onChange={(e) => setOutletForm({...outletForm, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Type</label>
                  <select
                    className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                    value={outletForm.type}
                    onChange={(e) => setOutletForm({...outletForm, type: e.target.value})}
                  >
                    <option value="dine_in">Dine In</option>
                    <option value="cloud_kitchen">Cloud Kitchen</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                    value={outletForm.phoneNumber}
                    onChange={(e) => setOutletForm({...outletForm, phoneNumber: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Location</label>
                <LocationPicker 
                  onChange={(pos) => setOutletForm(prev => ({
                    ...prev,
                    latitude: pos.lat,
                    longitude: pos.lng
                  }))}
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="number"
                    step="any"
                    readOnly
                    placeholder="Latitude"
                    className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-sm text-secondary"
                    value={outletForm.latitude}
                  />
                  <input
                    type="number"
                    step="any"
                    readOnly
                    placeholder="Longitude"
                    className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-sm text-secondary"
                    value={outletForm.longitude}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Creating...' : 'Create Outlet'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Managers Tab */}
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
                onChange={(e) => setManagerForm({...managerForm, outletId: e.target.value})}
              >
                <option value="">-- Select an Outlet --</option>
                {outlets.map(outlet => (
                  <option key={outlet._id} value={outlet._id}>{outlet.name}</option>
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
                onChange={(e) => setManagerForm({...managerForm, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                value={managerForm.email}
                onChange={(e) => setManagerForm({...managerForm, email: e.target.value})}
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
                  onChange={(e) => setManagerForm({...managerForm, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Phone</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-background border border-secondary/20 rounded-lg text-text focus:ring-primary focus:border-primary"
                  value={managerForm.phoneNumber}
                  onChange={(e) => setManagerForm({...managerForm, phoneNumber: e.target.value})}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Creating...' : 'Create Manager'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OutletManagement;
