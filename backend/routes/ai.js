const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Yapay zeka ile görev önerileri alma (Mock)
router.post('/suggest/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Proje bulunamadı.' });

    // AI simülasyonu için 1.5 saniye bekleme süresi
    await new Promise(resolve => setTimeout(resolve, 1500));

    const title = project.title.toLowerCase();
    const desc = project.description.toLowerCase();
    const combined = title + " " + desc;
    let suggestions = [];

    // Basit bir kelime analizi ile akıllı öneriler
    if (combined.includes('web') || combined.includes('uygulama') || combined.includes('yazılım') || combined.includes('app')) {
      suggestions = [
        'Veritabanı şemasını oluştur ve yapılandır',
        'Figma üzerinden kullanıcı arayüzü (UI) tasarımlarını tamamla',
        'RESTful API endpointlerini tasarla',
        'Birim (Unit) testlerini yaz ve projeyi test et'
      ];
    } else if (combined.includes('pazarlama') || combined.includes('seo') || combined.includes('sosyal medya')) {
      suggestions = [
        'Rakip analizi ve pazar araştırması yap',
        'Haftalık sosyal medya içerik planını oluştur',
        'Hedef kitle persona analizini tamamla',
        'Reklam bütçesi ve kampanyaları planla'
      ];
    } else if (combined.includes('okul') || combined.includes('ödev') || combined.includes('tez') || combined.includes('ders')) {
      suggestions = [
        'Literatür taraması yap ve kaynakları topla',
        'İlk taslak metnini oluştur',
        'Giriş ve sonuç bölümlerini yaz',
        'Referansları ve kaynakçayı düzenle'
      ];
    } else {
      suggestions = [
        'Projenin temel gereksinimlerini listele',
        'Gerekli materyalleri/araçları araştır',
        'İlk aşama için bir zaman çizelgesi belirle',
        'Proje ilerlemesini değerlendirmek için toplantı yap'
      ];
    }

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
