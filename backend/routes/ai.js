const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Cok fazla AI istegi gonderdiniz. Lutfen 1 dakika bekleyip tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiLimiter);

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Helper: 429 hata kontrolu
const is429 = (err) =>
  err.status === 429 ||
  err?.message?.includes('429') ||
  err?.message?.toLowerCase().includes('quota');

// Helper: proje sahipligi veya paylasim kontrolu
const canAccessProject = (project, userId) => {
  const uid = userId.toString();
  const isOwner = project.user?.toString() === uid;
  const isShared = project.sharedWith?.some(id => id.toString() === uid);
  return isOwner || isShared;
};

// 1. Proje Gorev Onerileri
router.post('/suggest/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Proje bulunamadi.' });

    if (!canAccessProject(project, req.user.userId)) {
      return res.status(403).json({ error: 'Bu projeye erisim yetkiniz yok.' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'GEMINI_API_KEY tanimli degil.' });
    }

    // Mevcut gorevleri cek — tekrar oneri yapilmasin
    const existingTasks = await Task.find({ projectId: project._id }).lean();
    const existingList = existingTasks.length > 0
      ? 'Projede zaten su gorevler var (bunlari tekrar onerme): ' + existingTasks.map(t => t.title).join(', ') + '.'
      : 'Projede henuz hic gorev yok.';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Projem: "${project.title}". Aciklama: "${project.description || 'Belirtilmemis'}". ${existingList}
Lutfen bu proje icin yeni, eyleme gecilebilir, birbirini tekrar etmeyen 4 adet gorev onerisi yap. Sadece gorev isimlerini virgülle ayrilmis duz metin olarak ver. Baska aciklama, madde isareti veya numara kullanma. Ornek: Tasarimi yap, Veritabanini kur, Testleri yaz, Canliya al`;

    const result = await model.generateContent(prompt);
    const suggestions = result.response.text()
      .split(',')
      .map(s => s.trim().replace(/^[\-\d\.\*\n]+\s*/, ''))
      .filter(s => s.length > 2)
      .slice(0, 6); // max 6 oneri

    res.json({ suggestions });
  } catch (err) {
    if (is429(err)) return res.status(429).json({ error: 'Gemini AI kotasi doldu. Lutfen 1 dakika bekleyip tekrar deneyin.' });
    res.status(500).json({ error: err.message });
  }
});

// 2. Alt Gorev Parcalayici
router.post('/subtasks', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'GEMINI_API_KEY tanimli degil.' });
    const { taskTitle } = req.body;
    if (!taskTitle) return res.status(400).json({ error: 'Gorev adi gerekli.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Su gorevi adim adim 3-4 kucuk, eyleme gecilebilir alt goreve (subtask) bol: "${taskTitle}". Sadece alt gorevleri virgülle ayrilmis duz metin olarak ver. Sayi veya madde imi kullanma. Ornek: AWS hesabi ac, Veritabani cluster olustur, Ilk testleri yap`;

    const result = await model.generateContent(prompt);
    const subtasks = result.response.text()
      .split(',')
      .map(s => s.trim().replace(/^[\-\d\.\*\n]+\s*/, ''))
      .filter(s => s.length > 2)
      .slice(0, 6);

    res.json({ subtasks });
  } catch (err) {
    if (is429(err)) return res.status(429).json({ error: 'Gemini AI kotasi doldu. Lutfen 1 dakika bekleyip tekrar deneyin.' });
    res.status(500).json({ error: err.message });
  }
});

// 3. Not Ozetleyici
router.post('/summarize', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'GEMINI_API_KEY tanimli degil.' });
    const { text } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'Ozetlenecek metin bulunamadi.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Asagidaki proje notlarini profesyonelce Turkce olarak kisa, oz ve yapilandirilmis (markdown) bir formatta ozetle. Onemli kararlari vurgula:\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text().trim() });
  } catch (err) {
    if (is429(err)) return res.status(429).json({ error: 'Gemini AI kotasi doldu. Lutfen 1 dakika bekleyip tekrar deneyin.' });
    res.status(500).json({ error: err.message });
  }
});

// 4. Istatistik Analizi (AI Coach)
router.post('/analyze-stats', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'GEMINI_API_KEY tanimli degil.' });

    const { totalCompleted, totalPending, productivity, streak, bestDay } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Asagidaki kullanici verimlilik istatistiklerini profesyonel bir verimlilik kocu gibi analiz et. Kullaniciya motivasyon verici, yapici ve Turkce dilinde kisa (en fazla 4-5 cumle) bir haftalik performans ozeti ve tavsiye yaz. Onemli kelimeleri kalin (bold) yapabilirsin.

