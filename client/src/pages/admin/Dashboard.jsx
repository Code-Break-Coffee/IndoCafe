import { LayoutDashboard, TrendingUp, ShoppingBag, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import ClassicLoader from '@/components/ui/loader';
import api from '../../lib/axios';

const Dashboard = () => {
  const [priceRequests, setPriceRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await api.get('/api/admin/price-requests/pending');
      if (response.data.success) {
        setPriceRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch price requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (requestId) => {
    try {
      setApprovingId(requestId);
      const response = await api.put(`/api/admin/price-requests/${requestId}/approve`);
      if (response.data.success) {
        setPriceRequests(priceRequests.filter((r) => r._id !== requestId));
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert(error.response?.data?.message || 'Failed to approve price request');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setRejectingId(requestId);
      const reason = rejectionReason[requestId] || '';
      const response = await api.put(`/api/admin/price-requests/${requestId}/reject`, {
        reason,
      });
      if (response.data.success) {
        setPriceRequests(priceRequests.filter((r) => r._id !== requestId));
        setShowRejectModal(null);
        setRejectionReason({});
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert(error.response?.data?.message || 'Failed to reject price request');
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary text-sm font-medium">Total Orders</h3>
            <span className="p-2 bg-primary/10 text-primary rounded-lg">
              <ShoppingBag className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-text">1,248</p>
          <p className="text-green-500 text-sm mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12.5% <span className="text-secondary ml-1">from last month</span>
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary text-sm font-medium">Total Revenue</h3>
            <span className="p-2 bg-green-100 text-green-600 rounded-lg">
              <LayoutDashboard className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-text">$45,231</p>
          <p className="text-green-500 text-sm mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            +8.2% <span className="text-secondary ml-1">from last month</span>
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary text-sm font-medium">Active Users</h3>
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-text">3,405</p>
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
            -2.4% <span className="text-secondary ml-1">from last month</span>
          </p>
        </div>
      </div>

      {/* Recent Activity or Charts could go here */}
      <div className="bg-surface rounded-xl shadow-sm border border-secondary/10 p-6 mb-6">
        <h3 className="text-lg font-semibold text-text mb-4">Recent Activity</h3>
        <div className="text-secondary text-center py-8">Chart placeholder</div>
      </div>

      {/* Price Change Requests Section */}
      <div className="bg-surface rounded-xl shadow-sm border border-secondary/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text">Pending Price Change Requests</h3>
          {loadingRequests && <ClassicLoader className="h-5 w-5 border-2 border-primary border-t-transparent" />}
        </div>

        {loadingRequests && priceRequests.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <ClassicLoader className="h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : priceRequests.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>No pending price change requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {priceRequests.map((request) => (
              <div
                key={request._id}
                className="bg-background border border-secondary/10 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-text">{request.menuItemName}</h4>
                  <p className="text-sm text-secondary mt-1">
                    <span className="font-medium">{request.outletId?.name}</span> • Requested by{' '}
                    <span className="font-medium">{request.managerId?.name}</span>
                  </p>
                  <p className="text-sm text-secondary mt-1">
                    Price Change: <span className="text-primary font-semibold">₹{request.currentPrice}</span> →{' '}
                    <span className="text-green-600 font-semibold">₹{request.proposedPrice}</span>
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    {new Date(request.createdAt).toLocaleDateString()}{' '}
                    {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request._id)}
                    disabled={approvingId === request._id || rejectingId === request._id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {approvingId === request._id ? (
                      <>
                        <ClassicLoader className="h-4 w-4 border-2 border-white/80 border-t-transparent" />
                        <span>Approving</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(request._id)}
                    disabled={approvingId === request._id || rejectingId === request._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </div>

                {/* Reject Modal */}
                {showRejectModal === request._id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                      <div className="p-6 border-b border-secondary/10">
                        <h2 className="text-xl font-bold text-primary">Reject Price Request</h2>
                      </div>
                      <div className="p-6 space-y-4">
                        <p className="text-secondary">
                          Are you sure you want to reject this price change request for{' '}
                          <span className="font-semibold text-text">{request.menuItemName}</span>?
                        </p>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            Rejection Reason (Optional)
                          </label>
                          <textarea
                            value={rejectionReason[request._id] || ''}
                            onChange={(e) => setRejectionReason({ ...rejectionReason, [request._id]: e.target.value })}
                            placeholder="Provide a reason for rejection..."
                            className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-text"
                            rows="3"
                          />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowRejectModal(null)}
                            className="px-4 py-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={rejectingId === request._id}
                            onClick={() => handleReject(request._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {rejectingId === request._id ? 'Rejecting...' : 'Reject Request'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
