const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  color:       { type: String, default: '#6366f1' },
  status:      { type: String, default: 'Devam Ediyor', enum: ['Başlangıç', 'Devam Ediyor', 'Beklemede', 'Tamamlandı', 'active', 'archived'] },
  // BUG FIX: priority ve deadline alanları Dashboard kartlarında gösteriliyordu ama modelde yoktu
  priority:    { type: String, default: 'Orta', enum: ['Düşük', 'Orta', 'Yüksek'] },
  deadline: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        let d;
        if (v.includes('.')) {
          const parts = v.split('.');
          if (parts.length === 3) {
            d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        } else {
          d = new Date(v);
        }
        if (!d || isNaN(d.getTime())) return false;
        const year = d.getFullYear();
        return year >= 2020 && year <= 2100;
      },
      message: 'Teslim tarihi yılı 2020 ile 2100 arasında olmalıdır.'
    }
  },
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
