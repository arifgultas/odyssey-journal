# Deployment Guide - Odyssey Journal

## 📱 Store Submission Hazırlığı

### 1. App Configuration

#### app.json Güncellemeleri

```json
{
  "expo": {
    "name": "Odyssey Journal",
    "slug": "odyssey-journal",
    "version": "1.0.0",
    "description": "Your personal travel journal - Capture, share, and relive your adventures",
    "privacy": "public",
    "platforms": ["ios", "android"],
    
    "ios": {
      "bundleIdentifier": "com.odysseyjournal.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Odyssey Journal needs access to your photos to let you share your travel memories.",
        "NSCameraUsageDescription": "Odyssey Journal needs access to your camera to capture new moments.",
        "NSLocationWhenInUseUsageDescription": "Odyssey Journal needs your location to tag your posts with places you visit."
      }
    },
    
    "android": {
      "package": "com.odysseyjournal.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

---

### 2. EAS Build Setup

#### Install EAS CLI
```bash
npm install -g eas-cli
```

#### Login to Expo
```bash
eas login
```

#### Configure EAS Build
```bash
eas build:configure
```

#### Create eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

---

### 3. Build Commands

#### Development Build
```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

#### Production Build
```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android

# Both
eas build --profile production --platform all
```

---

### 4. Store Assets

#### App Icon
- **Size**: 1024x1024px
- **Format**: PNG
- **Location**: `./assets/images/icon.png`
- **Requirements**: No transparency, no rounded corners

#### Splash Screen
- **Size**: 1242x2436px (iPhone 11 Pro Max)
- **Format**: PNG
- **Location**: `./assets/images/splash-icon.png`

#### Screenshots (iOS)

**iPhone 6.7" (Required)**
- 1290 x 2796 pixels
- Minimum 3 screenshots, maximum 10

**iPhone 6.5" (Required)**
- 1242 x 2688 pixels
- Minimum 3 screenshots, maximum 10

**iPad Pro 12.9" (Optional)**
- 2048 x 2732 pixels

#### Screenshots (Android)

**Phone**
- 1080 x 1920 pixels minimum
- 16:9 or 9:16 aspect ratio
- Minimum 2 screenshots, maximum 8

**Tablet (Optional)**
- 1920 x 1080 pixels minimum

---

### 5. Store Listing Information

#### App Name
```
Odyssey Journal - Travel Diary
```

#### Subtitle (iOS) / Short Description (Android)
```
Capture & share your travel adventures
```

#### Description
```
Odyssey Journal is your personal travel companion, designed to help you capture, organize, and share your adventures with the world.

✨ KEY FEATURES:

📸 CAPTURE MEMORIES
• Share multiple photos from your journeys
• Add locations to remember where you've been
• Write detailed stories about your experiences

🗺️ DISCOVER PLACES
• Explore posts from travelers worldwide
• Find inspiration for your next adventure
• Connect with fellow explorers

💫 BEAUTIFUL DESIGN
• Polaroid-style photo cards
• Smooth animations and transitions
• Dark mode support

🔖 ORGANIZE YOUR TRAVELS
• Bookmark your favorite posts
• Create your personal travel collection
• Easy search and discovery

📱 OFFLINE SUPPORT
• Browse your memories offline
• Automatic sync when connected
• Fast and reliable performance

Whether you're a seasoned globetrotter or weekend explorer, Odyssey Journal helps you preserve and share your travel stories in a beautiful, intuitive way.

Download now and start your journey! 🌍✈️
```

#### Keywords (iOS)
```
travel, journal, diary, adventure, photos, memories, explore, discover, wanderlust, trip
```

#### Category
- **Primary**: Travel
- **Secondary**: Photo & Video

#### Age Rating
- **iOS**: 12+ (for social networking features)
- **Android**: Everyone

---

### 6. Privacy Policy & Terms

#### Privacy Policy URL
```
https://odysseyjournal.app/privacy-policy
```

#### Terms of Service URL
```
https://odysseyjournal.app/terms
```