Kullanici Verileri:
- Tamamlanan Gorev: ${totalCompleted} adet
- Bekleyen Gorev: ${totalPending} adet
- Verimlilik Orani: %${productivity}
- En Uzun Calisma Serisi: ${streak} gun ust uste gorev tamamlama
- En Verimli Gun: ${bestDay}

Ozel Talimat:
Eger tamamlanan gorev (totalCompleted) 0 ise, analiz cumlesine mutlaka "Bu haftaki verilerinize baktığımızda, henüz bir başlangıç yapma fırsatınızın olmadığını görüyoruz." diyerek basla ve geri kalan cumleleri buna gore motive edici sekilde tamamla.

Dogrudan analiz yazisini ver. Baslik veya giris/cikis ifadeleri kullanma.`;

    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text().trim() });
  } catch (err) {
    if (is429(err)) return res.status(429).json({ error: 'Gemini AI kotasi doldu. Lutfen 1 dakika bekleyip tekrar deneyin.' });
    res.status(500).json({ error: err.message });
  }
});

// 5. Haftalik Plan Olusturucu
router.post('/weekly-plan', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'GEMINI_API_KEY tanimli degil.' });
    const { tasks } = req.body;
    if (!tasks || tasks.length === 0) return res.status(400).json({ error: 'Gorev listesi bos.' });

    const taskList = tasks.map(t => {
      const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemis';
      const pri = t.priority === 'high' ? 'Yuksek' : t.priority === 'low' ? 'Dusuk' : 'Orta';
      const status = t.completed ? 'Tamamlandi' : 'Bekliyor';
      return `- "${t.title}" | Oncelik: ${pri} | Durum: ${status} | Bitis: ${due} | Proje: ${t.projectTitle || '-'}`;
    }).join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Asagida bir kullanicinin tum bekleyen gorevleri var. Bu hafta hangi 5 goreve oncelikli odaklanmasi gerektigini belirle. Bitis tarihi yakin, onceligi yuksek ve birbirine bagli gorevleri one cikar. Yaniti su formatta ver: her oneri icin tek satirda gorev adi, kisaca neden bu hafta yapilmali. Markdown kullanabilirsin. Turkce yaz.\n\nGorev Listesi:\n${taskList}`;

    const result = await model.generateContent(prompt);
    res.json({ plan: result.response.text().trim() });
  } catch (err) {
    if (is429(err)) return res.status(429).json({ error: 'Gemini AI kotasi doldu. Lutfen 1 dakika bekleyip tekrar deneyin.' });
    res.status(500).json({ error: err.message });
  }
});

// 6. Akilli Gorev Onceligi (Proje bazinda)
router.post('/prioritize/:projectId', auth, async (req, res) => {
  try {
    if (!genAI) return res.status(500).json({ error: 'GEMINI_API_KEY tanimli degil.' });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Proje bulunamadi.' });

    const requesterId = req.user.userId.toString();
    const isOwner = project.user?.toString() === requesterId;
    const isShared = project.sharedWith?.some(id => id.toString() === requesterId);
    if (!isOwner && !isShared) return res.status(403).json({ error: 'Bu projeye erisim yetkiniz yok.' });

    const Task = require('../models/Task');
    const tasks = await Task.find({ projectId: project._id, status: { $ne: 'done' } }).lean();
    if (tasks.length === 0) return res.status(400).json({ error: 'Bekleyen gorev yok.' });

    const taskList = tasks.map((t, i) => {
      const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemis';
      const pri = t.priority === 'high' ? 'Yuksek' : t.priority === 'low' ? 'Dusuk' : 'Orta';
      return `${i + 1}. "${t.title}" | Oncelik: ${pri} | Bitis: ${due}`;
    }).join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `"${project.title}" projesinin asagidaki bekleyen gorevlerini analiz et ve yapilmasi gereken siraya gore sirala. Bitis tarihi, oncelik ve mantiksal bagimliligi dikkate al. Yaniti sadece sirali gorev isimlerini virgülle ayrilmis duz metin olarak ver. Ornek: Gorev A, Gorev B, Gorev C\n\nGorevler:\n${taskList}`;

    const result = await model.generateContent(prompt);
    const ordered = result.response.text()
      .split(',')
      .map(s => s.trim().replace(/^[\d.\-*]+\s*/, ''))
      .filter(s => s.length > 1);

    res.json({ orderedTitles: ordered });
  } catch (err) {
    if (is429(err)) return res.status(429).json({ error: 'Gemini AI kotasi doldu. Lutfen 1 dakika bekleyip tekrar deneyin.' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
