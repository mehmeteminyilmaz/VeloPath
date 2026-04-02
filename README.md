# VeloPath 🚀

**VeloPath**, kullanıcıların projelerini haftalık bazda akıllıca planlayabileceği, görevlerini sürükle-bırak yöntemiyle yönetebileceği ve ilerlemelerini dinamik olarak takip edebileceği **profesyonel** bir proje yönetim sistemidir.

---

## ✨ Ana Özellikler

VeloPath, en iyi modern kullanıcı deneyimini (UX) sunmak için Linear ve Vercel esintili tasarım trendleriyle inşa edilmiştir:

- 📊 **Haftalık Plan Görünümü:** Her projeyi haftalara bölün ve dairesel grafiklerle ilerlemeyi takip edin.
- 🏗️ **Sürükle-Bırak (Drag & Drop):** `@dnd-kit` ile görevlerinizi haftalar arası veya içinde pürüzsüzce sıralayın.
- 🔐 **Premium Giriş Ekranı (Midnight Glow):** Kişiselleştirilmiş, cam morfoloji (glassmorphism) etkili ve aurora animasyonlu modern giriş deneyimi.
- ↔️ **Daraltılabilir Yan Menü:** Küçük ekranlarda veya odaklanmış çalışma anlarında menüyü simge durumuna küçülterek çalışma alanınızı genişletin.
- 🚪 **Oturum Yönetimi (Mock Auth):** Projelerinizi silmeden oturum açıp kapatabilme, `localStorage` tabanlı kalıcı oturum desteği.
- 📜 **Görev Aktivite Geçmişi:** Her görevin ne zaman oluşturulduğu, tamamlandığı veya taşındığına dair detaylı zaman çizelgesi (Timeline) günlüğü.
- 📝 **Markdown Görev Notları:** Görevlerinize özel, zengin metin düzenleyicisi ile detaylı notlar ekleyin.
- 🔔 **Bildirim Hatırlatıcı:** Browser Notification API ile "Haftalık Görev Özeti" bildirimleri alın.
- 🚀 **Karşılama Sihirbazı (Onboarding):** Yeni kullanıcılar için 4 adımlı interaktif uygulama rehberi.
- 📈 **İstatistik ve Verimlilik Paneli:** Tamamlanan görev sayıları, en uzun çalışma seriniz (Streak) ve en verimli günlerinizin detaylı analizi.
- 🎨 **Boş Durum Tasarımı (Empty States):** Henüz veri yokken kullanıcıyı yönlendiren şık illüstrasyonlar ve aksiyon butonları.
- 🖼️ **Gelişmiş Arama ve Filtreleme:** Projelerinizi başlık veya açıklamaya göre arayın, öncelik bazlı (Yüksek, Orta, Düşük) anlık filtreleyin.
- ↩️ **Geri Alma (Undo) Sistemi:** Yanlışlıkla silinen görev veya projeleri 5 saniyelik "Geri Al" bildirimi ile anında kurtarın.
- 🔗 **Görev Bağımlılıkları:** Görevler arası hiyerarşi ve kilit sistemi (Dependency) ile hata payını sıfırlayın.
- 📁 **Akıllı Proje Şablonları:** Tek tıkla Web, Mobil veya Full-Stack proje taslağınızı oluşturun.
- ☀️🌙 **Kalıcı Tema Sistemi:** MacOS tarzı modern arayüzle Aydınlık ve Karanlık mod arasında geçiş yapın.
- ⚡ **Hızlı Aksiyonlar:** Görevleri hızlıca silebilir, proje durumlarını anlık güncelleyebilirsiniz.
- 💾 **Kalıcı Veri:** Tüm verileriniz `Local Storage` üzerinde güvenle saklanır.

---

## 📸 Ekran Görüntüleri

### 1. Giriş Ekranı (Midnight Glow)
Giriş yaparken kullanıcıyı karşılayan, kişiselleştirilmiş isim girişi ve cam morfoloji etkili premium karşılama ekranı.
![Login Premium](docs/assets/login_premium.png)

### 2. Kontrol Paneli (Daraltılabilir Menü)
Çalışma alanını genişletmek için menüyü küçülten (mini-sidebar) yeni modern düzen.
![Dashboard Collapsed](docs/assets/sidebar_collapsed.png)

### 3. İstatistik ve Verimlilik Raporu
Tamamlanan görevler, en uzun seri (streak) ve 7 günlük aktivite grafiği ile güncel analiz paneli.
![Statistics Premium](docs/assets/stats_premium.png)

### 4. Karşılama Sihirbazı (Onboarding)
İlk girişte kullanıcıyı karşılayan 4 adımlı interaktif rehber.
![Onboarding](docs/assets/onboarding_welcome.png)

---

## 🛠️ Teknoloji Yığını

| Teknoloji | Kullanım |
|---|---|
| **React.js** | Frontend framework |
| **@dnd-kit** | Sürükle-bırak sistemi |
| **React Markdown** | Görev notu düzenleyici |
| **Lucide-React** | İkon kütüphanesi |
| **Vanilla CSS** | Modern Glassmorphism tasarım |
| **React Hooks** | State yönetimi |
| **Browser Notification API** | Bildirim sistemi |
| **localStorage** | Kalıcı veri depolama |

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için şu adımları izleyin:

1. **Depoyu Klonlayın**
   ```bash
   git clone https://github.com/mehmeteminyilmaz/VeloPath.git
   cd VeloPath
   ```

2. **Bağımlılıkları Yükleyin**
   ```bash
   cd web
   npm install
   ```

3. **Uygulamayı Başlatın**
   ```bash
   npm start
   ```

---

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmektedir.