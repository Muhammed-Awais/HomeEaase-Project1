const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;

// @desc    Create new property
// @route   POST /api/properties
// @access  Private/Landlord
exports.createProperty = async (req, res, next) => {
  console.log('Create Property Request Received');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Files:', req.files);

  try {
    const { title, description, price, location, city, bedrooms, bathrooms, amenities, sizeValue, sizeUnit, currency } = req.body;
    
    // images will be an array of objects from multer-storage-cloudinary
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    if (imageUrls.length === 0) {
      console.log('Error: No images found in request');
      return res.status(400).json({ success: false, message: 'Please add at least one image' });
    }

    const property = await Property.create({
      title,
      description,
      price: Number(price),
      location,
      city,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms) || 1,
      sizeValue: Number(sizeValue),
      sizeUnit,
      amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
      images: imageUrls,
      currency: currency || 'PKR',
      landlord: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });

    // ── Notify all renters in the same city (async, non-blocking) ──
    setImmediate(async () => {
      try {
        const cityRegex = new RegExp(`^${property.city.trim()}$`, 'i');
        const renters = await User.find({
          role: 'renter',
          city: cityRegex,
          isVerified: true,
        }).select('_id').lean();

        if (renters.length > 0) {
          const notifications = renters.map((renter) => ({
            userId: renter._id,
            title: `New Property in ${property.city} 🏠`,
            body: `A new ${property.type || 'property'} "${property.title}" has just been listed in ${property.city} for PKR ${property.price.toLocaleString()}/mo.`,
            type: 'property',
            propertyId: property._id,
            read: false,
          }));

          await Notification.insertMany(notifications);
          console.log(`[Notify] Created ${notifications.length} notifications for renters in ${property.city}`);
        } else {
          console.log(`[Notify] No renters found in city: ${property.city}`);
        }
      } catch (notifyErr) {
        console.error('[Notify Error]', notifyErr.message);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const { search, bedrooms, minPrice, maxPrice, amenities } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    if (bedrooms && bedrooms !== 'Any') {
      if (bedrooms === '4+') {
        query.bedrooms = { $gte: 4 };
      } else {
        query.bedrooms = Number(bedrooms);
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my properties
// @route   GET /api/properties/my
// @access  Private/Landlord
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ landlord: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate({
      path: 'landlord',
      select: 'name email contactNo',
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res, next) => {
  try {
    let properties = await Property.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(5);
    
    // If no featured properties, return the most recent ones as a fallback
    if (properties.length === 0) {
      properties = await Property.find().sort({ createdAt: -1 }).limit(5);
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private/Landlord
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner
    if (property.landlord.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    const { title, description, price, location, city, bedrooms, bathrooms, amenities, sizeValue, sizeUnit, currency } = req.body;
    
    const updateData = {
      title,
      description,
      price: price ? Number(price) : property.price,
      location,
      city: city || property.city,
      bedrooms: bedrooms || property.bedrooms,
      bathrooms: bathrooms ? Number(bathrooms) : property.bathrooms,
      sizeValue: sizeValue ? Number(sizeValue) : property.sizeValue,
      sizeUnit: sizeUnit || property.sizeUnit,
      amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || property.amenities),
      currency: currency || property.currency,
    };

    // If new photos are uploaded, replace them
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private/Landlord
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner
    if (property.landlord.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this property' });
    }

    // Optional: Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      for (const imageUrl of property.images) {
        try {
          const parts = imageUrl.split('/');
          const filename = parts[parts.length - 1].split('.')[0];
          const folder = 'homease_properties';
          const publicId = `${folder}/${filename}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Cloudinary delete failed:', err);
        }
      }
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
