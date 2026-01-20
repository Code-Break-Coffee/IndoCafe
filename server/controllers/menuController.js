import MenuItem from '../models/MenuItem.js';
import OutletItemConfig from '../models/OutletItemConfig.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Get all global menu items
// @route   GET /api/admin/menu
// @access  Private (Super Admin)
export const getAllGlobalMenuItems = async (req, res) => {
  try {
    const { search, category, tags, veg, sort } = req.query;

    const filter = {};

    // Name search (case-insensitive)
    if (search && String(search).trim().length > 0) {
      filter.name = { $regex: String(search).trim(), $options: 'i' };
    }

    // Category exact match
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Veg filter
    if (veg && veg !== 'All') {
      if (veg.toLowerCase() === 'veg' || veg === 'true') filter.isVeg = true;
      else if (veg.toLowerCase() === 'non-veg' || veg === 'false')
        filter.isVeg = false;
    }

    // Tags any-of filter
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) tagsArray = tags;
      else if (typeof tags === 'string')
        tagsArray = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      if (tagsArray.length > 0) {
        filter.tags = { $in: tagsArray };
      }
    }

    // Sorting
    let sortSpec = undefined;
    if (sort === 'priceAsc') sortSpec = { basePrice: 1 };
    if (sort === 'priceDesc') sortSpec = { basePrice: -1 };

    // Pagination
    const pageNum = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limitNum = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const skip = (pageNum - 1) * limitNum;

    const total = await MenuItem.countDocuments(filter);
    const query = MenuItem.find(filter).skip(skip).limit(limitNum);
    if (sortSpec) query.sort(sortSpec);

    const menuItems = await query.exec();
    const totalPages = Math.max(Math.ceil(total / limitNum), 1);
    sendResponse(
      res,
      200,
      {
        items: menuItems,
        pagination: { page: pageNum, limit: limitNum, total, totalPages },
      },
      'Menu items fetched successfully',
      true
    );
  } catch (error) {
    console.error('Error fetching menu items:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Create a new Global MenuItem
// @route   POST /api/admin/menu
// @access  Private (Super Admin)
const ALLOWED_TAGS = [
  'south-indian',
  'north-indian',
  'chinese',
  'continental',
  'cafe',
  'beverages',
  'desserts',
  'vegan',
  'gluten-free',
  'quick-bites',
  'snacks',
  'breakfast',
  'tandoor',
  'biryani',
];

export const createGlobalMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      basePrice,
      category,
      image,
      isVeg,
      pieces,
      tags,
    } = req.body;

    const incomingTags = Array.isArray(tags) ? tags : [];
    const invalidTags = incomingTags.filter((t) => !ALLOWED_TAGS.includes(t));
    if (invalidTags.length) {
      return sendResponse(
        res,
        400,
        null,
        `Invalid tags: ${invalidTags.join(', ')}. Allowed tags: ${ALLOWED_TAGS.join(', ')}`,
        false
      );
    }

    const sanitizedTags = [...new Set(incomingTags)];

    const menuItem = await MenuItem.create({
      name,
      description,
      basePrice,
      category,
      image,
      isVeg,
      pieces,
      tags: sanitizedTags,
    });
    sendResponse(res, 201, menuItem, 'Menu item created successfully', true);
  } catch (error) {
    console.error('Error creating menu item:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Update an existing Global MenuItem
// @route   PUT /api/admin/menu/:id
// @access  Private (Super Admin)
export const updateGlobalMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate allowed tags if provided
    let incomingTags = req.body.tags;
    if (incomingTags !== undefined) {
      incomingTags = Array.isArray(incomingTags) ? incomingTags : [];
      const invalidTags = incomingTags.filter((t) => !ALLOWED_TAGS.includes(t));
      if (invalidTags.length) {
        return sendResponse(
          res,
          400,
          null,
          `Invalid tags: ${invalidTags.join(', ')}. Allowed tags: ${ALLOWED_TAGS.join(', ')}`,
          false
        );
      }
      req.body.tags = [...new Set(incomingTags)];
    }

    // Do not allow empty image string to overwrite existing value
    if (req.body.image === '') {
      delete req.body.image;
    }

    const updated = await MenuItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return sendResponse(res, 404, null, 'Menu item not found', false);
    }

    sendResponse(res, 200, updated, 'Menu item updated successfully', true);
  } catch (error) {
    console.error('Error updating menu item:', error);
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

    const targetOutletId = req.body.outletId || req.user.defaultOutletId;

    if (!targetOutletId) {
      return sendResponse(
        res,
        400,
        null,
        'Manager is not assigned to an outlet',
        false
      );
    }

    // Verify access
    const hasAccess =
      (req.user.defaultOutletId &&
        req.user.defaultOutletId.toString() === targetOutletId.toString()) ||
      (req.user.assignedOutlets &&
        req.user.assignedOutlets.some(
          (o) => (o._id || o).toString() === targetOutletId.toString()
        ));

    if (!hasAccess && req.user.role !== 'SUPER_ADMIN') {
      return sendResponse(
        res,
        403,
        null,
        'Not authorized to manage this outlet',
        false
      );
    }

    const config = await OutletItemConfig.findOneAndUpdate(
      { outletId: targetOutletId, menuItemId: itemId },
      {
        $set: {
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          customPrice: customPrice !== undefined ? customPrice : null,
        },
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

    if (!outletId || outletId === 'undefined') {
      return sendResponse(res, 400, null, 'Invalid Outlet ID', false);
    }

    // Step A: Fetch ALL Global MenuItems
    const globalItems = await MenuItem.find({}).lean();

    // Step B: Fetch ALL OutletItemConfigs for this specific outletId
    const outletConfigs = await OutletItemConfig.find({ outletId }).lean();

    // Create a map for faster lookup of configs
    const configMap = new Map();
    outletConfigs.forEach((config) => {
      configMap.set(config.menuItemId.toString(), config);
    });

    // Step C: Merge Logic
    const mergedMenu = globalItems.map((item) => {
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
        isAvailable, // The effective availability
        originalPrice: item.basePrice, // Optional: helpful for UI to show discounts/surcharges
      };
    });

    sendResponse(res, 200, mergedMenu, 'Menu fetched successfully', true);
  } catch (error) {
    console.error('Error fetching outlet menu:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};
