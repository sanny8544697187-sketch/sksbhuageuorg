let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('installAppBtn');
  if (installBtn) {
    installBtn.style.display = 'flex';
  }
});

async function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      const installBtn = document.getElementById('installAppBtn');
      if (installBtn) installBtn.style.display = 'none';
    }
    deferredPrompt = null;
  }
}
