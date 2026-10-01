let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show the mobile sticky banner
  const banner = document.getElementById('pwaInstallBanner');
  if (banner) {
    banner.style.display = 'flex';
  }
});

async function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      const banner = document.getElementById('pwaInstallBanner');
      if (banner) banner.style.display = 'none';
    }
    deferredPrompt = null;
  }
}
