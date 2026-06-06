const { networkInterfaces } = require('os');
const { spawn } = require('child_process');

const nets = networkInterfaces();
let selectedIp = null;

// Ağ arayüzlerini gerçek Wi-Fi/Ethernet'i önceliklendirecek şekilde sırala
const sortedNames = Object.keys(nets).sort((a, b) => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  const aIsReal = aLower.includes('wi-fi') || aLower.includes('wireless') || aLower.includes('ethernet') || aLower.includes('wlan') || aLower.includes('yerel');
  const bIsReal = bLower.includes('wi-fi') || bLower.includes('wireless') || bLower.includes('ethernet') || bLower.includes('wlan') || bLower.includes('yerel');
  
  const aIsVirtual = aLower.includes('virtual') || aLower.includes('vbox') || aLower.includes('vmware') || aLower.includes('wsl') || aLower.includes('vethernet') || aLower.includes('host-only');
  const bIsVirtual = bLower.includes('virtual') || bLower.includes('vbox') || bLower.includes('vmware') || bLower.includes('wsl') || bLower.includes('vethernet') || bLower.includes('host-only');
  
  if (aIsReal && !bIsReal) return -1;
  if (!aIsReal && bIsReal) return 1;
  if (aIsVirtual && !bIsVirtual) return 1;
  if (!aIsVirtual && bIsVirtual) return -1;
  return 0;
});

for (const name of sortedNames) {
  const nameLower = name.toLowerCase();
  // VirtualBox, VMware, WSL gibi sanal arayüzleri atla
  if (nameLower.includes('virtual') || nameLower.includes('vbox') || nameLower.includes('vmware') || nameLower.includes('wsl') || nameLower.includes('vethernet') || nameLower.includes('host-only')) {
    continue;
  }
  
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      // Yaygın VirtualBox/Docker host-only IP bloklarını atla
      if (net.address.startsWith('192.168.56.') || net.address.startsWith('192.168.99.')) {
        continue;
      }
      selectedIp = net.address;
      break;
    }
  }
  if (selectedIp) {
    console.log(`Secilen gercek ag arayuzu: ${name} (${selectedIp})`);
    break;
  }
}

// Eşleşme bulunamazsa ilk geçerli harici IPv4'e geri dön
if (!selectedIp) {
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        selectedIp = net.address;
        break;
      }
    }
    if (selectedIp) {
      console.log(`Fallback ag arayuzu: ${name} (${selectedIp})`);
      break;
    }
  }
}

if (selectedIp) {
  console.log(`Expo Metro sunucusu bu IP uzerinden yayin yapacak: ${selectedIp}`);
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = selectedIp;
} else {
  console.log("Uyari: Gercek bir IP adresi bulunamadi. Varsayilan ayarlar kullaniliyor.");
}

// Expo Metro bundler'ı başlat
const child = spawn('npx', ['expo', 'start', '--clear', '--lan'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  process.exit(code);
});
