import React, { useEffect, useState } from 'react';
import { useOutlet } from '../../context/OutletContextValues';
import api from '../../lib/axios';
import { Button } from '../ui/button';

const OutletSelector = ({ onClose }) => {
  const { setOutlet } = useOutlet();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await api.get('/api/public/outlets');
        if (res.data.success) {
          setOutlets(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch outlets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOutlets();
  }, []);

  const handleSelect = (outlet) => {
    setOutlet(outlet);
    if (onClose) onClose();
  };

  if (loading) return <div className="p-4 text-center">Loading outlets...</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-white/10">
        <h2 className="text-2xl font-bold text-text mb-2 text-center">Select Your Location</h2>
        <p className="text-secondary mb-6 text-center">Choose an outlet near you to see the menu and offers.</p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {outlets.map((outlet) => (
            <div
              key={outlet._id}
              onClick={() => handleSelect(outlet)}
              className="p-4 rounded-xl bg-background border border-white/5 hover:border-primary/50 hover:bg-white/5 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{outlet.name}</h3>
                  <p className="text-sm text-secondary">{outlet.address}</p>
                </div>
                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">➜</div>
              </div>
            </div>
          ))}

          {outlets.length === 0 && <p className="text-center text-secondary">No outlets available at the moment.</p>}
        </div>
      </div>
    </div>
  );
};

export default OutletSelector;
