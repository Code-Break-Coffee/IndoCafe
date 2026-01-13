import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextValues';
import { useOutlet } from '../../context/OutletContextValues';
import axios from '../../lib/axios';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Edit, X, User, Users } from 'lucide-react';
// import { useTheme } from '../../context/ThemeContext';

const StaffManagement = () => {
  const { user } = useAuth();
  const { selectedOutlet } = useOutlet();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // For admin: use selected outlet from context, for manager: use their assigned outlet
  const outletId = user?.role === 'SUPER_ADMIN' ? selectedOutlet?._id : user?.defaultOutletId || user?.outletId;

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'WAITER',
    position: '',
    shiftStartTime: '',
    phoneNumber: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = ['WAITER', 'KITCHEN', 'DISPATCHER', 'RIDER', 'CASHIER'];

  const rolePositions = {
    KITCHEN: ['Head Chef', 'Sous Chef', 'Line Cook', 'Assistant', 'Dishwasher'],
    WAITER: ['Head Waiter', 'Server', 'Trainee'],
  };

  const fetchStaff = React.useCallback(async () => {
    if (!outletId) return;
    try {
      const response = await axios.get(`/api/manager/staff/${outletId}`);
      setStaffList(response.data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setError('Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  }, [outletId]);

  useEffect(() => {
    if (outletId) {
      fetchStaff();
    }
  }, [outletId, fetchStaff]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData({
      ...formData,
      role: newRole,
      position: rolePositions[newRole] ? rolePositions[newRole][0] : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/manager/staff', {
        ...formData,
        outletId: outletId,
      });
      setSuccess('Staff member added successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'WAITER',
        position: 'Head Waiter',
        shiftStartTime: '',
        phoneNumber: '',
      });
      fetchStaff();
      setTimeout(() => setIsAddModalOpen(false), 1500); // Close modal on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff member.');
    }
  };

  const handleRemove = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;

    try {
      await axios.delete(`/api/manager/staff/${staffId}`);
      setStaffList(staffList.filter((staff) => staff._id !== staffId));
      setSuccess('Staff member removed successfully.');
    } catch (err) {
      setError('Failed to remove staff member. ' + err.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Staff Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team members and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`${isEditMode ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : ''}`}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditMode ? 'Done Editing' : 'Edit List'}
          </Button>
          <Button
            onClick={() => {
              setIsAddModalOpen(true);
              setError('');
              setSuccess('');
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staffList.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Users className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No staff members found</p>
            <p className="text-sm">Click "Add Staff" to get started</p>
          </div>
        ) : (
          staffList.map((staff) => (
            <div
              key={staff._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                  {staff.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${
                      staff.role === 'KITCHEN'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        : staff.role === 'WAITER'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {staff.role}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{staff.name}</h3>
              {staff.position && <p className="text-sm font-medium text-primary mb-2">{staff.position}</p>}

              <div className="space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 opacity-70">📧</span>
                  {staff.email}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 opacity-70">📱</span>
                  {staff.phoneNumber || 'N/A'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 opacity-70">⏰</span>
                  Start: {staff.shiftDetails?.startTime || 'Not set'}
                </p>
              </div>

              {/* Actions (Only visible in Edit Mode) */}
              {isEditMode && (
                <div className="absolute top-2 right-2 animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => handleRemove(staff._id)}
                    className="p-2 bg-white dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm transition-colors"
                    title="Remove Staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Staff Member</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {rolePositions[formData.role] && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position / Title</label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      >
                        <option value="">Select Position</option>
                        {rolePositions[formData.role].map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shift Start Time</label>
                    <input
                      type="time"
                      name="shiftStartTime"
                      value={formData.shiftStartTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end items-center border-t border-gray-100 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Staff Account</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