#### Support URL
```
https://odysseyjournal.app/support
```

#### Marketing URL (Optional)
```
https://odysseyjournal.app
```

---

### 7. Pre-Submission Checklist

#### Code Quality
- [ ] All console.logs removed
- [ ] No debug code
- [ ] No unused imports
- [ ] ESLint errors fixed
- [ ] TypeScript errors fixed

#### Testing
- [ ] Manual testing completed
- [ ] All features working
- [ ] No crashes
- [ ] Performance acceptable
- [ ] Offline mode working

#### Assets
- [ ] App icon created (1024x1024)
- [ ] Splash screen created
- [ ] Screenshots captured (all required sizes)
- [ ] App preview video (optional but recommended)

#### Legal
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Age rating determined
- [ ] Content rating completed

#### Configuration
- [ ] Bundle identifier set
- [ ] Version number set (1.0.0)
- [ ] Build number set (1)
- [ ] Permissions configured
- [ ] API keys secured

---

### 8. Submission Process

#### iOS App Store

1. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Click "My Apps" → "+" → "New App"
   - Fill in app information

2. **Upload Build**
   ```bash
   eas build --profile production --platform ios
   eas submit --platform ios
   ```

3. **Complete App Information**
   - Add screenshots
   - Write description
   - Set pricing (Free)
   - Add keywords
   - Set age rating

4. **Submit for Review**
   - Answer review questions
   - Submit app

#### Google Play Store

1. **Create App in Play Console**
   - Go to https://play.google.com/console
   - Click "Create app"
   - Fill in app details

2. **Upload Build**
   ```bash
   eas build --profile production --platform android
   eas submit --platform android
   ```

3. **Complete Store Listing**
   - Add screenshots
   - Write description
   - Set category
   - Add content rating

4. **Create Release**
   - Internal testing → Closed testing → Open testing → Production
   - Start with internal testing

---

### 9. Post-Submission

#### Monitor Reviews
- Respond to user feedback
- Fix reported bugs
- Update regularly

#### Analytics
- Track user engagement
- Monitor crash reports
- Analyze user behavior

#### Updates
- Regular bug fixes
- New features
- Performance improvements

---

### 10. Environment Variables

Ensure all sensitive data is secured:

```bash
# .env (DO NOT commit to git)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY_IOS=your_ios_key
GOOGLE_MAPS_API_KEY_ANDROID=your_android_key
```

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

---

### 11. Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Update app
eas update

