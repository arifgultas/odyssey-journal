# Odyssey Journal — Mağaza Kontrol Listesi

**Oluşturulma:** 2026-09-19
**Ne işe yarar:** Yalnızca App Store ve Google Play'e yayın adımları. Sırayla gidin;
takıldığınız ekranın adını yazmanız yeterli. Build, test, anahtar ve genel durum → `FINALIZE.md`.

---

## 0. Web sitesi linkleri — ✅ yayında

Web sitesi: **https://odysseyjournal.app** (GitHub Pages kullanılmıyor.)

Mağaza formlarında kullanılacak adresler (projede zaten bu adresler geçiyor —
`STORE_LISTING.md`, `DEPLOYMENT_GUIDE.md`):

| Ne için | Adres |
|---|---|
| Web sitesi / Marketing URL | `https://odysseyjournal.app` |
| Gizlilik Politikası (Privacy Policy) | `https://odysseyjournal.app/privacy-policy` |
| Kullanım Şartları (Terms) | `https://odysseyjournal.app/terms` |
| Destek (Support URL) | `https://odysseyjournal.app/support` |
| Hesap silme bilgisi (Play istiyor) | `https://odysseyjournal.app/delete-account` |

- ✅ 19 Eylül: beş adres de açılıyor (200); gizlilik sayfasında silme bölümü, destek sayfasında
  e-postalar var.
- ⏳ Sitede düzeltiliyor: `/terms` → "Settings > Account > Delete Account" (yanlışlıkla
  "Danger Zone" yazıyordu); `/delete-account` → "profili gizli yap" önerisi kaldırılacak
  (uygulamada gizli profil yok).

---

## 1. App Store Connect

> **İncelemeye build 8 gönderilecek** (kayıt ekranı linkleri + gizlenen Google/Apple butonları).
> Build 8, EAS kredisi gelince alınacak. Formlar, metinler ve görseller şimdiden doldurulabilir;
> yalnızca 1.4'teki build seçimi ve 1.8 gönderim build 8'i bekler.

appstoreconnect.apple.com → **Apps → Odyssey Journal**

### 1.1 App Information (sol menü)
- [ ] **Category:** Primary **Travel**, Secondary **Social Networking**
- [ ] **Content Rights:** "Üçüncü taraf içerik gösteriyor mu?" → **Yes** (kullanıcı gönderileri) → onayla
- [ ] **Age Rating → Edit:** User-Generated Content → **Yes**, Messaging/Chat → **Yes**, diğer her şey
      **No / None**. (Muhtemelen 13+ çıkar.)
- [ ] Sağ üstteki dil menüsünden diğer 11 dili ekle (liste ve hangi "Spanish/Portuguese" seçileceği:
      `STORE_LISTING.md` → "Dil kodları")

### 1.2 App Privacy → Get Started → "Veri topluyor musunuz?" → **Yes**

| Veri türü | Amaç | Kullanıcıya bağlı | Takip (tracking) |
|---|---|---|---|
| Name, Email Address | App Functionality | Evet | Hayır |
| Photos or Videos, Other User Content | App Functionality | Evet | Hayır |
| Precise Location | App Functionality | Evet | Hayır |
| User ID | App Functionality | Evet | Hayır |
| Crash Data | App Functionality | Hayır | Hayır |

- [ ] **Privacy Policy URL:** `https://odysseyjournal.app/privacy-policy`

### 1.3 Pricing and Availability
- [ ] **Free**, tüm ülkeler

### 1.4 "iOS App 1.0" sayfası — English (U.S.)
- [ ] **Screenshots → iPhone 6.9" Display:** `mockup_feature/ios/en/` içindeki 8 görsel, **01'den 08'e sırayla**
      (iPad bölümü çıkmamalı — iPad desteği kapatıldı)
- [ ] **Promotional Text / Description / Keywords:** `STORE_LISTING.md`'den
- [ ] **Support URL:** `https://odysseyjournal.app/support`
- [ ] **Marketing URL (isteğe bağlı):** `https://odysseyjournal.app`
- [ ] **Build:** "+" → **8**. Şifreleme sorusu çıkmaz (`ITSAppUsesNonExemptEncryption: false` kodda).

### 1.5 Aynı sayfa — Turkish
- [ ] `mockup_feature/ios/tr/` görselleri + `STORE_LISTING.md`'deki Türkçe metin

### 1.5b Aynı sayfa — diğer 10 dil
- [ ] Her dil için dil menüsünden seç → `STORE_LISTING.md`'deki o dilin Subtitle, Promotional Text,
      Description, Keywords, What's New alanları. Ekran görüntüsü yüklemeyin: EN görselleri kullanılır.

### 1.6 App Review Information
- [ ] **Sign-in required:** ✓ → review demo hesabının e-postası ve şifresi
- [ ] İletişim bilgileri (ad, telefon, e-posta)
- [ ] **Notes** kutusuna:

```
Users can report posts and block users (post menu → Report / Block).
Community Guidelines: Settings → Legal & Community.
Account deletion: Settings → Account → Delete Account.
```

### 1.7 Version Release
- [ ] **Manually release this version** (önerilen — onaydan sonra yayın zamanını siz seçersiniz)

