import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import { Plus, Image as ImageIcon, Loader, Search, Filter } from 'lucide-react';

const GlobalMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: 'Starters',
    image: '',
    isVeg: true,
  });

  const categories = ['Starters', 'Mains', 'Desserts', 'Beverages'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAllMenuItems();
      // Assuming data.data contains the array based on responseHandler
      setItems(data.data || []);
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

    // Just store file + preview
    setImageFile(file);

    setFormData((prev) => ({
      ...prev,
      image: URL.createObjectURL(file), // preview only
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = '';

      // Upload image ONLY on submit
      if (imageFile) {
        setImageUploading(true);
        imageUrl = await menuService.uploadImageToCloudinary(imageFile);
      }

      await menuService.createMenuItem({
        ...formData,
        image: imageUrl, // real Cloudinary URL
      });

      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        category: 'Starters',
        image: '',
        isVeg: true,
      });
      setImageFile(null);

      fetchItems();
    } catch (err) {
      console.error('Failed to create item:', err);
      alert(err.response?.data?.message || 'Failed to create item.');
    } finally {
      setImageUploading(false);
    }
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-primary">
        <Loader className="w-10 h-10 animate-spin" />
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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
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
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">₹{item.basePrice}</td>
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
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-secondary/10">
              <h2 className="text-xl font-bold text-primary">Add New Menu Item</h2>
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
                  onClick={() => setIsModalOpen(false)}
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
                  {imageUploading ? 'Uploading...' : 'Create Item'}
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
