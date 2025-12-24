import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: String, // Snapshot of name at time of order
  price: Number, // Snapshot of price at time of order
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  modifiers: [String] // e.g., "No Onion", "Extra Spicy"
});

const orderSchema = new mongoose.Schema({
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['placed', 'cooking', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
    required: true
  },
  // Accountability Tracking
  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Waiter or Cashier
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Kitchen Staff
  },
  deliveredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Rider
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
