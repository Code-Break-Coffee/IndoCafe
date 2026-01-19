import React, { useEffect, useState } from 'react';
import MenuCard from '../../components/ui/MenuCard';
import { Button } from '../../components/ui/button';
import { useOutlet } from '../../context/OutletContextValues';
import api from '../../lib/axios';

const FeaturedItems = () => {
  const { selectedOutlet } = useOutlet();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!selectedOutlet?._id) return;

      setLoading(true);
      try {
        const res = await api.get(`/api/public/menu/${selectedOutlet._id}`);
        if (res.data.success) {
          // For featured items, maybe we just take the first 4 or random?
          // Or we can filter by a 'featured' tag if we add it later.
          // For now, let's just slice the top 4.
          setItems(res.data.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [selectedOutlet]);

  if (!selectedOutlet) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Our Signature Dishes</h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Discover the most loved dishes from our kitchen at{' '}
            <span className="text-primary font-semibold">{selectedOutlet.name}</span>.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-secondary">Loading menu...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {items.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center text-secondary">No items available at this outlet yet.</div>
            )}
          </div>
        )}

        <div className="text-center">
          <Button variant="primary" className="px-8 py-3 text-lg">
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
