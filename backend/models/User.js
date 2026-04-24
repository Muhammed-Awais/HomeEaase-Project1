const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  contactNo: {
    type: String,
    required: [
      function() { return this.isNew; },
      'Please add a contact number'
    ],
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  }],
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['renter', 'landlord'],
    default: 'renter',
  },
  city: {
    type: String,
    trim: true,
    default: '',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and store verification token
UserSchema.methods.generateVerificationToken = function () {
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.verificationToken = otp;
  // Set expiry to 10 minutes
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return otp;
};

module.exports = mongoose.model('User', UserSchema);
