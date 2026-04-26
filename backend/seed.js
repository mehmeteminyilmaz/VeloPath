require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Modeller ──────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: { theme: { type: String, default: 'dark' } }
}, { timestamps: true });
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const projectSchema = new mongoose.Schema({
  title: String, description: String, color: String,
  status: String, archived: Boolean, notes: String,
  user: mongoose.Schema.Types.ObjectId,
  sharedWith: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true });
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

const taskSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  title: String, status: String, priority: String,
  tags: [String], notes: String, weekIndex: Number, orderIndex: Number,
  subtasks: []
}, { timestamps: true });
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// ── Seed Verisi ────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB bağlandı...');

  // Varsa eski demo kullanıcısını temizle
  const oldUser = await User.findOne({ username: 'emin' });
  if (oldUser) {
    await Project.deleteMany({ user: oldUser._id });
    await Task.deleteMany({});
    await User.deleteOne({ _id: oldUser._id });
    console.log('Eski demo hesabı temizlendi.');
  }

  // ── Kullanıcı oluştur ──
  const user = new User({ username: 'emin', password: 'velopath2026' });
  await user.save();
  console.log('✅ Kullanıcı oluşturuldu:', user.username);

  const uid = user._id;

  // ── Projeler ve Görevler ────────────────────────────────
  const projectsData = [
    {
      project: {
        title: 'VeloPath', color: '#6366f1', status: 'Devam Ediyor', archived: false,
        description: 'React + Node.js ile geliştirilmiş SaaS proje yönetim uygulaması. Gerçek zamanlı senkronizasyon, Kanban görünümü, Pomodoro entegrasyonu ve takım çalışması özellikleriyle.',
      },
      tasks: [
        { title: 'Proje altyapısı kurulumu (React + Node.js)', status: 'done', priority: 'high', weekIndex: 1, tags: ['backend', 'frontend'] },
        { title: 'MongoDB şema tasarımı (User, Project, Task)', status: 'done', priority: 'high', weekIndex: 1, tags: ['database'] },
        { title: 'Dashboard UI tasarımı ve bileşenler', status: 'done', priority: 'high', weekIndex: 2, tags: ['ui'] },
        { title: 'Proje CRUD işlemleri (oluştur, güncelle, sil)', status: 'done', priority: 'high', weekIndex: 2, tags: ['backend'] },
        { title: 'Görev yönetimi (haftalık planlama, bağımlılık)', status: 'done', priority: 'high', weekIndex: 3, tags: ['feature'] },
        { title: 'Kanban görünümü entegrasyonu', status: 'done', priority: 'medium', weekIndex: 3, tags: ['ui', 'feature'] },
        { title: 'Pomodoro sayacı (yüzen widget)', status: 'done', priority: 'medium', weekIndex: 3, tags: ['feature'] },
        { title: 'Aydınlık / Karanlık tema sistemi', status: 'done', priority: 'low', weekIndex: 4, tags: ['ui'] },
        { title: 'Proje şablonları (Web, Mobil, Full-Stack)', status: 'done', priority: 'medium', weekIndex: 4, tags: ['feature'] },
        { title: 'Görev etiketleri ve alt görevler', status: 'done', priority: 'medium', weekIndex: 4, tags: ['feature'] },
        { title: 'Proje arşivleme ve arama/filtreleme', status: 'done', priority: 'medium', weekIndex: 5, tags: ['feature'] },
        { title: 'Socket.io ile gerçek zamanlı senkronizasyon', status: 'done', priority: 'high', weekIndex: 5, tags: ['backend', 'realtime'] },
        { title: 'Takım çalışması: Proje paylaşma özelliği', status: 'done', priority: 'high', weekIndex: 5, tags: ['collaboration'] },
        { title: 'Helmet ile güvenlik katmanı (XSS, CSRF)', status: 'done', priority: 'high', weekIndex: 5, tags: ['security'] },
        { title: 'Kullanıcı kimlik doğrulama (bcrypt şifreleme)', status: 'done', priority: 'high', weekIndex: 6, tags: ['auth', 'security'] },
        { title: 'README ve dokümantasyon güncellemesi', status: 'done', priority: 'low', weekIndex: 6, tags: ['docs'] },
        { title: 'Cloud deploy (Render / Railway)', status: 'todo', priority: 'high', weekIndex: 7, tags: ['devops'] },
        { title: 'React Native mobil uygulama başlangıcı', status: 'todo', priority: 'medium', weekIndex: 7, tags: ['mobile'] },
        { title: 'JWT tabanlı token kimlik doğrulama', status: 'todo', priority: 'high', weekIndex: 8, tags: ['auth'] },
      ]
    },
    {
      project: {
        title: 'cybersec', color: '#10b981', status: 'Tamamlandı', archived: true,
        description: 'Python ile geliştirilmiş siber güvenlik araçları monorepo. Port scanner, network sniffer, CyberPanel web arayüzü içerir.',
      },
      tasks: [
        { title: 'Python port scanner geliştirme', status: 'done', priority: 'high', weekIndex: 1, tags: ['python', 'security'] },
        { title: 'Çoklu port tarama ve sonuç raporlama', status: 'done', priority: 'medium', weekIndex: 1, tags: ['python'] },
        { title: 'Network sniffer modülü (packet capture)', status: 'done', priority: 'high', weekIndex: 2, tags: ['python', 'network'] },
        { title: 'CyberPanel web arayüzü (Flask)', status: 'done', priority: 'medium', weekIndex: 2, tags: ['web', 'python'] },
        { title: 'Modüler monorepo yapısı', status: 'done', priority: 'low', weekIndex: 3, tags: ['architecture'] },
        { title: 'Güvenlik açığı tarama modülü', status: 'done', priority: 'high', weekIndex: 3, tags: ['security'] },
        { title: 'Proje dokümantasyonu ve README', status: 'done', priority: 'low', weekIndex: 3, tags: ['docs'] },
      ]
    },
    {
      project: {
        title: 'Günce', color: '#f59e0b', status: 'Tamamlandı', archived: true,
        description: 'Dart/Flutter ile geliştirilen kişisel günlük ve hafıza asistanı. Sesli not, AI chat entegrasyonu ve şifreli depolama özelliklerine sahip.',
      },
      tasks: [
        { title: 'Flutter proje kurulumu ve navigasyon', status: 'done', priority: 'high', weekIndex: 1, tags: ['flutter', 'dart'] },
        { title: 'Günlük oluşturma / düzenleme ekranı', status: 'done', priority: 'high', weekIndex: 1, tags: ['ui'] },
        { title: 'Sesli not kayıt özelliği', status: 'done', priority: 'high', weekIndex: 2, tags: ['feature'] },
        { title: 'AI chat entegrasyonu', status: 'done', priority: 'medium', weekIndex: 2, tags: ['ai', 'feature'] },
        { title: 'Şifreli yerel depolama (Hive)', status: 'done', priority: 'high', weekIndex: 3, tags: ['security'] },
        { title: 'Arama ve filtreleme', status: 'done', priority: 'medium', weekIndex: 3, tags: ['feature'] },
      ]
    },
    {
      project: {
        title: 'TarımAsistan', color: '#ef4444', status: 'Tamamlandı', archived: true,
        description: 'Flutter ile geliştirilmiş akıllı tarım yönetim uygulaması. Firebase backend, bitki takibi, sulama takvimleri ve hava durumu entegrasyonu.',
      },
      tasks: [
        { title: 'Firebase veritabanı kurulumu ve auth', status: 'done', priority: 'high', weekIndex: 1, tags: ['firebase', 'backend'] },
        { title: 'Bitki ekle / takip et ekranı', status: 'done', priority: 'high', weekIndex: 1, tags: ['ui', 'flutter'] },
        { title: 'Sulama takvimi ve hatırlatıcı sistemi', status: 'done', priority: 'high', weekIndex: 2, tags: ['feature'] },
        { title: 'Hava durumu API entegrasyonu', status: 'done', priority: 'medium', weekIndex: 2, tags: ['api'] },
        { title: 'Fotoğrafla bitki tanıma (AI)', status: 'done', priority: 'medium', weekIndex: 3, tags: ['ai', 'feature'] },
        { title: 'Push bildirim sistemi', status: 'done', priority: 'medium', weekIndex: 3, tags: ['feature'] },
        { title: 'Google Play yayınlama hazırlığı', status: 'done', priority: 'low', weekIndex: 4, tags: ['devops'] },
      ]
    },
    {
      project: {
        title: 'CyberPanel Dashboard', color: '#8b5cf6', status: 'Tamamlandı', archived: true,
        description: 'Merkezi siber güvenlik web panosu. Modüler sidebar mimarisi, network scanner, vulnerability tarama ve profesyonel arayüz.',
      },
      tasks: [
        { title: 'Flask + modüler sidebar mimarisi', status: 'done', priority: 'high', weekIndex: 1, tags: ['python', 'web'] },
        { title: 'Port scanner arayüz entegrasyonu', status: 'done', priority: 'high', weekIndex: 1, tags: ['feature'] },
        { title: 'Network sniffer modülü entegrasyonu', status: 'done', priority: 'high', weekIndex: 2, tags: ['feature', 'network'] },
        { title: 'Vulnerability scanner modülü', status: 'done', priority: 'high', weekIndex: 2, tags: ['security'] },
        { title: 'Dark mode premium tasarım', status: 'done', priority: 'medium', weekIndex: 2, tags: ['ui'] },
        { title: 'Proje dokümantasyonu', status: 'done', priority: 'low', weekIndex: 3, tags: ['docs'] },
      ]
    }
  ];

  let totalProjects = 0;
  let totalTasks = 0;

  for (const { project: projData, tasks } of projectsData) {
    const project = new Project({ ...projData, user: uid, sharedWith: [] });
    await project.save();
    totalProjects++;

    for (let i = 0; i < tasks.length; i++) {
      const task = new Task({ ...tasks[i], projectId: project._id, orderIndex: i });
      await task.save();
      totalTasks++;
    }
    console.log(`  ✅ Proje: "${projData.title}" — ${tasks.length} görev`);
  }

  console.log('\n🎉 Seed tamamlandı!');
  console.log(`📊 ${totalProjects} proje, ${totalTasks} görev oluşturuldu.`);
  console.log('\n🔐 Giriş bilgileri:');
  console.log('   Kullanıcı: emin');
  console.log('   Şifre:     velopath2026');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed hatası:', err); process.exit(1); });
