const puppeteer = require('puppeteer');
const path = require('path');
const axios = require('axios');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function createDummyProject() {
  try {
    const res = await axios.post('http://localhost:5000/api/projects', {
      title: 'Mobil Uygulama Tasarımı',
      description: 'React Native ile VeloPath Mobil',
      priority: 'Yüksek',
      deadline: '2026-05-15',
      status: 'active',
      color: '#10b981'
    });
    
    const projectId = res.data._id;
    
    await axios.post('http://localhost:5000/api/tasks', {
      projectId,
      title: 'UI Bileşenleri',
      weekIndex: 1,
      priority: 'high',
      status: 'todo'
    });
  } catch(e) {}
}

async function capture() {
  console.log('Dummy proje oluşturuluyor...');
  await createDummyProject();

  console.log('Tarayıcı başlatılıyor...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('velopath_theme', 'light');
    localStorage.setItem('velopath_auth', 'true');
    localStorage.setItem('pomodoro_settings', JSON.stringify({ workTime: 25, breakTime: 5 }));
  });

  const assetsDir = path.join(__dirname, '..', 'docs', 'assets');
  
  console.log('Showcase Dashboard Light çekiliyor...');
  await page.goto('http://localhost:3000/');
  await delay(5000); // wait for data
  
  // Zorla light tema uygula
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('velopath_theme', 'light');
  });
  await delay(1000); // Temanın oturmasını bekle

  await page.screenshot({ path: path.join(assetsDir, 'showcase_dashboard_light.png') });

  // Belki projenin detayına girip ışık modunda kanban da çekebiliriz ama şimdilik sadece dashboard
  await browser.close();
  console.log('Açık tema görselleri çekildi!');
}

capture().catch(console.error);
