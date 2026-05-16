// ─── VeloPath Şablon Kütüphanesi ───────────────────────────────────────────
// Kullanıcılar buradaki şablonlardan birini seçerek projelerini hızla başlatabilir.
// Kategori sistemi ile her alandaki projeye uygun şablon sunulmaktadır.

export const TEMPLATE_CATEGORIES = [
  { id: 'all',        label: 'Tümü',           icon: 'LayoutGrid' },
  { id: 'yazilim',    label: 'Yazılım & Tech', icon: 'Code2' },
  { id: 'egitim',     label: 'Eğitim',         icon: 'GraduationCap' },
  { id: 'kariyer',    label: 'Kariyer',         icon: 'Briefcase' },
  { id: 'saglik',     label: 'Sağlık & Spor',  icon: 'Heart' },
  { id: 'kisisel',    label: 'Kişisel Gelişim', icon: 'Star' },
  { id: 'is',         label: 'İş & Girişim',   icon: 'TrendingUp' },
  { id: 'yaratici',   label: 'Yaratıcı',        icon: 'Palette' },
  { id: 'ev',         label: 'Ev & Yaşam',      icon: 'Home' },
];

export const PROJECT_TEMPLATES = [
  // ── YAZILIM & TECH ────────────────────────────────────────────────────────
  {
    id: 'web',
    category: 'yazilim',
    title: 'Modern Web Projesi',
    description: 'React, Vite ve TailwindCSS ile modern bir web uygulaması kurulum şablonu.',
    emoji: '🖥️',
    icon: 'Monitor',
    tasks: [
      { id: 101, text: 'Proje mimarisini ve teknoloji seçimlerini belirle', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 102, text: 'UI bileşen kütüphanesini ekle ve tasarım sistemini oluştur', completed: false, week: 1, dependsOn: 101, priority: 'Orta' },
      { id: 103, text: 'API entegrasyonu ve State yönetimini uygula', completed: false, week: 2, dependsOn: 102, priority: 'Yüksek' },
      { id: 104, text: 'Responsive tasarım ve tarayıcı testlerini yap', completed: false, week: 2, dependsOn: 103, priority: 'Orta' },
      { id: 105, text: 'Deployment ve final kontrolleri tamamla', completed: false, week: 3, dependsOn: 104, priority: 'Yüksek' },
    ]
  },
  {
    id: 'mobile',
    category: 'yazilim',
    title: 'Mobil Uygulama',
    description: 'Android ve iOS için React Native ile hibrit mobil uygulama şablonu.',
    emoji: '📱',
    icon: 'Smartphone',
    tasks: [
      { id: 201, text: 'React Native ve Expo ortamını kur', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 202, text: 'Navigasyon yapısını (Stack/Tab) oluştur', completed: false, week: 1, dependsOn: 201, priority: 'Yüksek' },
      { id: 203, text: 'Ekran tasarımlarını kodla', completed: false, week: 2, dependsOn: 202, priority: 'Orta' },
      { id: 204, text: 'Push bildirim ve API entegrasyonunu tamamla', completed: false, week: 3, dependsOn: 203, priority: 'Orta' },
      { id: 205, text: 'App Store / Play Store hazırlığını yap', completed: false, week: 4, dependsOn: 204, priority: 'Yüksek' },
    ]
  },
  {
    id: 'fullstack',
    category: 'yazilim',
    title: 'Full-Stack SaaS',
    description: 'Frontend, Backend ve Veritabanı içeren uçtan uca SaaS şablonu.',
    emoji: '🚀',
    icon: 'Layers',
    tasks: [
      { id: 301, text: 'Veritabanı şemasını ve modelleri tasarla', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 302, text: 'JWT Auth sistemini kur', completed: false, week: 1, dependsOn: 301, priority: 'Yüksek' },
      { id: 303, text: 'Ana feature API\'larını yaz ve test et', completed: false, week: 2, dependsOn: 302, priority: 'Yüksek' },
      { id: 304, text: 'Ödeme sistemi (Stripe) entegrasyonunu yap', completed: false, week: 3, dependsOn: 303, priority: 'Orta' },
      { id: 305, text: 'Uçtan uca testler ve Beta yayını', completed: false, week: 4, dependsOn: 304, priority: 'Yüksek' },
    ]
  },

  // ── EĞİTİM ────────────────────────────────────────────────────────────────
  {
    id: 'sinav',
    category: 'egitim',
    title: 'Sınav / YKS Hazırlığı',
    description: 'Sınava sistematik ve planlı bir şekilde hazırlanmak için 4 haftalık çalışma planı.',
    emoji: '📚',
    icon: 'BookOpen',
    tasks: [
      { id: 401, text: 'Çalışma programı ve hedef puan planını oluştur', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 402, text: 'Zayıf konuları belirle ve kaynak topla', completed: false, week: 1, dependsOn: 401, priority: 'Yüksek' },
      { id: 403, text: 'Konu tekrarı ve soru çözme (1. tur)', completed: false, week: 2, dependsOn: 402, priority: 'Orta' },
      { id: 404, text: 'Deneme sınavı çöz ve analiz et', completed: false, week: 3, dependsOn: 403, priority: 'Yüksek' },
      { id: 405, text: 'Hatalı konuları tekrar et ve son denemeler', completed: false, week: 4, dependsOn: 404, priority: 'Yüksek' },
    ]
  },
  {
    id: 'tez',
    category: 'egitim',
    title: 'Tez / Ödev Yazımı',
    description: 'Akademik bir tez veya uzun ödevin planlı şekilde tamamlanması için şablon.',
    emoji: '✍️',
    icon: 'FileText',
    tasks: [
      { id: 501, text: 'Konu belirle ve danışman onayı al', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 502, text: 'Literatür taraması yap ve kaynakları topla', completed: false, week: 2, dependsOn: 501, priority: 'Yüksek' },
      { id: 503, text: 'İlk taslağı yaz (Giriş ve Yöntem)', completed: false, week: 3, dependsOn: 502, priority: 'Orta' },
      { id: 504, text: 'Bulguları yaz ve sonuçları analiz et', completed: false, week: 4, dependsOn: 503, priority: 'Yüksek' },
      { id: 505, text: 'Kaynakçayı düzenle ve son düzeltmeleri yap', completed: false, week: 5, dependsOn: 504, priority: 'Orta' },
    ]
  },
  {
    id: 'dil',
    category: 'egitim',
    title: 'Yeni Dil Öğrenme',
    description: 'Sıfırdan bir dil öğrenmek için 4 haftalık sistematik plan.',
    emoji: '🌍',
    icon: 'Globe',
    tasks: [
      { id: 601, text: 'Öğrenme kaynağını seç (Uygulama, Kurs, Kitap)', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 602, text: 'Temel kelime bilgisi (100 kelime) öğren', completed: false, week: 1, dependsOn: 601, priority: 'Orta' },
      { id: 603, text: 'Basit cümle yapılarını çalış', completed: false, week: 2, dependsOn: 602, priority: 'Orta' },
      { id: 604, text: 'Günlük 10 dakika konuşma pratiği yap', completed: false, week: 3, dependsOn: 603, priority: 'Düşük' },
      { id: 605, text: 'Seviye testi yap ve sonraki hedefi belirle', completed: false, week: 4, dependsOn: 604, priority: 'Orta' },
    ]
  },

  // ── KARİYER ───────────────────────────────────────────────────────────────
  {
    id: 'is_basvuru',
    category: 'kariyer',
    title: 'İş Başvurusu Süreci',
    description: 'Özgeçmiş hazırlama, iş bulma ve mülakat süreci için kapsamlı plan.',
    emoji: '💼',
    icon: 'Briefcase',
    tasks: [
      { id: 701, text: 'Özgeçmişi güncelle ve özelleştir', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 702, text: 'LinkedIn profilini optimize et', completed: false, week: 1, dependsOn: 701, priority: 'Orta' },
      { id: 703, text: 'Hedef şirketleri araştır ve listele', completed: false, week: 2, dependsOn: 702, priority: 'Orta' },
      { id: 704, text: 'Başvuruları gönder ve takip et', completed: false, week: 2, dependsOn: 703, priority: 'Yüksek' },
      { id: 705, text: 'Mülakat hazırlığı yap (Sık sorulan sorular)', completed: false, week: 3, dependsOn: 704, priority: 'Yüksek' },
    ]
  },
  {
    id: 'freelance',
    category: 'kariyer',
    title: 'Freelance Başlangıç',
    description: 'Serbest çalışmaya başlamak için gerekli adımları planlayan şablon.',
    emoji: '🧑‍💻',
    icon: 'Laptop',
    tasks: [
      { id: 801, text: 'Uzmanlık alanını ve hedef kitleni belirle', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 802, text: 'Portföy hazırla (en az 3 proje)', completed: false, week: 2, dependsOn: 801, priority: 'Yüksek' },
      { id: 803, text: 'Upwork, Freelancer veya Fiverr profilini oluştur', completed: false, week: 2, dependsOn: 802, priority: 'Orta' },
      { id: 804, text: 'İlk teklifi gönder ve müşteri kazan', completed: false, week: 3, dependsOn: 803, priority: 'Yüksek' },
      { id: 805, text: 'Fatura ve sözleşme süreçlerini düzenle', completed: false, week: 4, dependsOn: 804, priority: 'Orta' },
    ]
  },

  // ── SAĞLIK & SPOR ─────────────────────────────────────────────────────────
  {
    id: 'fitness',
    category: 'saglik',
    title: 'Fitness & Spor Planı',
    description: '30 günlük egzersiz rutini ve sağlıklı yaşam hedefleri için şablon.',
    emoji: '💪',
    icon: 'Dumbbell',
    tasks: [
      { id: 901, text: 'Mevcut fitness seviyeni ölç ve hedef belirle', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 902, text: 'Haftalık antrenman programını oluştur', completed: false, week: 1, dependsOn: 901, priority: 'Yüksek' },
      { id: 903, text: 'Beslenme planını düzenle', completed: false, week: 2, dependsOn: 902, priority: 'Orta' },
      { id: 904, text: 'İlk 2 hafta ölçüm ve değerlendirme yap', completed: false, week: 3, dependsOn: 903, priority: 'Orta' },
      { id: 905, text: 'Programı güncelle ve yeni hedef koy', completed: false, week: 4, dependsOn: 904, priority: 'Düşük' },
    ]
  },
  {
    id: 'zihin_saglik',
    category: 'saglik',
    title: 'Zihinsel Sağlık Rutini',
    description: 'Stres yönetimi, meditasyon ve uyku düzeni için 4 haftalık plan.',
    emoji: '🧘',
    icon: 'Brain',
    tasks: [
      { id: 1001, text: 'Günlük stres kaynaklarını listele', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 1002, text: 'Sabah meditasyon rutini başlat (10 dk)', completed: false, week: 1, dependsOn: 1001, priority: 'Orta' },
      { id: 1003, text: 'Uyku düzenini sabitle (aynı saatte yat/kalk)', completed: false, week: 2, dependsOn: 1002, priority: 'Yüksek' },
      { id: 1004, text: 'Haftada 1 dijital detoks günü uygula', completed: false, week: 3, dependsOn: 1003, priority: 'Orta' },
      { id: 1005, text: 'Aylık ruh hali değerlendirmesi yap', completed: false, week: 4, dependsOn: 1004, priority: 'Düşük' },
    ]
  },

  // ── KİŞİSEL GELİŞİM ──────────────────────────────────────────────────────
  {
    id: 'kitap',
    category: 'kisisel',
    title: 'Kitap Okuma Planı',
    description: 'Ayda 2 kitap okumak için organize bir okuma takip planı.',
    emoji: '📖',
    icon: 'BookOpen',
    tasks: [
      { id: 1101, text: 'Bu ay okunacak kitapları listele', completed: false, week: 1, dependsOn: null, priority: 'Orta' },
      { id: 1102, text: 'Günlük okuma hedefi belirle (min. 20 sayfa)', completed: false, week: 1, dependsOn: 1101, priority: 'Orta' },
      { id: 1103, text: '1. Kitabı bitir ve notlarını çıkar', completed: false, week: 2, dependsOn: 1102, priority: 'Orta' },
      { id: 1104, text: '2. Kitabı bitir ve özet yaz', completed: false, week: 4, dependsOn: 1103, priority: 'Orta' },
      { id: 1105, text: 'Bir sonraki ay için okuma listesini oluştur', completed: false, week: 4, dependsOn: 1104, priority: 'Düşük' },
    ]
  },
  {
    id: 'habit',
    category: 'kisisel',
    title: '30 Günlük Alışkanlık',
    description: 'Yeni bir alışkanlık kazanmak veya kötü bir alışkanlıktan kurtulmak için plan.',
    emoji: '✅',
    icon: 'CheckSquare',
    tasks: [
      { id: 1201, text: 'Değiştirmek istediğin alışkanlığı net tanımla', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 1202, text: 'Tetikleyicileri ve engelleri listele', completed: false, week: 1, dependsOn: 1201, priority: 'Yüksek' },
      { id: 1203, text: 'İlk 10 günü tamamla ve günlük kaydet', completed: false, week: 2, dependsOn: 1202, priority: 'Orta' },
      { id: 1204, text: '20. günü tamamla ve motivasyon değerlendir', completed: false, week: 3, dependsOn: 1203, priority: 'Orta' },
      { id: 1205, text: '30. gün - Başarıyı kutla ve alışkanlığı sürdür', completed: false, week: 4, dependsOn: 1204, priority: 'Düşük' },
    ]
  },

  // ── İŞ & GİRİŞİM ─────────────────────────────────────────────────────────
  {
    id: 'girisim',
    category: 'is',
    title: 'Girişim / Startup',
    description: 'Bir fikri gerçeğe dönüştürmek için temel iş kurma adımları.',
    emoji: '🏆',
    icon: 'Rocket',
    tasks: [
      { id: 1301, text: 'Fikri doğrula ve pazar araştırması yap', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 1302, text: 'İş modeli ve gelir stratejisini belirle', completed: false, week: 2, dependsOn: 1301, priority: 'Yüksek' },
      { id: 1303, text: 'MVP (Minimum Uygulanabilir Ürün) geliştir', completed: false, week: 3, dependsOn: 1302, priority: 'Yüksek' },
      { id: 1304, text: 'İlk 10 müşteriye ulaş ve geri bildirim al', completed: false, week: 4, dependsOn: 1303, priority: 'Yüksek' },
      { id: 1305, text: 'Ürünü geri bildirimlere göre iyileştir', completed: false, week: 5, dependsOn: 1304, priority: 'Orta' },
    ]
  },
  {
    id: 'pazarlama',
    category: 'is',
    title: 'Pazarlama Kampanyası',
    description: 'Bir ürün veya hizmet için sosyal medya ve dijital pazarlama planı.',
    emoji: '📣',
    icon: 'Megaphone',
    tasks: [
      { id: 1401, text: 'Hedef kitle analizini ve persona oluştur', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 1402, text: 'Rakip analizi ve konumlandırma stratejisi belirle', completed: false, week: 1, dependsOn: 1401, priority: 'Orta' },
      { id: 1403, text: 'İçerik takvimini oluştur ve görselleri hazırla', completed: false, week: 2, dependsOn: 1402, priority: 'Orta' },
      { id: 1404, text: 'Kampanyayı yayına al ve metrikleri takip et', completed: false, week: 3, dependsOn: 1403, priority: 'Yüksek' },
      { id: 1405, text: 'Sonuçları analiz et ve optimizasyon yap', completed: false, week: 4, dependsOn: 1404, priority: 'Orta' },
    ]
  },

  // ── YARATICI ──────────────────────────────────────────────────────────────
  {
    id: 'youtube',
    category: 'yaratici',
    title: 'YouTube Kanalı Kur',
    description: 'YouTube kanalı açmak ve ilk 10 videoyu yayınlamak için plan.',
    emoji: '🎬',
    icon: 'Youtube',
    tasks: [
      { id: 1501, text: 'Kanal konsepti ve niş alanı belirle', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 1502, text: 'Kanal sayfasını ve logo/banner\'ı hazırla', completed: false, week: 1, dependsOn: 1501, priority: 'Orta' },
      { id: 1503, text: 'İlk 3 videoyu çek ve düzenle', completed: false, week: 2, dependsOn: 1502, priority: 'Yüksek' },
      { id: 1504, text: 'SEO optimizasyonu yap ve videoları yayınla', completed: false, week: 3, dependsOn: 1503, priority: 'Orta' },
      { id: 1505, text: 'Topluluk oluştur ve yorum etkileşimi sağla', completed: false, week: 4, dependsOn: 1504, priority: 'Düşük' },
    ]
  },
  {
    id: 'muzik',
    category: 'yaratici',
    title: 'Müzik Albüm / EP',
    description: 'Bir albüm veya EP kaydı yapmak için stüdyo süreç planı.',
    emoji: '🎵',
    icon: 'Music',
    tasks: [
      { id: 1601, text: 'Şarkı listesini ve konsepti belirle', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 1602, text: 'Besteleri tamamla ve sözleri yaz', completed: false, week: 2, dependsOn: 1601, priority: 'Yüksek' },
      { id: 1603, text: 'Stüdyo kaydını gerçekleştir', completed: false, week: 3, dependsOn: 1602, priority: 'Yüksek' },
      { id: 1604, text: 'Miksleme ve mastering sürecini tamamla', completed: false, week: 4, dependsOn: 1603, priority: 'Orta' },
      { id: 1605, text: 'Spotify/Apple Music\'e yükle ve tanıtımını yap', completed: false, week: 5, dependsOn: 1604, priority: 'Orta' },
    ]
  },

  // ── EV & YAŞAM ────────────────────────────────────────────────────────────
  {
    id: 'tasinak',
    category: 'ev',
    title: 'Taşınma Planı',
    description: 'Yeni bir eve taşınma sürecini stressiz yönetmek için organize şablon.',
    emoji: '🏠',
    icon: 'Home',
    tasks: [
      { id: 1701, text: 'Eşyaları sırala ve gereksizleri bağışla/sat', completed: false, week: 1, dependsOn: null, priority: 'Orta' },
      { id: 1702, text: 'Nakliye firması al veya araç tut', completed: false, week: 1, dependsOn: 1701, priority: 'Yüksek' },
      { id: 1703, text: 'Koli ve ambalaj malzemeleri temin et', completed: false, week: 2, dependsOn: 1702, priority: 'Orta' },
      { id: 1704, text: 'Adres değişikliği bildirimlerini yap', completed: false, week: 2, dependsOn: 1703, priority: 'Orta' },
      { id: 1705, text: 'Taşınmayı tamamla ve yeni evi düzenle', completed: false, week: 3, dependsOn: 1704, priority: 'Yüksek' },
    ]
  },
  {
    id: 'dugun',
    category: 'ev',
    title: 'Düğün Organizasyonu',
    description: 'Düğün planlaması için önemli adımları organize eden kapsamlı şablon.',
    emoji: '💍',
    icon: 'Heart',
    tasks: [
      { id: 1801, text: 'Bütçeyi belirle ve davetli listesini oluştur', completed: false, week: 1, dependsOn: null, priority: 'Yüksek' },
      { id: 1802, text: 'Mekan, catering ve fotoğrafçı rezervasyonu yap', completed: false, week: 2, dependsOn: 1801, priority: 'Yüksek' },
      { id: 1803, text: 'Davetiyeler tasarla ve gönder', completed: false, week: 3, dependsOn: 1802, priority: 'Orta' },
      { id: 1804, text: 'Kıyafet, çiçek ve dekorasyon ayarlarını tamamla', completed: false, week: 4, dependsOn: 1803, priority: 'Orta' },
      { id: 1805, text: 'Son detay kontrollerini yap ve günü karşıla', completed: false, week: 5, dependsOn: 1804, priority: 'Yüksek' },
    ]
  },
];
