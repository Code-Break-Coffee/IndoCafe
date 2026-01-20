import React, { useState, useEffect } from 'react';
import ClassicLoader from '@/components/ui/loader';
import {
  Tags,
  TagsTrigger,
  TagsContent,
  TagsInput,
  TagsItem,
  TagsList,
  TagsEmpty,
  TagsGroup,
  TagsValue,
} from '@/components/ui/tags';
import { menuService } from '../../services/menuService';
import { Plus, Image as ImageIcon, Search, Filter } from 'lucide-react';

const TAG_OPTIONS = [
  { id: 'south-indian', label: 'South Indian' },
  { id: 'north-indian', label: 'North Indian' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'continental', label: 'Continental' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'beverages', label: 'Beverages' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'quick-bites', label: 'Quick Bites' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'tandoor', label: 'Tandoor' },
  { id: 'biryani', label: 'Biryani' },
];

const GlobalMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterVeg, setFilterVeg] = useState('All'); // All | Veg | Non-Veg
  const [filterTags, setFilterTags] = useState([]);
  const [sortOrder, setSortOrder] = useState('Default'); // Default | PriceAsc | PriceDesc

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: 'Starters',
    image: '',
    isVeg: true,
    pieces: '',
  });

  const categories = ['Starters', 'Mains', 'Desserts', 'Beverages'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (params) => {
    try {
      setLoading(true);
      const res = await menuService.getAllMenuItems(params);
      const payload = res.data;
      // When pagination is enabled, payload = { items, pagination }
      const itemsData = Array.isArray(payload) ? payload : payload?.items || [];
      const pagination = payload?.pagination;
      setItems(itemsData);
      if (pagination) {
        setCurrentPage(pagination.page || 1);
        setPageSize(pagination.limit || 10);
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(pagination.total || itemsData.length);
      } else {
        setTotalPages(1);
        setTotalCount(itemsData.length);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load menu items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
  };

  const toggleFilterTag = (tagId) => {
    setFilterTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Upload immediately and set Cloudinary URL
    setImageUploading(true);
    setImageFile(file);

    // Show local preview while uploading
    setFormData((prev) => ({
      ...prev,
      image: URL.createObjectURL(file),
    }));

    (async () => {
      try {
        const url = await menuService.uploadImageToCloudinary(file);
        setFormData((prev) => ({
          ...prev,
          image: url,
        }));
        // Clear file so submit won't re-upload
        setImageFile(null);
      } catch (err) {
        console.error('Image upload failed:', err);
        alert(err.message || 'Failed to upload image. Check Cloudinary config.');
      } finally {
        setImageUploading(false);
      }
    })();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = '';

      // Upload image ONLY on submit
      if (imageFile) {
        setImageUploading(true);
        try {
          imageUrl = await menuService.uploadImageToCloudinary(imageFile);
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          alert('Failed to upload image. Please try again.');
          setImageUploading(false);
          return;
        }
      }

      const dataToSend = {
        ...formData,
        image: imageUrl || '', // real Cloudinary URL or empty string
        tags: selectedTags,
      };

      // Remove pieces if empty
      if (!dataToSend.pieces) {
        delete dataToSend.pieces;
      }

      if (isEditing && editingItemId) {
        await menuService.updateMenuItem(editingItemId, dataToSend);
      } else {
        await menuService.createMenuItem(dataToSend);
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setEditingItemId(null);
      setFormData({
        pieces: '',
        name: '',
        description: '',
        basePrice: '',
        category: 'Starters',
        image: '',
        isVeg: true,
      });
      setSelectedTags([]);
      setImageFile(null);

      fetchItems();
    } catch (err) {
      console.error('Failed to create item:', err);
      alert(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setImageUploading(false);
    }
  };

  // Group items by category (server already filtered/sorted)
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Refetch items when filters or pagination change (debounce search)
  useEffect(() => {
    const params = {
      search: searchQuery || undefined,
      category: filterCategory !== 'All' ? filterCategory : undefined,
      veg: filterVeg !== 'All' ? filterVeg : undefined,
      tags: filterTags.length ? filterTags.join(',') : undefined,
      sort: sortOrder === 'PriceAsc' ? 'priceAsc' : sortOrder === 'PriceDesc' ? 'priceDesc' : undefined,
      page: currentPage,
      limit: pageSize,
    };
    const t = setTimeout(() => {
      fetchItems(params);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, filterCategory, filterVeg, filterTags, sortOrder, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterVeg, filterTags, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-primary">
        <ClassicLoader className="w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button onClick={fetchItems} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen text-text">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Global Menu Management</h1>
          <p className="text-secondary">Manage all menu items across the franchise.</p>
        </div>
        <button
          onClick={() => {
            setSelectedTags([]);
            setIsEditing(false);
            setEditingItemId(null);
            setFormData({
              name: '',
              description: '',
              basePrice: '',
              category: 'Starters',
              image: '',
              isVeg: true,
              pieces: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-surface border border-secondary/10 rounded-xl p-4 mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Name */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Veg Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Type</label>
            <select
              value={filterVeg}
              onChange={(e) => setFilterVeg(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            >
              <option value="All">All</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
            </select>
          </div>

          {/* Sort by Price */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Sort</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            >
              <option value="Default">Default</option>
              <option value="PriceAsc">Price: Low to High</option>
              <option value="PriceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Filter by Tags</label>
          <Tags value={filterTags} setValue={setFilterTags}>
            <TagsTrigger>
              {filterTags.length === 0 ? (
                <span className="text-sm text-muted-foreground">Select tags to filter...</span>
              ) : (
                filterTags.map((tag) => (
                  <TagsValue key={tag} onRemove={() => toggleFilterTag(tag)}>
                    {TAG_OPTIONS.find((t) => t.id === tag)?.label || tag}
                  </TagsValue>
                ))
              )}
            </TagsTrigger>
            <TagsContent>
              <TagsInput placeholder="Search tags..." />
              <TagsList>
                <TagsEmpty>No tags found.</TagsEmpty>
                <TagsGroup>
                  {TAG_OPTIONS.map((tag) => (
                    <TagsItem key={tag.id} value={tag.id} onSelect={() => toggleFilterTag(tag.id)}>
                      {tag.label}
                      {filterTags.includes(tag.id) && <span className="text-xs text-primary">✓</span>}
                    </TagsItem>
                  ))}
                </TagsGroup>
              </TagsList>
            </TagsContent>
          </Tags>
        </div>

        {/* Clear filters */}
        <div className="flex justify-end">
          <button
            className="px-3 py-2 text-sm rounded-md border border-secondary/20 hover:bg-secondary/10"
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('All');
              setFilterVeg('All');
              setFilterTags([]);
              setSortOrder('Default');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="bg-surface border border-secondary/10 rounded-xl p-3 mb-6 flex items-center justify-between">
        <div className="text-sm text-secondary">
          Showing {(currentPage - 1) * pageSize + (items.length ? 1 : 0)}–{Math.min(currentPage * pageSize, totalCount)}{' '}
          of {totalCount}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-secondary">Per page:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="px-2 py-1 rounded-md border border-secondary/20 bg-background text-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-1 text-sm rounded-md border border-secondary/20 disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Prev
          </button>
          <span className="text-sm text-secondary">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="px-3 py-1 text-sm rounded-md border border-secondary/20 disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
            <h2 className="text-xl font-semibold mb-4 text-primary border-b border-secondary/10 pb-2">{category}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-secondary text-sm border-b border-secondary/10">
                    <th className="py-3 px-4 font-medium">Image</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Description</th>
                    <th className="py-3 px-4 font-medium">Tags</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium text-right">Base Price</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryItems.map((item) => (
                    <tr key={item._id} className="border-b border-secondary/5 hover:bg-background/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/10">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-secondary text-sm max-w-xs truncate">{item.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(item.tags || []).length === 0 && (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          )}
                          {(item.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] px-2 py-1 rounded-full bg-secondary/10 text-secondary"
                            >
                              {TAG_OPTIONS.find((t) => t.id === tag)?.label || tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">₹{item.basePrice}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          className="px-3 py-1 text-sm rounded-md border border-secondary/20 hover:bg-secondary/10"
                          onClick={() => {
                            setIsEditing(true);
                            setEditingItemId(item._id);
                            setFormData({
                              name: item.name || '',
                              description: item.description || '',
                              basePrice: item.basePrice ?? '',
                              category: item.category || 'Starters',
                              image: item.image || '',
                              isVeg: !!item.isVeg,
                              pieces: item.pieces ?? '',
                            });
                            setSelectedTags(item.tags || []);
                            setImageFile(null);
                            setIsModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-secondary/10">
              <h2 className="text-xl font-bold text-primary">{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
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

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Tags</label>
                <Tags value={selectedTags} setValue={setSelectedTags}>
                  <TagsTrigger>
                    {selectedTags.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Select cuisine/tags...</span>
                    ) : (
                      selectedTags.map((tag) => (
                        <TagsValue key={tag} onRemove={() => toggleTag(tag)}>
                          {TAG_OPTIONS.find((t) => t.id === tag)?.label || tag}
                        </TagsValue>
                      ))
                    )}
                  </TagsTrigger>
                  <TagsContent>
                    <TagsInput placeholder="Search tags..." />
                    <TagsList>
                      <TagsEmpty>No tags found.</TagsEmpty>
                      <TagsGroup>
                        {TAG_OPTIONS.map((tag) => (
                          <TagsItem key={tag.id} value={tag.id} onSelect={() => toggleTag(tag.id)}>
                            {tag.label}
                            {selectedTags.includes(tag.id) && <span className="text-xs text-primary">✓</span>}
                          </TagsItem>
                        ))}
                      </TagsGroup>
                    </TagsList>
                  </TagsContent>
                </Tags>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Upload Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20
                      focus:outline-none focus:ring-2 focus:ring-primary/50
                      bg-background file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90"
                />

                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVeg"
                  id="isVeg"
                  checked={formData.isVeg}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary rounded border-secondary/20 focus:ring-primary"
                />
                <label htmlFor="isVeg" className="text-sm font-medium text-text">
                  Is Vegetarian?
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditingItemId(null);
                  }}
                  className="px-4 py-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={imageUploading}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg
                            hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {imageUploading ? 'Uploading...' : isEditing ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalMenu;
