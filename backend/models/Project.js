const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  color:       { type: String, default: '#6366f1' },
  status:      { type: String, default: 'Devam Ediyor', enum: ['Başlangıç', 'Devam Ediyor', 'Beklemede', 'Tamamlandı', 'active', 'archived'] },
  // BUG FIX: priority ve deadline alanları Dashboard kartlarında gösteriliyordu ama modelde yoktu
  priority:    { type: String, default: 'Orta', enum: ['Düşük', 'Orta', 'Yüksek'] },
  deadline:    { type: String, default: '' },
  archived:    { type: Boolean, default: false },
  notes:       { type: String, default: '' },
  progress:    { type: Number, default: 0 },
  category:    { type: String, default: 'diger' }, // Şablon kategorisi (yazilim, egitim, kariyer, saglik, vb.)
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

projectSchema.index({ user: 1 });
projectSchema.index({ sharedWith: 1 });

module.exports = mongoose.model('Project', projectSchema);
