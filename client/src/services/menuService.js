import axios from 'axios';
import api from '../lib/axios';

export const menuService = {
  // Admin: Fetch all global menu items
  getAllMenuItems: async (filters = {}) => {
    // Supports query filters: search, category, tags (array), veg, sort
    const response = await api.get('/api/admin/menu', { params: filters });
    return response.data;
  },

  // Manager: Fetch merged menu for a specific outlet
  getOutletMenu: async (outletId) => {
    const response = await api.get(`/api/public/menu/${outletId}`);
    return response.data;
  },

  // Admin: Create a new global menu item
  createMenuItem: async (formData) => {
    // formData should be a FormData object if uploading images,
    // or JSON if just data. The prompt mentions "uploads image",
    // so we'll assume FormData and set headers accordingly if needed,
    // but axios handles FormData automatically.
    const response = await api.post('/api/admin/menu', formData);
    return response.data;
  },

  // Admin: Update a global menu item
  updateMenuItem: async (itemId, data) => {
    const response = await api.put(`/api/admin/menu/${itemId}`, data);
    return response.data;
  },

  // Manager: Update item status and price for their outlet
  updateItemStatus: async (itemId, { isAvailable, price, outletId }) => {
    const response = await api.put(`/api/manager/menu/${itemId}/status`, {
      isAvailable,
      customPrice: price,
      outletId,
    });
    return response.data;
  },

  // File to Base64 Conversion
  uploadImageToCloudinary: async (file) => {
    try {
      const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      if (!upload_preset || !cloud_name) {
        const missing = [
          !upload_preset ? 'VITE_CLOUDINARY_UPLOAD_PRESET' : null,
          !cloud_name ? 'VITE_CLOUDINARY_CLOUD_NAME' : null,
        ]
          .filter(Boolean)
          .join(', ');
        throw new Error(`Missing Cloudinary env: ${missing}. Configure in client/.env and restart dev server.`);
      }
      const data = new FormData();
      data.append('file', file);

      data.append('upload_preset', upload_preset);
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, data);

      return res.data.secure_url;
    } catch (error) {
      // 🔥 THIS is what we need
      console.error('Cloudinary upload error:', error.response?.data || error.message);
      throw error;
    }
  },
};
