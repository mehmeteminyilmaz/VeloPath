<div align="center">

# VeloPath ✨
**Yazılımdan sağlığa, eğitimden girişime — hayatınızın her alanındaki hedeflerini planlayan, takip eden ve AI ile destekleyen kişisel verimlilik asistanı.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Lisans](https://img.shields.io/badge/Lisans-Eğitim-f59e0b?style=flat-square)](https://github.com/mehmeteminyilmaz/VeloPath)

</div>

---

## 🎯 VeloPath Nedir?

VeloPath, sadece bir "yapılacaklar listesi" veya "proje yönetim aracı" değildir.

**Fitness planından düğün organizasyonuna, YKS hazırlığından startup kurulumuna, müzik albümü üretiminden dil öğrenimine** — hayatın her alanındaki hedeflerinizi organize etmenize, planlı bir şekilde ilerlemenize ve AI destekli akıllı önerilerle daha verimli çalışmanıza yardımcı olan **Full-Stack, çok platformlu bir kişisel verimlilik asistanıdır.**

> *"VeloPath ile sadece projeni değil, hayatını yönet."*

### 🌟 Ne İşe Yarar?

- **📋 Planla:** 9 farklı kategoride 17+ hazır şablondan biri ile saniyeler içinde başla
- **✅ Takip Et:** Haftalık görev planı, ilerleme barları ve istatistiklerle her adımı izle
- **🤖 AI ile Güçlen:** Gemini AI görev öneriyor, büyük görevleri alt parçalara bölüyor, notlarını özetliyor
- **⏱️ Odaklan:** Entegre Pomodoro zamanlayıcısı ile verimli çalışma seansları oluştur
- **🔄 Senkronize Ol:** Web ve Mobil arasında Socket.io ile gerçek zamanlı anlık senkronizasyon
- **🤝 İş Birliği Yap:** Projelerini diğer kullanıcılarla paylaş ve birlikte çalış

---

## 📱 Çoklu Platform Desteği

VeloPath; **Web (React.js)** ve **Mobil (React Native / Expo)** olmak üzere iki platformda tam özellik paritiyle çalışır. Telefonda başladığın projeyi bilgisayarda kaldığın yerden devam ettirir.

---

## 🏗️ Mimari Genel Bakış

```
VeloPath/
├── web/          → React 18 Web Uygulaması (Glassmorphism, Dark/Light)
├── mobile/       → React Native + Expo Mobil Uygulaması (iOS & Android)
└── backend/      → Node.js + Express REST API + Socket.io + MongoDB
```

---

## ✨ Özellik Listesi

<details>
<summary><strong>🤖 Yapay Zeka (AI) Özellikleri — Google Gemini</strong></summary>

| Özellik | Açıklama |
|---|---|
| **🪄 Akıllı Görev Önerisi** | Projenin adı ve açıklamasına göre Gemini AI, bağlamsal ve eyleme geçirilebilir görevler önerir |
| **✂️ Alt Görev Parçalayıcı** | Karmaşık bir görevi tıkla, AI otomatik olarak küçük adımlara böler |
| **📝 Not Özetleyici** | Uzun toplantı notlarını veya proje kararlarını AI tek tıkla profesyonel şekilde özetler |

</details>

<details>
<summary><strong>🗂️ Proje & Kategori Yönetimi</strong></summary>

| Özellik | Açıklama |
|---|---|
| **9 Kategori Sistemi** | Yazılım, Eğitim, Kariyer, Sağlık, Kişisel, İş, Yaratıcı, Ev/Yaşam ve daha fazlası |
| **17+ Hazır Şablon** | Her kategoride görev önizlemeli başlangıç şablonları |
| **Kanban & Grid Görünümü** | İlerlemeye göre otomatik sütun sınıflandırması |
| **Proje Renk Kodlama** | Her projeye özel renk ve görsel şerit |
| **Arşivleme** | Projeleri arşivle, istediğinde geri getir |
| **Proje Paylaşımı** | Diğer kullanıcıları projenize davet et, birlikte çalış |
| **Gerçek Zamanlı Senkronizasyon** | Socket.io ile Web ↔ Mobil anlık eşzamanlılık |
| **CSV Dışa Aktarma** | Proje görevlerini Excel/CSV formatında indir |
| **Proje Notları (Markdown)** | Düzenle + önizle destekli zengin metin not defteri |

</details>

<details>
<summary><strong>✅ Görev Yönetimi</strong></summary>

| Özellik | Açıklama |
|---|---|
| **Sürükle-Bırak** | `@dnd-kit` ile haftalar arası pürüzsüz görev taşıma |
| **Haftalık Planlama** | Görevleri haftalara dağıt, dairesel grafiklerle takip et |
| **Görev Öncelikleri** | 🔴 Yüksek / 🟡 Orta / 🟢 Düşük öncelik seviyeleri |
| **Alt Görevler (Subtasks)** | Alt görev listesi + ilerleme barı + mini gösterim |
| **Görev Etiketleri** | Serbest etiket + 10 hızlı öneri + renkli chip'ler |
| **Bağımlılık Kilitleri** | Önce tamamlanması gereken görevi belirle |
| **Aktivite Geçmişi** | Her görevin oluşturulma, tamamlanma, taşınma zaman çizelgesi |
| **Markdown Notlar** | Görev bazında zengin metin notu; düzenle + önizle |
| **Geri Alma (Undo)** | 5 saniyelik toast ile silme geri alma |

</details>

<details>
<summary><strong>⏱️ Verimlilik Araçları</strong></summary>

| Özellik | Açıklama |
|---|---|
| **Pomodoro Zamanlayıcısı** | Özelleştirilebilir çalışma/mola süreleri, oturum sayısı kalıcı olarak kaydedilir |
| **İstatistik & Analitik** | 7 günlük aktivite grafikleri, çalışma serileri (streaks) ve en verimli gün analizi |
| **Verimlilik Skoru** | Haftalık görev tamamlama oranına dayalı puan sistemi |

</details>

<details>
<summary><strong>🔐 Güvenlik & Kimlik Yönetimi</strong></summary>

| Özellik | Açıklama |
|---|---|
| **JWT Kimlik Doğrulama** | Güvenli token tabanlı oturum yönetimi |
| **Bcrypt Şifreleme** | Kullanıcı şifreleri güvenli şekilde hash'lenerek saklanır |
| **Şifre Güncelleme** | Hesap ayarlarından mevcut şifre doğrulamalı güncelleme |
| **Rate Limiting** | IP başına 15 dk'da 100 istek limiti (DDoS & Brute-force koruması) |
| **CORS Kısıtlaması** | Production ortamına uygun API erişim politikası |
| **Çevrimdışı (Offline) Mod** | İnternet bağlantısı kesilse bile son veriler yerel önbellekten okunur |

</details>

<details>
<summary><strong>🎨 Arayüz & Kullanıcı Deneyimi</strong></summary>

| Özellik | Açıklama |
|---|---|
| **Glassmorphism Tasarım** | Modern cam morfoloji etkisi, premium görsel kimlik |
| **Dark / Light Tema** | Kalıcı macOS tarzı tema geçişi (Web + Mobil) |
| **Onboarding Sihirbazı** | 4 adımlı interaktif kullanıcı karşılama rehberi |
| **Bildirim Sistemi** | Browser Notification API + Expo Push Notifications |
| **Gelişmiş Arama & Filtre** | Başlık/açıklama arama + öncelik ve durum filtresi |
| **Daraltılabilir Sidebar** | Çalışma alanını genişlet, odaklanmış mod |
| **Animasyonlar** | Slide-up, scale-up, fade micro-animasyonları |

</details>

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| **Web Frontend** | React 18, React Router v6, Lucide Icons, @dnd-kit, Vanilla CSS (Glassmorphism) |
| **Mobil Frontend** | React Native, Expo SDK 54, Expo Notifications, AsyncStorage |
| **Backend** | Node.js, Express.js, Socket.io, Mongoose |
| **Veritabanı** | MongoDB Atlas (Bulut) |
| **Yapay Zeka** | Google Gemini 1.5 Flash API |
| **Güvenlik** | JWT, Bcrypt.js, Helmet, express-rate-limit, CORS |

---

## 🚀 Kurulum ve Başlatma

### 1. Depoyu Klonla
```bash
git clone https://github.com/mehmeteminyilmaz/VeloPath.git
cd VeloPath
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```

`.env` dosyası oluştur ve şu değerleri ekle:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=gizli_anahtarin
PORT=5000
GEMINI_API_KEY=google_gemini_api_anahtarin    # AI özellikleri için
CLIENT_URL=http://localhost:3000               # CORS için
```

```bash
npm run dev
```

### 3. Web Uygulaması Kurulumu
```bash
cd ../web
npm install
npm start
```

### 4. Mobil Uygulama Kurulumu
```bash
cd ../mobile
npm install
npx expo start
```

### 5. Demo Verisi Yükleme (İsteğe Bağlı)
```bash
cd backend
node seed.js
```

---

## 🔐 Test Hesabı (Demo)

`seed.js` çalıştırıldıktan sonra:
- **Kullanıcı Adı:** `emin`
- **Şifre:** `velopath2026`

---

## 📡 Servis Adresleri

| Servis | Adres |
|---|---|
| Web Uygulaması | `http://localhost:3000` |
| API Sunucusu | `http://localhost:5000` |
| Socket.io | `http://localhost:5000` (otomatik) |

---

## 📁 Proje Yapısı

```
VeloPath/
├── backend/
│   ├── models/          → MongoDB Şemaları (User, Project, Task)
│   ├── routes/          → API Rotaları (users, projects, tasks, ai)
│   ├── middleware/       → JWT Auth middleware
│   └── server.js        → Ana sunucu (Express + Socket.io + Rate Limit)
│
├── web/
│   ├── src/
│   │   ├── pages/       → Dashboard, ProjectDetails, CreateProject, Stats, Login
│   │   ├── components/  → Sidebar, WeeklyPlan, TaskNoteModal, PomodoroTimer, vb.
│   │   ├── data/        → Şablon kütüphanesi (17 şablon, 9 kategori)
│   │   ├── styles/      → CSS (Glassmorphism tasarım sistemi)
│   │   └── api.js       → Backend servis katmanı
│
├── mobile/
│   ├── screens/         → Dashboard, ProjectDetails, Pomodoro, Stats, Settings, vb.
│   ├── components/      → TaskNoteModal, UndoToast
│   ├── services/        → api.js (Axios + offline önbellekleme)
│   ├── theme/           → ThemeContext (Dark/Light persistent tema)
│   └── App.js           → Navigasyon + Bildirim izinleri
│
└── docs/
    └── assets/          → README ekran görüntüleri
```

---

<div align="center">

**VeloPath** — Hayatını planla. Hedefine ulaş. 🚀

*Full-Stack · AI Destekli · Çok Platformlu · Gerçek Zamanlı*

</div>