### 1.8 Gönder
- [ ] Sağ üstte **Add for Review** → **Submit**

---

## 2. Android — AAB'yi Android Studio'dan alma

`android/` klasörü 19 Eylül'de güncel koddan yeniden üretildi (versionCode 2, Google Maps anahtarı içinde).

1. [ ] Android Studio → **Open** → projedeki **`android`** klasörünü seç (proje kökünü değil).
       Gradle senkronizasyonunun bitmesini bekle.
2. [ ] **Build → Generate Signed App Bundle or APK → Android App Bundle → Next**
3. [ ] **Create new…** (yeni anahtar dosyası):
   - Konum: proje dışında, örn. `Belgeler\odyssey-upload.jks`
   - Şifre, Alias: `upload`, Validity: 25 yıl, ad-soyad
4. [ ] **release** → **Create** → çıktı: `android/app/release/app-release.aab`

> ⚠️ **`.jks` dosyasını ve şifreleri mutlaka yedekleyin** (bulut + ikinci bir yer). Kaybolursa
> uygulamaya güncelleme yükleyemezsiniz.
>
> ⚠️ Daha önce EAS'ten alınan AAB'yi (`324319a5`, versionCode 1, eski anahtar) Play'e **yüklemeyin**.
>
> İleride EAS'ten Android build alınacaksa bu `.jks` dosyası `eas credentials` ile EAS'e yüklenmeli.

---

## 3. Google Play Console

play.google.com/console

### 3.1 Uygulamayı oluştur
- [ ] **Create app** → Ad: **Odyssey Journal** → Varsayılan dil: **English (United States)** →
      **App** → **Free** → iki beyan kutusu → **Create**

### 3.2 Dashboard → "Set up your app" (sırayla)
- [ ] **Privacy policy:** `https://odysseyjournal.app/privacy-policy`
- [ ] **App access:** "All or some functionality is restricted" → demo hesap bilgileri
- [ ] **Ads:** No
- [ ] **Content rating:** e-posta gir → kategori **Social / Communication** → kullanıcılar etkileşiyor mu:
      **Yes** → konum paylaşılıyor mu: **Yes** → şiddet, cinsellik vb.: **No**
- [ ] **Target audience:** 13+ (çocuklara yönelik değil)
- [ ] **News app:** No
- [ ] **Data safety:**
  - Toplanan: e-posta, ad, kullanıcı ID, fotoğraflar, hassas konum, mesajlar, diğer kullanıcı içeriği, çökme kayıtları
  - Aktarımda şifreli: **Yes**
  - Kullanıcı silme isteyebilir: **Yes** → URL: `https://odysseyjournal.app/delete-account`
- [ ] **Government / Financial / Health:** hepsi No

### 3.3 Mağaza sayfası — Grow → Store presence → Main store listing
- [ ] Kısa açıklama (80 karakter) + uzun açıklama: `STORE_LISTING.md`
- [ ] **App icon:** `mockup_feature/play-icon-512.png`
- [ ] **Feature graphic:** `mockup_feature/feature-graphic/feature-graphic-en.png`
- [ ] **Phone screenshots:** `mockup_feature/android/en/` (8 görsel, sırayla)
- [ ] **Manage translations → Turkish:** `mockup_feature/android/tr/` + `feature-graphic-tr.png` + Türkçe metin
- [ ] **Manage translations → diğer 10 dil** (dil kodları `STORE_LISTING.md`): Short description + Full description
      (+ release notes: What's New). Görsel yüklemeyin; varsayılan (EN) görseller gösterilir.

### 3.4 Dahili test (Internal testing)
- [ ] **Test → Internal testing → Create new release**
- [ ] "Play App Signing" sorusu → **Continue**
- [ ] `app-release.aab` yükle → **Save → Review → Start rollout**
- [ ] **Testers** sekmesi → e-posta listesi oluştur, kendi mailini ekle → **opt-in linkinden** telefona kur

### 3.5 Production'a geçiş
- Hesap **kişisel** ve **Kasım 2023'ten sonra** açıldıysa: Google önce **12 test kullanıcılı,
  14 gün süren kapalı test** ister. Dashboard'da bu şart görünürse oturuma söyleyin, birlikte kurulur.
- Görünmüyorsa: **Production → Create release** → aynı AAB → gönder.

---

## Dosya referansı

| Ne | Nerede |
|---|---|
| iOS ekran görüntüleri (1290×2796) | `mockup_feature/ios/en/`, `mockup_feature/ios/tr/` |
| Android ekran görüntüleri (1080×1920) | `mockup_feature/android/en/`, `mockup_feature/android/tr/` |
| Feature graphic (1024×500) | `mockup_feature/feature-graphic/` |
| Play ikonu (512×512) | `mockup_feature/play-icon-512.png` |
| Mağaza metinleri (12 dil) | `STORE_LISTING.md` |
| Yasal metinler | `WEBSITE_LEGAL_DOCS.md`, `PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md` |
| Genel durum, build/test, anahtarlar, sıradaki işler | `FINALIZE.md` |

`mockup_feature/` git'e girmiyor (büyük görsel dosyaları); yalnızca bu bilgisayarda duruyor —
yedeklemeyi unutmayın.
