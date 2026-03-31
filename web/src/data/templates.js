export const PROJECT_TEMPLATES = [
  {
    id: 'web',
    title: 'Modern Web Projesi',
    description: 'React, Vite ve TailwindCSS ile modern bir web uygulaması kurulum şablonu.',
    icon: 'Monitor',
    tasks: [
      { id: 101, text: 'Proje mimarisinin kurulması', completed: false, week: 1, dependsOn: null },
      { id: 102, text: 'UI Bileşen kütüphanesinin eklenmesi', completed: false, week: 1, dependsOn: 101 },
      { id: 103, text: 'API entegrasyonu ve State yönetimi', completed: false, week: 2, dependsOn: 102 },
      { id: 104, text: 'Responsive tasarım testleri', completed: false, week: 2, dependsOn: 103 },
      { id: 105, text: 'Deployment ve final kontroller', completed: false, week: 3, dependsOn: 104 }
    ]
  },
  {
    id: 'mobile',
    title: 'Mobil Uygulama (React Native)',
    description: 'Android ve iOS için hibrit mobil uygulama geliştirme şablonu.',
    icon: 'Smartphone',
    tasks: [
      { id: 201, text: 'React Native ortam kurulumu', completed: false, week: 1, dependsOn: null },
      { id: 202, text: 'Navigasyon yapısının kurulması', completed: false, week: 1, dependsOn: 201 },
      { id: 203, text: 'Ekran tasarımlarının kodlanması', completed: false, week: 2, dependsOn: 202 },
      { id: 204, text: 'Push bildirim entegrasyonu', completed: false, week: 3, dependsOn: 203 },
      { id: 205, text: 'App Store / Play Store hazırlığı', completed: false, week: 4, dependsOn: 204 }
    ]
  },
  {
    id: 'fullstack',
    title: 'Full-Stack SaaS',
    description: 'Frontend, Backend ve Veritabanı içeren uçtan uca SaaS şablonu.',
    icon: 'Layers',
    tasks: [
      { id: 301, text: 'Database şemasının tasarlanması', completed: false, week: 1, dependsOn: null },
      { id: 302, text: 'Auth sisteminin kurulması', completed: false, week: 1, dependsOn: 301 },
      { id: 303, text: 'Ana feature API\'larının yazılması', completed: false, week: 2, dependsOn: 302 },
      { id: 304, text: 'Ödeme sistemi (Stripe) entegrasyonu', completed: false, week: 3, dependsOn: 303 },
      { id: 305, text: 'Uçtan uca testler ve Beta yayını', completed: false, week: 4, dependsOn: 304 }
    ]
  }
];
