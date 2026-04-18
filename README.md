<div align="center">

# VeloPath 🚀

**Haftalık bazda akıllı proje planlama, Kanban panosu ve gelişmiş görev yönetimi.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![dnd-kit](https://img.shields.io/badge/dnd--kit-Drag%20%26%20Drop-10b981?style=flat-square)](https://dndkit.com)
[![CSS](https://img.shields.io/badge/CSS-Glassmorphism-a78bfa?style=flat-square)](https://github.com/mehmeteminyilmaz/VeloPath)
[![Lisans](https://img.shields.io/badge/Lisans-Eğitim-f59e0b?style=flat-square)](https://github.com/mehmeteminyilmaz/VeloPath)

</div>

---

## 🎬 Genel Bakış

VeloPath, proje yönetimini daha kolay ve görsel hale getirmek için geliştirdiğim bir web uygulaması. Haftalık plan, Kanban panosu, etiketler, alt görevler gibi ihtiyaç duyduğum özellikleri bir araya getirip modern bir arayüzle sunmayı istedim. Hâlâ gelişmeye devam ediyor.

---

### 🔐 Premium Giriş Deneyimi

Aurora animasyonlu, cam morfoloji (glassmorphism) etkili **Midnight Glow** giriş ekranı. Kişiselleştirilmiş hoş geldin deneyimi ve kalıcı oturum yönetimi.

![Giriş Ekranı](docs/assets/showcase_login.png)

---

### 📊 Akıllı Kontrol Paneli

Tüm projelerinizi tek bir panelden yönetin. İstatistik kartları, genel ilerleme halkası, anlık arama ve öncelik filtreleme ile tam bir komuta merkezi.

![Kontrol Paneli](docs/assets/showcase_dashboard.png)

---

### 🗂️ Kanban Panosu

Bazen listeye bakmak yerine büyük resmi görmek istersiniz. Kanban modunda projeleriniz ilerleme durumuna göre **Yapılacak → Devam Ediyor → Tamamlandı** sütunlarına otomatik olarak ayrılır.

![Kanban Panosu](docs/assets/showcase_kanban.png)

---

### 📅 Haftalık Görev Planlama

Projenizi haftalara bölün, görevleri **sürükle-bırak** ile yeniden sıralayın, haftalar arası taşıyın. Bağımlılık kilitleri, mini ilerleme grafikleri ve anlık etiket/öncelik rozetleriyle tam kontrol.

![Proje Detayları](docs/assets/showcase_project.png)

---

### ✅ Görev Yönetim Merkezi

Her göreve tıklayın; **markdown not editörü**, **alt görevler**, **etiketler**, **öncelik seçici** ve **aktivite geçmişi** sekmeleriyle derinlemesine yönetin.

![Görev Detay Modalı](docs/assets/showcase_modal.png)

---

### 📈 Verimlilik ve İstatistik Raporu

7 günlük aktivite grafiği, en uzun çalışma seriniz (streak), en verimli gününüz ve tamamlanan görev analizleriyle çalışma alışkanlıklarınızı keşfedin.

![İstatistik Sayfası](docs/assets/showcase_stats.png)

---

## ✨ Özellik Listesi

<details>
<summary><strong>🗂️ Proje Yönetimi</strong></summary>

| Özellik | Açıklama |
|---|---|
| **Kanban Panosu** | İlerlemeye göre otomatik sütun sınıflandırması |
| **Grid / Kanban Toggle** | Tek tıkla görünüm değiştirme |
| **Proje Renk Kodlama** | Her projeye özel renk ve görsel şerit |
| **Arşivleme** | Projeleri arşivle, istediğinde geri getir |
| **Proje Şablonları** | Web, Mobil, Full-Stack hazır görev listeleri |
| **Proje Notları** | Markdown note defteri (düzenle + önizleme) |

</details>

<details>
<summary><strong>✅ Görev Yönetimi</strong></summary>

| Özellik | Açıklama |
|---|---|
| **Sürükle-Bırak** | `@dnd-kit` ile haftalar arası pürüzsüz taşıma |
| **Görev Öncelikleri** | Bireysel 🔴 Yüksek / 🟡 Orta / 🟢 Düşük |
| **Alt Görevler** | Alt görev listesi + ilerleme barı + mini gösterim |
| **Görev Etiketleri** | Serbest etiket + 10 hızlı öneri + renkli chip'ler |
| **Bağımlılık Kilitleri** | Önce tamamlanması gereken görevi belirle |
| **Markdown Notlar** | Zengin metin; düzenle + önizle + aktivite geçmişi |
| **Geri Alma (Undo)** | 5 saniyelik toast ile silme geri alma |

</details>

<details>
<summary><strong>🎨 Arayüz & Deneyim</strong></summary>

| Özellik | Açıklama |
|---|---|
| **Dark / Light Tema** | Kalıcı macOS tarzı tema geçişi |
| **Daraltılabilir Sidebar** | Çalışma alanını genişlet, odaklanmış mod |
| **Onboarding Sihirbazı** | 4 adımlı interaktif kullanıcı rehberi |
| **Boş Durum Tasarımı** | Veri yokken şık yönlendirici ekranlar |
| **Gelişmiş Arama & Filtre** | Başlık/açıklama arama + öncelik filtresi |
| **Bildirim Sistemi** | Browser Notification API ile hatırlatmalar |

</details>

---

## 🛠️ Teknoloji Yığını

| Teknoloji | Kullanım |
|---|---|
| **React.js 18** | Frontend framework |
| **React Router v6** | Sayfa yönlendirme |
| **@dnd-kit** | Sürükle-bırak sistemi |
| **React Markdown** | Görev notu + proje notu editörü |
| **Lucide-React** | İkon kütüphanesi |
| **Vanilla CSS** | Glassmorphism & CSS Custom Properties |
| **localStorage** | Kalıcı veri depolama |
| **Browser Notification API** | Bildirim sistemi |

---

## 🚀 Kurulum

```bash
# Repoyu klonlayın
git clone https://github.com/mehmeteminyilmaz/VeloPath.git
cd VeloPath/web

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

➡️ `http://localhost:3000` adresinde açılır.


