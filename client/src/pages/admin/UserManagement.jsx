import ClassicLoader from '@/components/ui/loader';
import { Plus, Filter } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phoneNumber: '',
    defaultOutletId: '',
    password: '',
    shiftStartTime: '',
  });

  const roleOptions = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'AREA_MANAGER', label: 'Area Manager' },
    { value: 'OUTLET_MANAGER', label: 'Outlet Manager' },
    { value: 'CASHIER', label: 'Cashier' },
    { value: 'WAITER', label: 'Waiter' },
    { value: 'KITCHEN', label: 'Kitchen' },
    { value: 'DISPATCHER', label: 'Dispatcher' },
    { value: 'RIDER', label: 'Rider' },
  ];

  const operationalRoles = new Set(['OUTLET_MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'DISPATCHER', 'RIDER']);
  const staffRoles = new Set(['CASHIER', 'WAITER', 'KITCHEN', 'DISPATCHER', 'RIDER']);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedRole ? `/api/admin/users?role=${selectedRole}` : '/api/admin/users';
      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching outlets', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await api.get('/api/admin/outlets');
        if (res.data.success) {
          setOutlets(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching outlets', err);
      }
    };

    fetchOutlets();
  }, []);

  const handleRoleFilter = (role) => {
    setSelectedRole(role === selectedRole ? '' : role);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      phoneNumber: user.phoneNumber || '',
      defaultOutletId: user.defaultOutletId?._id || '',
      password: '',
      shiftStartTime: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      phoneNumber: '',
      defaultOutletId: '',
      password: '',
      shiftStartTime: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      phoneNumber: '',
      defaultOutletId: '',
      password: '',
      shiftStartTime: '',
    });
  };

  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = Boolean(editingUser);

    if (!formData.name || !formData.email || !formData.role || !formData.phoneNumber) {
      alert('Please fill all required fields');
      return;
    }

    if (!isEdit && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    if (operationalRoles.has(formData.role) && !formData.defaultOutletId) {
      alert('Please select a default outlet for operational roles');
      return;
    }

    if (staffRoles.has(formData.role) && !formData.shiftStartTime) {
      alert('Please provide shift start time for staff roles');
      return;
    }

    try {
      setSaveLoading(true);
      if (isEdit) {
        await api.put(`/api/admin/users/${editingUser._id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phoneNumber: formData.phoneNumber,
          outletId: formData.defaultOutletId || null,
        });
      } else {
        // Use staff API for staff roles, admin API for admin/manager roles
        if (staffRoles.has(formData.role)) {
          await api.post('/api/manager/staff', {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phoneNumber: formData.phoneNumber,
            outletId: formData.defaultOutletId,
            shiftStartTime: formData.shiftStartTime,
          });
        } else {
          await api.post('/api/admin/users', {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            outletId: formData.defaultOutletId || null,
          });
        }
      }

      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving user', err);
      alert(err.response?.data?.message || 'Failed to save user. Please try again.');
    } finally {
      setSaveLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-primary">Staff Management</h1>
          <p className="text-secondary">Manage all staff members.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-colors"
          >
            <Plus size={20} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex items-center gap-3">
        <Filter size={20} className="text-secondary" />
        <span className="text-secondary font-medium">Filter by Role:</span>
        <button
          onClick={() => setSelectedRole('')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === ''
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          All Staff
        </button>
        <button
          onClick={() => handleRoleFilter('SUPER_ADMIN')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === 'SUPER_ADMIN'
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          Super Admin
        </button>
        <button
          onClick={() => handleRoleFilter('OUTLET_MANAGER')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === 'OUTLET_MANAGER'
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          Outlet Manager
        </button>
        <button
          onClick={() => handleRoleFilter('WAITER')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === 'WAITER'
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          Waiter
        </button>
        <button
          onClick={() => handleRoleFilter('RIDER')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === 'RIDER'
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          Rider
        </button>
        <button
          onClick={() => handleRoleFilter('CASHIER')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === 'CASHIER'
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          Cashier
        </button>
        <button
          onClick={() => handleRoleFilter('KITCHEN')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === 'KITCHEN'
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          Kitchen
        </button>
        <button
          onClick={() => handleRoleFilter('DISPATCHER')}
          className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer ${
            selectedRole === 'DISPATCHER'
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-text border border-secondary/20 hover:bg-background'
          }`}
        >
          Dispatcher
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
          <h2 className="text-xl font-semibold mb-4 text-primary border-b border-secondary/10 pb-2">Staff</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-secondary text-sm border-b border-secondary/10">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user._id} className="border-b border-secondary/5 hover:bg-background/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 font-medium">{user.email}</td>
                    <td className="py-3 px-4 font-medium">{user.role}</td>
                    <td className="py-3 px-4 font-medium">{user.phoneNumber}</td>
                    <td className="py-3 px-4 font-medium text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="flex items-center gap-2 px-3 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors hover:cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(user)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-colors hover:cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-secondary/10">
              <h2 className="text-xl font-bold text-primary">{editingUser ? 'Edit Staff' : 'Add Staff'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
              </div>

              {operationalRoles.has(formData.role) && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Default Outlet</label>
                  <select
                    name="defaultOutletId"
                    value={formData.defaultOutletId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  >
                    <option value="" disabled>
                      Select Outlet
                    </option>
                    {outlets.map((outlet) => (
                      <option key={outlet._id} value={outlet._id}>
                        {outlet.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {staffRoles.has(formData.role) && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Shift Start Time</label>
                  <input
                    type="time"
                    name="shiftStartTime"
                    value={formData.shiftStartTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
              )}

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
                  disabled={saveLoading}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-secondary/10">
              <h2 className="text-xl font-bold text-primary">Delete Staff</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-secondary">
                Are you sure you want to delete <span className="font-semibold text-text">{userToDelete.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseDelete}
                  className="px-4 py-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={async () => {
                    if (!userToDelete) return;
                    try {
                      setDeleteLoading(true);
                      await api.delete(`/api/admin/users/${userToDelete._id}`);
                      await fetchUsers();
                      handleCloseDelete();
                    } catch (err) {
                      console.error('Error deleting user', err);
                      alert(err.response?.data?.message || 'Failed to delete user. Please try again.');
                    } finally {
                      setDeleteLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-on-primary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
