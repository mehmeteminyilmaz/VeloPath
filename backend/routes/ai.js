const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Eğer GEMINI_API_KEY env dosyasında tanımlıysa AI motorunu başlatıyoruz
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// 1. Proje Görev Önerileri (Sihirli Öneriler)
router.post('/suggest/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Proje bulunamadı.' });

    if (!genAI) {
      return res.status(500).json({ error: 'Sistemde geçerli bir GEMINI_API_KEY bulunamadı. Lütfen .env dosyanızı kontrol edin.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Benim projemin adı "${project.title}" ve açıklaması "${project.description || 'Belirtilmemiş'}". 
Lütfen bu proje için bana başlangıç seviyesinde, eyleme geçirilebilir, mantıklı 4 adet görev (task) önerisi yap. Sadece görev isimlerini virgülle ayrılmış (virgül ile) düz bir metin olarak ver. Başka hiçbir açıklama, madde işareti veya numara kullanma. Yanıt örneği: Tasarımı yap, Veritabanını kur, Testleri yaz, Canlıya al`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // AI cevabını virgüllere göre parçalayıp liste haline getir
    const suggestions = responseText.split(',').map(s => s.trim().replace(/^[\-\d\.\*]+\s*/, '')).filter(s => s.length > 0);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Alt Görev (Subtask) Parçalayıcı
router.post('/subtasks', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'Sistemde geçerli bir GEMINI_API_KEY bulunamadı.' });
    const { taskTitle } = req.body;
    if (!taskTitle) return res.status(400).json({ error: 'Görev adı gerekli.' });
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Şu görevi adım adım 3 veya 4 küçük eyleme geçirilebilir alt göreve (subtask) böl: "${taskTitle}". Sadece alt görevleri virgülle ayrılmış şekilde düz metin olarak ver. Sayı veya madde imi kullanma. Yanıt örneği: AWS hesabı aç, Veritabanı cluster'ı oluştur, İlk testleri yap`;
    
    const result = await model.generateContent(prompt);
    const subtasks = result.response.text().split(',').map(s => s.trim().replace(/^[\-\d\.\*]+\s*/, '')).filter(s => s.length > 0);
    
    res.json({ subtasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Proje Notları Özetleyici
router.post('/summarize', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'Sistemde geçerli bir GEMINI_API_KEY bulunamadı.' });
    const { text } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'Özetlenecek metin bulunamadı.' });
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Aşağıdaki proje notlarını veya toplantı kararlarını profesyonelce Türkçe olarak kısa, öz ve yapılandırılmış (markdown) bir formatta özetle. Önemli kararları vurgula:\n\n"${text}"`;
    
    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text().trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Haftalık Performans ve İstatistik Analizi (AI Coach)
router.post('/analyze-stats', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'Sistemde geçerli bir GEMINI_API_KEY bulunamadı.' });
    
    const { totalCompleted, totalPending, productivity, streak, bestDay } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Lütfen aşağıdaki kullanıcı verimlilik istatistiklerini profesyonel bir verimlilik koçu (productivity coach) gibi analiz et. Kullanıcıya motivasyon verici, yapıcı, samimi ve Türkçe dilinde kısa (en fazla 4-5 cümle) bir haftalık performans özeti ve tavsiye yazısı hazırla. Önemli kelimeleri kalın (bold) yapabilirsin. 
    
    Kullanıcı Verileri:
    - Tamamlanan Görev: ${totalCompleted} adet
    - Bekleyen Görev: ${totalPending} adet
    - Verimlilik Oranı: %${productivity}
    - En Uzun Çalışma Serisi: ${streak} gün üst üste görev tamamlama
    - En Verimli Gün: ${bestDay}
    
    Lütfen doğrudan analiz yazısını ver. Başlık veya giriş/çıkış ifadeleri (örn: "İşte analiziniz:") kullanma.`;
    
    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text().trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
