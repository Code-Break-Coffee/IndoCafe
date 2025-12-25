import api from '../lib/axios';

export const menuService = {
  // Admin: Fetch all global menu items
  getAllMenuItems: async () => {
    // Assuming GET /api/admin/menu returns all items. 
    // If not, this might need to be adjusted to the correct endpoint.
    const response = await api.get('/api/admin/menu'); 
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
    const response = await api.post('/api/admin/menu', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
};
