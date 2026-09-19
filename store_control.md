# Odyssey Journal — Mağaza Kontrol Listesi

**Oluşturulma:** 2026-09-19
**Ne işe yarar:** App Store ve Google Play'e yayın için adım adım yapılacaklar. Sırayla gidin;
takıldığınız ekranın adını yazmanız yeterli.

---

## 0. Web sitesi linkleri — ÖNCE BUNLAR YAYINDA OLMALI

Web sitesi: **https://odysseyjournal.app** (GitHub Pages kullanılmıyor.)

Mağaza formlarında kullanılacak adresler (projede zaten bu adresler geçiyor —
`STORE_LISTING.md`, `DEPLOYMENT_GUIDE.md`):

| Ne için | Adres |
|---|---|
| Web sitesi / Marketing URL | `https://odysseyjournal.app` |
| Gizlilik Politikası (Privacy Policy) | `https://odysseyjournal.app/privacy-policy` |
| Kullanım Şartları (Terms) | `https://odysseyjournal.app/terms` |
| Destek (Support URL) | `https://odysseyjournal.app/support` |
| Hesap silme bilgisi (Play istiyor) | `https://odysseyjournal.app/privacy-policy` (sayfada "Account Deletion" bölümü olmalı) |

- Metinler hazır: `WEBSITE_LEGAL_DOCS.md` (gizlilik + şartlar), `PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md`.
- **Gizlilik sayfasında hesap silme anlatılmalı:** "Uygulama içinde Ayarlar → Hesap → Hesabı Sil;
  ya da privacy@odysseyjournal.app adresine yazın." Google Play bu linki ayrıca soruyor.
- `/support` sayfası yoksa, en azından destek e-postasını (support@odysseyjournal.app) gösteren
  basit bir sayfa yeterli. Apple Support URL'nin açılmasını şart koşuyor.
- Site yayına alınınca bu 4 adresin açıldığını kontrol edin (oturuma söylerseniz o da kontrol eder).

---

## 1. iOS build 7

- Build 7 alınıyor (`buildNumber: "7"`), yeni Supabase anahtarı (`sb_publishable_…`) içinde.
- TestFlight'ta gelince kontrol:
  - [ ] Giriş yapılıyor
  - [ ] Akış (feed) yükleniyor
  - [ ] Mesajlar çalışıyor
  - [ ] Gönderi paylaşılabiliyor
  - [ ] Ayarlar → Hesap: 2. ve 3. satırın sağında ikon yok, altta "Derleme 7"
  - [ ] Profil, İtalyanca: "SEGUACI", Almanca: "ABONNENTEN"

## 2. Push bildirimi testi

Admin2'nin şifresi hatırlanmıyor → **review demo hesabıyla** yapın:

1. Android telefonda **demo hesapla** giriş yapın.
2. **Admin'in** bir gönderisini beğenin (kendi gönderinizi beğenmek bildirim üretmez — bilerek).
3. 1 dakika içinde Admin'in iPhone'una bildirim gelmeli.
4. Gelmezse oturuma haber verin; kuyruğu kontrol eder.

---

## 3. App Store Connect (build 7 "Ready to Submit" olunca)

appstoreconnect.apple.com → **Apps → Odyssey Journal**

### 3.1 App Information (sol menü)
- [ ] **Category:** Primary **Travel**, Secondary **Social Networking**
- [ ] **Content Rights:** "Üçüncü taraf içerik gösteriyor mu?" → **Yes** (kullanıcı gönderileri) → onayla
- [ ] **Age Rating → Edit:** User-Generated Content → **Yes**, Messaging/Chat → **Yes**, diğer her şey
      **No / None**. (Muhtemelen 13+ çıkar.)
- [ ] Sağ üstteki dil menüsünden **Turkish** ekle

### 3.2 App Privacy → Get Started → "Veri topluyor musunuz?" → **Yes**

| Veri türü | Amaç | Kullanıcıya bağlı | Takip (tracking) |
|---|---|---|---|
| Name, Email Address | App Functionality | Evet | Hayır |
| Photos or Videos, Other User Content | App Functionality | Evet | Hayır |
| Precise Location | App Functionality | Evet | Hayır |
| User ID | App Functionality | Evet | Hayır |
| Crash Data | App Functionality | Hayır | Hayır |

- [ ] **Privacy Policy URL:** `https://odysseyjournal.app/privacy-policy`

### 3.3 Pricing and Availability
- [ ] **Free**, tüm ülkeler

### 3.4 "iOS App 1.0" sayfası — English (U.S.)
- [ ] **Screenshots → iPhone 6.9" Display:** `mockup_feature/ios/en/` içindeki 8 görsel, **01'den 08'e sırayla**
      (iPad bölümü çıkmamalı — iPad desteği kapatıldı)
- [ ] **Promotional Text / Description / Keywords:** `STORE_LISTING.md`'den
- [ ] **Support URL:** `https://odysseyjournal.app/support`
- [ ] **Marketing URL (isteğe bağlı):** `https://odysseyjournal.app`
- [ ] **Build:** "+" → **7**. Şifreleme sorusu çıkmaz (`ITSAppUsesNonExemptEncryption: false` kodda).

