import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String, // Can be changed to ObjectId ref 'Category' if a Category model is added later
    required: true
  },
  pieces: {
    type: Number,
    default: null
  },
  tags: {
    type: [String],
    index: true
  },
  isVeg: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
