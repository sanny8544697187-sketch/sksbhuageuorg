import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Replace the install prompt logic
old_logic = '''  // Install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!localStorage.getItem('bhu:pwaDeclined')) setTimeout(showInstallBanner, 4000);
  });'''
  
new_logic = '''  // Install prompt - Direct to Play Store
  if (!localStorage.getItem('bhu:pwaDeclined')) {
    setTimeout(showInstallBanner, 4000);
  }'''
text = text.replace(old_logic, new_logic)

# 2. Change the subtitle text
text = text.replace('Works offline • No App Store needed', 'Get the official Android App')

# 3. Change the Install button action
old_btn = 'onclick=\"installPWA()\"'
new_btn = 'onclick=\"window.open(\'https://play.google.com/store/apps/details?id=online.sannykumar.krishigyan_v1&pcampaignid=web_share\', \'_blank\');\"'
text = text.replace(old_btn, new_btn)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
