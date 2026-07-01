const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 },
  googleId: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  phone: { type: String },
  addresses: [{
    label: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  refreshToken: { type: String },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
