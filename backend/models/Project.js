const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  status: { type: String, default: 'active', enum: ['active', 'archived'] },
  notes: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Future relation
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
