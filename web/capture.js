const puppeteer = require('puppeteer');
const path = require('path');
const axios = require('axios');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function capture() {
  console.log('Tarayıcı başlatılıyor...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('velopath_theme', 'dark');
    localStorage.setItem('onboardingDone', 'true'); // Bypass onboarding
    // DO NOT set auth here to test Login screen!
    localStorage.setItem('pomodoro_settings', JSON.stringify({ workTime: 25, breakTime: 5 }));
  });

  const assetsDir = path.join(__dirname, '..', 'docs', 'assets');
  
  // Go to root, should render Login
  await page.goto('http://localhost:3000/');
  await delay(3000);
  
  console.log('Showcase Login çekiliyor...');
  await page.screenshot({ path: path.join(assetsDir, 'showcase_login.png') });

  // Log in
  await page.type('input[placeholder="Örn: Mehmet"]', 'Mehmet');
  await page.click('button[type="submit"]');
  console.log('Login yapıldı, Dashboard bekleniyor...');
  
  await delay(5000); // Wait for data to load
  
  console.log('Showcase Dashboard çekiliyor...');
  await page.screenshot({ path: path.join(assetsDir, 'showcase_dashboard.png') });
  
  try {
    let projectCards = await page.$$('.card');
    let isOnProjectPage = false;

    // Eğer proje yoksa bir proje oluştur
    if (projectCards.length === 0) {
      console.log('Proje yok, test projesi oluşturuluyor...');
      await page.waitForSelector('a[href="/create"]');
      await page.click('a[href="/create"]');
      await delay(2000);
      
      // Şablon kullanma, elle doldur (en güvenilir yöntem)
      await page.waitForSelector('input[placeholder="Örn: VeloPath Web Geliştirme"]');
      await page.type('input[placeholder="Örn: VeloPath Web Geliştirme"]', 'VeloPath Web & Mobil Entegrasyonu');
      await delay(500);

      await page.click('button[type="submit"]');
      await delay(5000); // Wait for project creation and redirection to Dashboard
      
      // Şimdi tekrar proje kartlarını bul
      await page.waitForSelector('.card');
      projectCards = await page.$$('.card');
      console.log('Project cards length after creation:', projectCards.length);
    }

    if (!isOnProjectPage && projectCards.length > 0) {
      await page.evaluate((btn) => btn.click(), projectCards[0]);
      await delay(2000);
      isOnProjectPage = true;
    }

    if (isOnProjectPage) {
      console.log('Showcase Project (Paylaş butonu dahil) çekiliyor...');
      await page.screenshot({ path: path.join(assetsDir, 'showcase_project.png') });
      
      // Open Pomodoro
      try {
        const pBtn = await page.$('.floating-pomodoro-btn');
        if(pBtn) {
           await pBtn.click();
           await delay(1000);
           console.log('Showcase Pomodoro çekiliyor...');
           await page.screenshot({ path: path.join(assetsDir, 'showcase_pomodoro.png') });
           // close pomodoro
           const closeBtn = await page.$('.pomodoro-timer button[class="icon-button"]');
           if (closeBtn) await closeBtn.click();
           await delay(1000);
        }
      } catch(e) {}

      // Open a task modal
      try {
        const tasks = await page.$$('.task-item');
        if(tasks.length > 1) {
           await tasks[1].click();
           await delay(1000);
           console.log('Showcase Modal çekiliyor...');
           await page.screenshot({ path: path.join(assetsDir, 'showcase_modal.png') });
           // close modal
           await page.mouse.click(10, 10);
           await delay(1000);
        }
      } catch(e) {}

      // Click Kanban view
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Kanban')) {
          await btn.click();
          await delay(2000);
          console.log('Showcase Kanban çekiliyor...');
          await page.screenshot({ path: path.join(assetsDir, 'showcase_kanban.png') });
          break;
        }
      }
    }
  } catch (e) {
    console.error('Proje detaya girerken hata:', e);
  }

  await browser.close();
  console.log('Tüm ekran görüntüleri güncellendi!');
}

capture().catch(console.error);
