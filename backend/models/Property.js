const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  sizeValue: {
    type: Number,
    required: [true, 'Please add property size'],
  },
  sizeUnit: {
    type: String,
    required: [true, 'Please select a unit'],
    enum: ['marla', 'kanal', 'sqft'],
    default: 'marla',
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please add the number of bedrooms'],
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please add the number of bathrooms'],
    default: 1,
  },
  type: {
    type: String,
    enum: ['flat', 'apartment', 'house', 'room', 'portion', 'studio', 'plot', 'shop', 'office'],
    default: 'house'
  },
  purpose: {
    type: String,
    enum: ['rent', 'buy', 'sale'],
    default: 'buy'
  },
  furnishing: {
    type: String,
    enum: ['furnished', 'semi-furnished', 'unfurnished'],
    default: 'unfurnished'
  },
  floor: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  amenities: {
    type: [String],
    default: [],
  },
  city: {
    type: String,
    required: [true, 'Please clarify the city'],
    trim: true,
  },
  currency: {
    type: String,
    default: 'PKR',
  },
  images: {
    type: [String],
    required: [true, 'Please add at least one image'],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  landlord: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Property', PropertySchema);
