const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  status: { type: String, default: 'Devam Ediyor', enum: ['Başlangıç', 'Devam Ediyor', 'Beklemede', 'Tamamlandı', 'active', 'archived'] },
  archived: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