# View submissions
eas submit:list
```

---

## 🎯 Timeline

- **Day 1-2**: Prepare assets and store listings
- **Day 3**: Create production builds
- **Day 4**: Test production builds
- **Day 5**: Submit to stores
- **Day 6-14**: Review process (typically 1-2 weeks)

---

## 📞 Support

- **EAS Documentation**: https://docs.expo.dev/eas/
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Play Store Guidelines**: https://play.google.com/about/developer-content-policy/

---

## 🚀 DevOps & Post-Launch Ops (Faz 7)

### 1. Sentry Monitoring Dashboard & Hardening (Görev 7.6)

Uygulamanın canlı ortamdaki kararlılığını izlemek için Sentry panelinizi aşağıdaki şekilde yapılandırın:

#### Hata İzleme (Error Tracking) & Alerts
1. **Alert Rules**: Sentry > Alerts > Create Alert altından yeni bir kural tanımlayın:
   - **Kural**: Bir hata ilk defa görüldüğünde veya son 1 saatte 10 kereden fazla tetiklendiğinde Slack/Email ile bildirim gönder.
2. **Issue Grouping**: Benzer hata bildirimlerini gruplandırmak için Sentry'nin default parmak izi (fingerprinting) ayarlarını kullanın.

#### PII (Kişisel Bilgilerin) Maskelenmesi
Sentry SDK'sı başlarken hassas verileri temizleyecek şekilde yapılandırılmıştır. Ancak ek güvenlik için:
- **Sentry Dashboard > Settings > Security & Privacy > Data Scrubbing** alanına gidin.
- "Scrub User Names", "Scrub IP Addresses" ve "Scrub Email Addresses" ayarlarını **aktif** hale getirin.

#### Performans İzleme (Performance & Transactions)
- **Transactions**: Harita yükleme süreleri, anasayfa feed çekme işlemi gibi kritik akışların sürelerini (latency) Sentry Performance ekranından takip edin.
- **Apdex Score**: Kullanıcı memnuniyet sınırını 500ms (satisfying) olarak ayarlayarak performans anomalilerinde bildirim alın.

---

### 2. Google Maps API Key Sınırlandırmaları (Görev 7.7)

API anahtarlarınızın çalınması durumunda bütçenizin zarar görmesini engellemek için **Google Cloud Console** üzerinde kesinlikle kısıtlamalar uygulayın:

#### iOS API Anahtarı Kısıtlamaları (iOS App Restrictions)
1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin.
2. **APIs & Services > Credentials** sekmesine geçin.
3. iOS için kullandığınız API anahtarına tıklayın.
4. **Application restrictions** altından **iOS apps** seçeneğini seçin.
5. **Add bundle identifier** butonuna tıklayarak uygulamanızın paket kimliğini girin:
   - `com.odysseyjournal.app`
6. **API restrictions** kısmından sadece **Maps SDK for iOS** iznini işaretleyin ve kaydedin.

#### Android API Anahtarı Kısıtlamaları (Android App Restrictions)
1. Android API anahtarının düzenleme sayfasına gidin.
2. **Application restrictions** altından **Android apps** seçeneğini seçin.
3. **Add package name and SHA-1 signing certificate fingerprint** butonuna tıklayın.
4. **Package name** alanına girin:
   - `com.odysseyjournal.app`
5. **SHA-1 fingerprint** alanına Expo EAS build veya Google Play Console'dan aldığınız SHA-1 imza parmak izini girin (EAS'ten almak için `eas credentials` çalıştırabilirsiniz).
6. **API restrictions** kısmından sadece **Maps SDK for Android** iznini işaretleyin ve kaydedin.

---

### 3. Supabase Pro Plan Değerlendirmesi (Görev 7.8)

Projenin üretim (canlı) ortamı için Supabase Ücretsiz (Free) plandan Pro plana geçiş kararı aşağıdaki kriterler doğrultusunda değerlendirilmelidir:

#### Pro Plan Avantajları (Neden Geçilmeli?)
* **Otomatik Yedeklemeler (Backups)**: Free planda yedekleme bulunmazken, Pro planda günlük otomatik yedeklemeler yapılır ve 7 gün boyunca saklanır.
* **PITR (Point-in-Time Recovery)**: Veritabanını son birkaç gün içindeki herhangi bir saniyeye geri yükleyebilme (olası veri kayıplarında can kurtarıcı).
* **Veritabanı Boyutu**: Free plandaki 500 MB limit, Pro planda 8 GB'a (ve sonrasında kullandıkça öde modeliyle limitsiz) yükselir.
* **Egress (Ağ Çıkış) Trafiği**: Resim paylaşımları yoğun olacağından aylık 5 GB limit yetersiz kalacaktır, Pro planda limit 50 GB'tır.
* **Proje Kapanma Koruması**: Free projeler 1 hafta boyunca aktif istek almazsa otomatik durdurulurken (pause), Pro projeler her zaman açık kalır.

#### Geçiş Kontrol Listesi (Migration Checklist)
1. **Supabase Dashboard > Organization Settings > Subscription** sekmesine gidin.
2. **Upgrade to Pro Plan** butonuna tıklayın (Aylık $25 taban ücret).
3. **Daily Backups**'ı aktif edin.
4. **Point-in-Time Recovery (PITR)** seçeneğini (özellikle kritik lansman haftasında) aktif hale getirmeyi değerlendirin.
5. **Edge Function Limits**: Eşzamanlı istek limitlerinizi (concurrency limits) ve CPU kullanım grafiklerini takip edin.

---

**Good luck with your submission! 🚀**
