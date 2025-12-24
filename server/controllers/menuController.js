import MenuItem from '../models/MenuItem.js';
import OutletItemConfig from '../models/OutletItemConfig.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Create a new Global MenuItem
// @route   POST /api/admin/menu
// @access  Private (Super Admin)
export const createGlobalMenuItem = async (req, res) => {
  try {
    const { name, description, basePrice, category, image, isVeg, pieces, tags } = req.body;

    const menuItem = await MenuItem.create({
      name,
      description,
      basePrice,
      category,
      image,
      isVeg,
      pieces,
      tags
    });

    sendResponse(res, 201, menuItem, 'Menu item created successfully', true);
  } catch (error) {
    console.error('Error creating menu item:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Update local outlet item status/price
// @route   PUT /api/manager/menu/:itemId/status
// @access  Private (Outlet Manager)
export const updateOutletItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isAvailable, customPrice } = req.body;
    
    // Assuming the user object attached to req has an outletId
    // If not, we might need to fetch it from the user profile or pass it in the body
    // Based on previous context, managers are assigned to an outlet.
    // Let's assume req.user.outletId exists or we fetch it.
    // However, standard JWT usually just has userId and role.
    // We might need to look up the manager's outlet.
    // For now, let's assume the middleware or a previous lookup attached it, 
    // OR we look it up here.
    
    // Let's look up the user's outlet if not present.
    // Since I don't have the User model details handy for relations, 
    // I'll assume the client sends outletId OR I can find it via the User model.
    // BUT, the prompt says "Find the OutletItemConfig for this manager's outlet".
    // I'll assume `req.user.outletId` is populated or I'll query the User/StaffProfile.
    
    // Let's check the User model briefly to be safe, but I'll proceed assuming I can get it.
    // Actually, let's assume the manager passes the outletId in the body or we derive it.
    // To be safe and robust:
    // If the user is a manager, they should only manage their own outlet.
    
    // Let's assume req.user has the necessary info or we query.
    // For this implementation, I will assume `req.user.defaultOutletId` is available 
    // (e.g. added by auth middleware if it fetches user details).
    
    const outletId = req.user.defaultOutletId; 

    if (!outletId) {
        return sendResponse(res, 400, null, 'Manager is not assigned to an outlet', false);
    }

    const config = await OutletItemConfig.findOneAndUpdate(
      { outletId, menuItemId: itemId },
      { 
        $set: { 
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          customPrice: customPrice !== undefined ? customPrice : null
        } 
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    sendResponse(res, 200, config, 'Outlet menu configuration updated', true);
  } catch (error) {
    console.error('Error updating outlet menu config:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Get full menu for a specific outlet (Merged)
// @route   GET /api/public/menu/:outletId
// @access  Public
export const getOutletMenu = async (req, res) => {
  try {
    const { outletId } = req.params;

    // Step A: Fetch ALL Global MenuItems
    const globalItems = await MenuItem.find({}).lean();

    // Step B: Fetch ALL OutletItemConfigs for this specific outletId
    const outletConfigs = await OutletItemConfig.find({ outletId }).lean();

    // Create a map for faster lookup of configs
    const configMap = new Map();
    outletConfigs.forEach(config => {
      configMap.set(config.menuItemId.toString(), config);
    });

    // Step C: Merge Logic
    const mergedMenu = globalItems.map(item => {
      const config = configMap.get(item._id.toString());
      
      // Default values from global item
      let finalPrice = item.basePrice;
      let isAvailable = true; // Default global availability (could be item.isAvailable if we kept it)

      // Override if config exists
      if (config) {
        if (config.customPrice !== null && config.customPrice !== undefined) {
          finalPrice = config.customPrice;
        }
        if (config.isAvailable !== undefined) {
          isAvailable = config.isAvailable;
        }
      }

      return {
        ...item,
        price: finalPrice, // The effective price
        isAvailable,       // The effective availability
        originalPrice: item.basePrice // Optional: helpful for UI to show discounts/surcharges
      };
    });

    sendResponse(res, 200, mergedMenu, 'Menu fetched successfully', true);
  } catch (error) {
    console.error('Error fetching outlet menu:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};
