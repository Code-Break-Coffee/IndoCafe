import Order from '../models/Order.js';
import Table from '../models/Table.js';
import OutletItemConfig from '../models/OutletItemConfig.js';
import MenuItem from '../models/MenuItem.js';
import crypto from 'crypto';

// Helper function to generate secure session token
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// @desc    Create a new order
// @route   POST /api/public/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { outletId, items, totalAmount, tableId, notes, customerToken } =
      req.body;

    if (!outletId || !items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid order data' });
    }

    let table = null;

    // If tableId is provided, verify the table exists and is in the correct outlet
    if (tableId) {
      table = await Table.findOne({ _id: tableId, outletId });
      if (!table) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid table for this outlet' });
      }

      // If table already has an active order, verify the customer has a valid customer token
      if (table.currentOrderId) {
        const existingOrder = await Order.findById(table.currentOrderId);

        if (
          existingOrder &&
          existingOrder.status !== 'delivered' &&
          existingOrder.status !== 'cancelled'
        ) {
          // Table has an active order - customer must provide the matching token
          if (!customerToken || customerToken !== existingOrder.customerToken) {
            return res.status(403).json({
              success: false,
              message:
                'This table is currently occupied by another customer. Please select a different table.',
            });
          }
        }
      }
    }

    // Enrich items with snapshots (name, price, normalized modifiers)
    const menuIds = items.map((i) => i.menuItem).filter(Boolean);
    const menus = await MenuItem.find({ _id: { $in: menuIds } }).lean();
    const configs = await OutletItemConfig.find({
      outletId,
      menuItemId: { $in: menuIds },
    }).lean();
    const configMap = new Map();
    configs.forEach((c) => configMap.set(c.menuItemId.toString(), c));

    const normalizedItems = items.map((item) => {
      const menu = menus.find(
        (m) => m._id.toString() === String(item.menuItem)
      );
      const cfg = configMap.get(String(item.menuItem));
      const priceFromConfig =
        cfg && cfg.customPrice !== undefined && cfg.customPrice !== null
          ? cfg.customPrice
          : undefined;
      const priceSnapshot =
        typeof item.price === 'number'
          ? item.price
          : (priceFromConfig ?? menu?.basePrice ?? 0);
      const nameSnapshot = item.name || menu?.name || 'Menu Item';
      const modifiersList = Array.isArray(item.modifiers)
        ? item.modifiers.map((mod) => {
            if (typeof mod === 'string') return mod;
            const label = mod?.option || mod?.label || '';
            const key = mod?.name || mod?.variant || 'Option';
            const priceAdj = mod?.priceAdjustment
              ? ` (${mod.priceAdjustment > 0 ? '+' : ''}${mod.priceAdjustment})`
              : '';
            return `${key}: ${label}${priceAdj}`.trim();
          })
        : [];

      return {
        menuItem: item.menuItem,
        name: nameSnapshot,
        price: priceSnapshot,
        quantity: item.quantity || 1,
        modifiers: modifiersList,
      };
    });

    // Generate unique token for this customer-table combination
    const newCustomerToken = generateSessionToken();

    const newOrder = await Order.create({
      outletId,
      items: normalizedItems,
      totalAmount,
      status: 'placed',
      tableId: tableId || null,
      tableSessionId: table?.sessionId || null,
      notes: notes || '',
      customerToken: newCustomerToken, // Store the unique token for this customer
      takenBy: req.user ? req.user._id : null, // If logged in
    });

    // If tableId is provided, update the table's currentOrderId and mark as occupied
    if (tableId && table) {
      await Table.findByIdAndUpdate(tableId, {
        currentOrderId: newOrder._id,
        isOccupied: true, // Mark table as occupied when order is placed
      });

      // Return customer token to client
      return res.status(201).json({
        success: true,
        data: newOrder,
        customerToken: newCustomerToken,
        message: 'Order placed successfully',
      });
    }

    res.status(201).json({
      success: true,
      data: newOrder,
      customerToken: newCustomerToken,
      message: 'Order placed successfully',
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get orders for an outlet
// @route   GET /api/manager/orders/:outletId
// @access  Private (Manager)
export const getOutletOrders = async (req, res) => {
  try {
    const { outletId } = req.params;
    // Filter by status if needed (e.g. ?status=active)
    const { status } = req.query;

    let query = { outletId };
    if (status === 'active') {
      query.status = {
        $in: ['placed', 'cooking', 'ready', 'out_for_delivery'],
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'name') // Populate item names if needed, though we stored snapshot
      .populate('tableId', 'label'); // Populate table info

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get orders for a specific table
// @route   GET /api/waiter/table/:tableId/orders OR GET /api/public/orders/table/:tableId?customerToken=xxx
// @access  Private (Waiter) or Public (with customerToken)
export const getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { customerToken } = req.query;

    // Get current table session
    const table = await Table.findById(tableId);
    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: 'Table not found' });
    }

    const query = { tableId, tableSessionId: table.sessionId };
    // If customerToken is provided, filter by it (for returning customers)
    if (customerToken) {
      query.customerToken = customerToken;
    }
    // Otherwise return all orders for current table session (new customers see all current session orders)

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'name');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get Table Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update order status
// @route   PUT /api/manager/orders/:id/status
// @access  Private (Manager)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    order.status = status;

    // Don't automatically release table when order is delivered/cancelled
    // Waiter must manually release table after customer leaves and billing is complete

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
