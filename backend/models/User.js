const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:           { type: String, required: true, unique: true, trim: true },
  email:              { type: String, required: false, trim: true, lowercase: true, sparse: true },
  password:           { type: String, required: true },
  refreshToken:       { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExp:   { type: Date,   default: null },
  preferences: {
    theme:            { type: String, default: 'dark' },
    sidebarCollapsed: { type: Boolean, default: false }
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
