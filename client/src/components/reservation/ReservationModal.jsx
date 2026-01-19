import React, { useState } from 'react';
import { useOutlet } from '../../context/OutletContextValues';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { X, Calendar, Clock, Users, User, Phone, MessageSquare } from 'lucide-react';

const ReservationModal = ({ onClose }) => {
  const { selectedOutlet } = useOutlet();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    date: '',
    time: '',
    tableSize: 2,
    specialRequests: '',
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOutlet) {
      setMessage('Please select an outlet first.');
      return;
    }

    setStatus('loading');
    try {
      const res = await api.post('/api/public/reservations', {
        ...formData,
        outletId: selectedOutlet._id,
      });

      if (res.data.success) {
        setStatus('success');
        setMessage('Reservation request submitted successfully! We will confirm shortly.');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Reservation Error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to submit reservation.');
    } finally {
      if (status !== 'success') setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-surface p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-white/10">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Request Sent!</h3>
          <p className="text-secondary">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
          <h3 className="text-xl font-bold text-text">Book a Table</h3>
          <button onClick={onClose} className="text-secondary hover:text-text transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <p className="text-sm text-secondary">Reserving at:</p>
            <p className="font-bold text-primary text-lg">{selectedOutlet?.name || 'Select Outlet First'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <User className="h-4 w-4" /> Name
              </label>
              <input
                type="text"
                name="customerName"
                required
                value={formData.customerName}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-text focus:border-primary focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </label>
              <input
                type="tel"
                name="customerPhone"
                required
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-text focus:border-primary focus:outline-none transition-colors"
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-text focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Time
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-text focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Users className="h-4 w-4" /> Guests
              </label>
              <input
                type="number"
                name="tableSize"
                required
                min="1"
                max="20"
                value={formData.tableSize}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-text focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Special Requests
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="3"
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-text focus:border-primary focus:outline-none transition-colors"
                placeholder="Allergies, seating preference, etc."
              ></textarea>
            </div>

            {message && status === 'error' && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{message}</div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-lg font-bold"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Submitting...' : 'Confirm Reservation'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
