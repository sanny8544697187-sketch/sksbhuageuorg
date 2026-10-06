const fs = require('fs');
let xml = fs.readFileSync('android/app/src/main/res/values/styles.xml', 'utf8');

const replacement = `<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/colorPrimary</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>`;

xml = xml.replace(/<style name="AppTheme\.NoActionBarLaunch" parent="Theme\.SplashScreen">[\s\S]*?<\/style>/m, replacement);
fs.writeFileSync('android/app/src/main/res/values/styles.xml', xml);
console.log('Fixed styles.xml successfully');