### 3.5 Aynı sayfa — Turkish
- [ ] `mockup_feature/ios/tr/` görselleri + `STORE_LISTING.md`'deki Türkçe metin

### 3.6 App Review Information
- [ ] **Sign-in required:** ✓ → review demo hesabının e-postası ve şifresi
- [ ] İletişim bilgileri (ad, telefon, e-posta)
- [ ] **Notes** kutusuna:

```
Users can report posts and block users (post menu → Report / Block).
Community Guidelines: Settings → Legal & Community.
Account deletion: Settings → Account → Delete Account.
```

### 3.7 Version Release
- [ ] **Manually release this version** (önerilen — onaydan sonra yayın zamanını siz seçersiniz)

### 3.8 Gönder
- [ ] Sağ üstte **Add for Review** → **Submit**

---

## 4. Android — AAB'yi Android Studio'dan alma

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

## 5. Google Play Console

play.google.com/console

### 5.1 Uygulamayı oluştur
- [ ] **Create app** → Ad: **Odyssey Journal** → Varsayılan dil: **English (United States)** →
      **App** → **Free** → iki beyan kutusu → **Create**

### 5.2 Dashboard → "Set up your app" (sırayla)
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
  - Kullanıcı silme isteyebilir: **Yes** → URL: `https://odysseyjournal.app/privacy-policy`
- [ ] **Government / Financial / Health:** hepsi No

### 5.3 Mağaza sayfası — Grow → Store presence → Main store listing
- [ ] Kısa açıklama (80 karakter) + uzun açıklama: `STORE_LISTING.md`
- [ ] **App icon:** `mockup_feature/play-icon-512.png`
- [ ] **Feature graphic:** `mockup_feature/feature-graphic/feature-graphic-en.png`
- [ ] **Phone screenshots:** `mockup_feature/android/en/` (8 görsel, sırayla)
- [ ] **Manage translations → Turkish:** `mockup_feature/android/tr/` + `feature-graphic-tr.png` + Türkçe metin

### 5.4 Dahili test (Internal testing)
- [ ] **Test → Internal testing → Create new release**
- [ ] "Play App Signing" sorusu → **Continue**
- [ ] `app-release.aab` yükle → **Save → Review → Start rollout**
- [ ] **Testers** sekmesi → e-posta listesi oluştur, kendi mailini ekle → **opt-in linkinden** telefona kur

### 5.5 Production'a geçiş
- Hesap **kişisel** ve **Kasım 2023'ten sonra** açıldıysa: Google önce **12 test kullanıcılı,
  14 gün süren kapalı test** ister. Dashboard'da bu şart görünürse oturuma söyleyin, birlikte kurulur.
- Görünmüyorsa: **Production → Create release** → aynı AAB → gönder.

---

## 6. Eski (legacy) Supabase anahtarlarını kapatma

Supabase paneline oturumun erişimi yok → **bu adımı siz yaparsınız**, tek düğme.

**Ne zaman:** iOS build 7 **ve** Play'den kurulan yeni AAB telefonda sorunsuz çalıştıktan sonra
(giriş, akış, mesajlar).

**Nerede:** Supabase Dashboard → projeyi seç → **Project Settings → API Keys** → **Legacy API Keys**
sekmesi → **"Disable JWT-based API keys"**

**Sonra:** Oturuma haber verin; eski anahtarın reddedildiğini, yenisinin çalıştığını salt-okuma
testiyle kontrol eder. Sorun çıkarsa aynı yerden tekrar açılır (geri alınabilir).

> Kapattıktan sonra TestFlight'taki eski build'ler (6 ve öncesi) çalışmaz — beklenen durum.
> Push bildirimleri etkilenmez (19 Eylül'den beri anahtarsız, doğrudan veritabanından gidiyor).

---

## 7. fal.ai anahtarı

- [x] `.env.local`'dan silindi
- [ ] **fal.ai panelinde de iptal edin:** Dashboard → Keys → o anahtar → Delete (sohbette açık yazıldı)

---

## Dosya referansı

| Ne | Nerede |
|---|---|
| iOS ekran görüntüleri (1290×2796) | `mockup_feature/ios/en/`, `mockup_feature/ios/tr/` |
| Android ekran görüntüleri (1080×1920) | `mockup_feature/android/en/`, `mockup_feature/android/tr/` |
| Feature graphic (1024×500) | `mockup_feature/feature-graphic/` |
| Play ikonu (512×512) | `mockup_feature/play-icon-512.png` |
| Mağaza metinleri (EN + TR) | `STORE_LISTING.md` |
| Yasal metinler | `WEBSITE_LEGAL_DOCS.md`, `PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md` |
| Genel durum ve teknik geçmiş | `FINALIZE.md` |

`mockup_feature/` git'e girmiyor (büyük görsel dosyaları); yalnızca bu bilgisayarda duruyor —
yedeklemeyi unutmayın.
