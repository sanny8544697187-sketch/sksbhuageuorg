// KrishiGyan — Capacitor Native App Logic

document.addEventListener('DOMContentLoaded', () => {
  if (window.Capacitor && window.Capacitor.Plugins) {
    const { App, StatusBar, SplashScreen, Network, Dialog, FirebaseAuthentication } = window.Capacitor.Plugins;

    // ─── Status Bar ───────────────────────────────────────────────
    if (StatusBar) {
      try {
        StatusBar.setStyle({ style: 'DARK' });
        StatusBar.setBackgroundColor({ color: '#0F3D23' });
        StatusBar.setOverlaysWebView({ overlay: false });
      } catch(e) {}
    }

    // ─── Splash Screen ────────────────────────────────────────────
    if (SplashScreen) {
      setTimeout(() => { SplashScreen.hide(); }, 1000);
    }

    // ─── Native Google Sign-In Bridge ─────────────────────────────
    // Exposes CapacitorFirebaseAuth.signInWithGoogle() to the web layer.
    // doGoogleLogin() in index.html calls this on Android to avoid the
    // broken signInWithRedirect() WebView / sessionStorage issue.
    if (FirebaseAuthentication) {
      window.CapacitorFirebaseAuth = {
        signInWithGoogle: async () => {
          const result = await FirebaseAuthentication.signInWithGoogle();
          // result.credential contains { idToken, accessToken }
          return result.credential;
        },
        signOut: async () => {
          await FirebaseAuthentication.signOut();
        }
      };
      console.log('KrishiGyan: Native Firebase Authentication bridge ready.');
    }

    // ─── Back Button ──────────────────────────────────────────────
    if (App && Dialog) {
      App.addListener('backButton', async () => {
        // If a modal is open, close it
        const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
        if (visibleModals.length > 0) {
          visibleModals.forEach(m => m.classList.add('hidden'));
          return;
        }
        // If not home, go home
        const activeSec = document.querySelector('.section.active');
        if (activeSec && activeSec.id !== 'home') {
          if (typeof window.setSection === 'function') {
            window.setSection('home');
          } else {
            window.history.back();
          }
          return;
        }
        // On Home → ask to exit
        const result = await Dialog.confirm({
          title: 'Exit',
          message: 'Are you sure you want to exit KrishiGyan?',
          okButtonTitle: 'Exit',
          cancelButtonTitle: 'Cancel'
        });
        if (result.value) { App.exitApp(); }
      });
    }

    // ─── Network Status ───────────────────────────────────────────
    if (Network) {
      Network.addListener('networkStatusChange', status => {
        if (!status.connected) {
          console.warn('KrishiGyan: Network lost');
        }
      });
    }

    // ─── Hide PWA Install Banner (not needed inside the native app) ─
    const style = document.createElement('style');
    style.innerHTML = '#pwaInstallBanner { display: none !important; }';
    document.head.appendChild(style);
  }
});
