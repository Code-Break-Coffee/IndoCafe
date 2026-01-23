import React, { useEffect, useMemo, useState } from 'react';
import MenuCard from '../../components/ui/MenuCard';
import api from '../../lib/axios';

const FeaturedItems = ({ outletId, showAll = false }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [diet, setDiet] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [tag, setTag] = useState('all');

  useEffect(() => {
    const fetchMenu = async () => {
      if (!outletId) return;

      try {
        const res = await api.get(`/api/menu/public/${outletId}`);

        if (res.data.success) {
          const allItems = res.data.data;

          // Filter to show only available items
          const availableItems = allItems.filter((item) => item.isAvailable !== false);

          setItems(availableItems);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };

    fetchMenu();
  }, [outletId]);

  const filteredItems = useMemo(() => {
    if (!outletId) return [];
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category;
      const matchesDiet = diet === 'all' || (diet === 'veg' ? item.isVeg === true : item.isVeg === false);
      const matchesTag = tag === 'all' || (Array.isArray(item.tags) && item.tags.includes(tag));
      const matchesSearch =
        !term || item.name.toLowerCase().includes(term) || (item.description || '').toLowerCase().includes(term);
      return matchesCategory && matchesDiet && matchesTag && matchesSearch;
    });
  }, [items, searchTerm, category, diet, tag, outletId]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ['all', ...unique];
  }, [items]);

  const tags = useMemo(() => {
    const unique = new Set();
    items.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => t && unique.add(t));
      }
    });
    return ['all', ...Array.from(unique)];
  }, [items]);

  const displayItems = showAll ? filteredItems : filteredItems.slice(0, 8);

  if (!outletId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 bg-zinc-900/60 border border-white/5 rounded-xl p-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dishes..."
            className="w-full sm:w-1/2 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-amber-500 focus:outline-none"
          />
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-1/2 sm:w-44 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-amber-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-1/2 sm:w-36 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">Veg & Non-Veg</option>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full sm:w-60 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-amber-500 focus:outline-none"
          >
            {tags.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Tags' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayItems.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
        {displayItems.length === 0 && (
          <div className="col-span-full text-center text-zinc-400 py-8">No items match your filters yet.</div>
        )}
      </div>
    </div>
  );
};

export default FeaturedItems;
