const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        role: user.role,
        avatar: user.avatar,
        favorites: user.favorites,
        city: user.city || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, contactNo, city } = req.body;

    // We do not update passwords via this route
    const userFields = {
      name,
      contactNo,
      ...(city !== undefined ? { city } : {}),
    };

    if (req.file) {
      userFields.avatar = req.file.path; // Cloudinary returns the URL in req.file.path
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      userFields,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        contactNo: updatedUser.contactNo,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        city: updatedUser.city || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user account and associated properties
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cascade delete: Remove properties associated with the user
    // Assumes property model uses 'landlord' as the ref to User
    await Property.deleteMany({ landlord: req.user.id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account and associated properties deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle a property inside favorites
// @route   POST /api/users/favorites/:propertyId
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const propertyId = req.params.propertyId;
    
    // Ensure property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Toggle logic
    let action = '';
    if (user.favorites.includes(propertyId)) {
      user.favorites.pull(propertyId);
      action = 'removed';
    } else {
      user.favorites.push(propertyId);
      action = 'added';
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        favorites: user.favorites,
        action,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get populated favorite properties
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Strip any nulls if property documents were deleted
    const validFavorites = user.favorites.filter(prop => prop !== null);

    // Only save back if there were dangling properties that got scrubbed
    if (validFavorites.length !== user.favorites.length) {
       user.favorites = validFavorites.map(p => p._id);
       await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      count: validFavorites.length,
      data: validFavorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
