import { useState } from 'react';
import api from '../../lib/axios';

export default function TableReservationUI({ tables, onTableReserved, onTableReleased }) {
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    partySize: '',
    reservationTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReserveClick = (tableId) => {
    setSelectedTableId(tableId);
    setShowReservationModal(true);
    setFormData({ guestName: '', partySize: '', reservationTime: '' });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitReservation = async () => {
    if (!formData.guestName || !formData.partySize || !formData.reservationTime) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/api/waiter/tables/${selectedTableId}/reserve`, {
        guestName: formData.guestName,
        partySize: parseInt(formData.partySize),
        reservationTime: formData.reservationTime,
      });

      if (response.data.success) {
        onTableReserved(response.data.data);
        setShowReservationModal(false);
      } else {
        setError(response.data.message || 'Failed to reserve table');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve table');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to release this table?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/api/waiter/tables/${tableId}/release`);

      if (response.data.success) {
        onTableReleased(response.data.data);
      } else {
        setError(response.data.message || 'Failed to release table');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release table');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">{error}</div>}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table._id}
            className={`p-4 rounded-lg border-2 ${
              table.occupancy === 'occupied' ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{table.label}</div>
              <div className="text-sm text-gray-600 mt-1">Capacity: {table.capacity}</div>
              <div className="text-sm text-gray-600">Floor: {table.floor}</div>

              {/* Status Badge */}
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                    table.isOccupied ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                  }`}
                >
                  {table.isOccupied ? 'Occupied' : 'Available'}
                </span>
              </div>

              {/* Current Order Info */}
              {table.currentOrderId && (
                <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 p-2 rounded">
                  {table.currentOrderId.items?.length || 0} items
                  <br />
                  Status: {table.currentOrderId.status}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {!table.isOccupied ? (
                  <button
                    onClick={() => handleReserveClick(table._id)}
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    disabled={loading}
                  >
                    Reserve
                  </button>
                ) : (
                  <button
                    onClick={() => handleReleaseTable(table._id)}
                    className="w-full bg-orange-600 text-white py-2 rounded font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    disabled={loading}
                  >
                    Release
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reserve Table</h3>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Guest Name</label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter guest name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Party Size</label>
                <input
                  type="number"
                  name="partySize"
                  value={formData.partySize}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Number of people"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Reservation Time</label>
                <input
                  type="time"
                  name="reservationTime"
                  value={formData.reservationTime}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowReservationModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReservation}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Reserving...' : 'Reserve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
