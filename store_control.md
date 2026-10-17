# Odyssey Journal — Mağaza Kontrol Listesi

**Oluşturulma:** 2026-09-19
**Ne işe yarar:** Yalnızca App Store ve Google Play'e yayın adımları. Sırayla gidin;
takıldığınız ekranın adını yazmanız yeterli. Build, test, anahtar ve genel durum → `FINALIZE.md`.

---

## 0. Web sitesi linkleri — ✅ yayında

Web sitesi: **https://odysseyjournal.app** (GitHub Pages kullanılmıyor.)

Mağaza formlarında kullanılacak adresler (projede zaten bu adresler geçiyor —
`STORE_LISTING.md`):

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

> **✅ 6 Ekim akşam gönderildi: iOS 1.0, build 10, "Waiting for Review".** Aşağıdaki liste yapıldı; farklar ve dersler
> `FINALIZE.md` "6 Ekim akşam — App Store Connect" tablosunda. Özet:
> - Yaş override **18+**.
> - Çin anakarası kapalı.
> - Diğer dillerde ad dile göre (`Odyssey Journal` başkasında).
> - Görsel artık **6.3" (1206×2622)**: `mockup_feature/ios-6.3/`.
> - Gizlilik URL'si **her yerelleştirmede** ayrı.
> - Build seçimi "+ → 10".
>
> Sonraki sürümde (1.0.1+) bu sayfada yalnız build, "What's New" ve gerekiyorsa görseller değişir.

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
| Emails or Text Messages (uygulama içi mesajlar) | App Functionality | Evet | Hayır |
| Precise Location (gönderi konumu + ev konumu) | App Functionality | Evet | Hayır |
| Search History (aramalar sunucuda saklanıyor, `search_history`) | App Functionality | Evet | Hayır |
| User ID | App Functionality | Evet | Hayır |
| Crash Data | App Functionality | **Evet** (Sentry'ye kullanıcı ID'si gidiyor) | Hayır |
| Performance Data (Sentry, işlemlerin %20'si) | App Functionality | Evet | Hayır |

> 4 Ekim düzeltmesi: önceki tabloda mesajlar, arama geçmişi ve performans verisi yoktu, çökme verisi "bağlı değil"
> işaretliydi. Sentry kullanıcı ID'siyle kayıt tuttuğu için "bağlı". Gizlilik politikası bunların hepsini sayıyor.

- [ ] **Privacy Policy URL:** `https://odysseyjournal.app/privacy-policy`

> Gönderi/yorum metni ve fotoğraflar moderasyon için OpenAI'a gidiyor. OpenAI bizim adımıza işleyen bir
> hizmet sağlayıcı: tabloda ayrı bir satır gerekmez (Photos, Other User Content zaten var), "tracking"
> değil. Uygulama izni ilk paylaşımdan önce soruyor (5.1.2(i)); gizlilik politikasında OpenAI adıyla
> geçmeli (`arif_todo.md` §6) — **gönderimden önce sitede olsun.**

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
      Description, Keywords, What's New alanları + `mockup_feature/ios/<dil>/` 8 görsel (01→08).

### 1.6 App Review Information
- [ ] **Sign-in required:** ✓ → `review@odysseyjournal.app` + şifresi (hesabı hazırlama: `arif_todo.md` §3b)
- [ ] İletişim bilgileri (ad, telefon, e-posta)
- [ ] **Notes** kutusuna:

```
Users can report posts and block users (post menu → Report / Block).
Community Guidelines: Settings → Legal & Community.
Account deletion: Settings → Account → Delete Account.
Post text, photos and comments are checked by OpenAI's Moderation API before they are
published; flagged content is never posted. The app asks for permission first (App Store
5.1.2(i)); it can be withdrawn in Settings → Legal & Community → AI content check.
Reported content is reviewed by the developer in the in-app moderation panel.
```

### 1.7 Version Release
- [ ] **Manually release this version** (önerilen — onaydan sonra yayın zamanını siz seçersiniz)

### 1.8 Gönder
- [x] ~~Sağ üstte **Add for Review** → **Submit**~~ — 6 Ekim gönderildi. 7 Ekim'de 2.1 bilgi isteği geldi, cevaplandı.
      **17 Ekim'de görüldü: onaylandı**, durum "Pending Developer Release".

### 1.9 Yayından önce (17 Ekim'de ASC'de görüldü)
- [ ] **DSA trader beyanı (AB):** ASC → **Business** → "Complete Compliance Requirements". Bu beyan olmadan Release'e
      basılsa bile uygulama **AB ülkelerinde görünmez**.
  - **"Trader değilim":** uygulama ücretsiz, reklamsız ve gelirsiz olduğu için önerilen seçenek bu. Adres gösterilmez;
    AB'deki kullanıcılar ürün sayfasında "geliştirici trader değil" notunu görür.
  - **"Trader":** ad, adres (Bayrampaşa), telefon ve e-posta AB mağazasında **herkese açık** görünür.
  - Gelir modeli eklenince (reklam, abonelik) beyan "trader" olarak güncellenmeli. O noktada şirket kurulmuş olursa
    şirketin bilgileri girilir (`FINALIZE.md` "★ 17 Ekim").
  - Beyanı Arif gönderir: bu bir hukuki beyan.
- [ ] **Yaş derecelendirmesi, yeni sosyal medya soruları:** ASC duyurusu "Review New Social Media Questions on Age
      Ratings". App Information → Age Rating → soruları cevapla (oturum taslak çıkarır, Arif onaylar). Cevaplar 18+
      kararıyla tutarlı olmalı.
- [ ] **Release This Version:** Android üretimle **aynı gün** basılır (§3.6). "Pending Developer Release" durumu
      süresiz bekleyebilir; Apple 30 gün sonra yalnızca hatırlatma e-postası gönderir. Release'ten önce veritabanı
      temizliği bitmiş olmalı (`FINALIZE.md` "★ 17 Ekim").
- Uygulama ID'si `6809580456`. Mağaza adresi: `https://apps.apple.com/app/id6809580456`. Site bu adresi yayın günü
  kullanır.

---

## 2. Android — AAB EAS'ten

Android Studio ve `.jks` **yok**. AAB'yi oturum alır: `eas build --platform android --profile production`
(versionCode `app.config.ts`'ten). İmza (upload) anahtarı EAS'te duruyor; EAS'in kendi oluşturduğu, yedeği
`eas credentials`'tan indirilebilir. İlk yüklemede Play App Signing açılır: Google uygulamayı kendi anahtarıyla
imzalar, EAS'teki anahtar yalnız "upload key" olur. (Bu bilgisayarda yerel build Windows'un 260 karakter yol
sınırına takılıyor — `FINALIZE.md` "Android build notu".)

> ⚠️ 19 Eylül'de EAS'ten alınan eski AAB'yi (`324319a5`, versionCode 1, legacy Supabase anahtarı) **yüklemeyin**.
> Aynı EAS anahtarıyla imzalı ama eski kod.
>
> Her yeni Play yüklemesinden önce `android.versionCode` artırılmalı (Play aynı kodu ikinci kez almaz).

---

## 3. Google Play Console

play.google.com/console

### 3.1 Uygulamayı oluştur
- [ ] **Create app** → Ad: **Odyssey Journal** → Varsayılan dil: **English (United States)** →
      **App** → **Free** → iki beyan kutusu → **Create**

### 3.2 Dashboard → "Set up your app" (sırayla)
- [ ] **Privacy policy:** `https://odysseyjournal.app/privacy-policy`
- [ ] **App access:** "All or some functionality is restricted" → `review@odysseyjournal.app` + şifresi
- [ ] **Ads:** No
- [ ] **Content rating:** e-posta gir → kategori **Social / Communication** → kullanıcılar etkileşiyor mu:
      **Yes** → konum paylaşılıyor mu: **Yes** → şiddet, cinsellik vb.: **No**
- [x] **Target audience:** ~~13+~~ → **yalnız 18+** (5 Ekim kararı: 13-17 seçilince Play Aile politikasını istiyor)
- [ ] **News app:** No
- [ ] **Data safety:**
  - Toplanan: e-posta, ad, kullanıcı ID, fotoğraflar, hassas konum, mesajlar, diğer kullanıcı içeriği,
    **uygulama içi arama geçmişi** (App activity), çökme kayıtları + **tanılama** (Diagnostics, Sentry),
    **cihaz veya diğer kimlikler** (push bildirim token'ı).
    Mikrofon/ses **yok** (29 Eylül'de `RECORD_AUDIO` izni kaldırıldı)
  - Aktarımda şifreli: **Yes**
  - Kullanıcı silme isteyebilir: **Yes** → URL: `https://odysseyjournal.app/delete-account`
  - Paylaşılan (shared): **No** — OpenAI (moderasyon), Sentry, Expo bizim adımıza işleyen hizmet
    sağlayıcılar; Play'in tanımında bu "sharing" sayılmaz
- [ ] **Government / Financial / Health:** hepsi No

### 3.3 Mağaza sayfası — Grow → Store presence → Main store listing
- [ ] Kısa açıklama (80 karakter) + uzun açıklama: `STORE_LISTING.md`
- [ ] **App icon:** `mockup_feature/play-icon-512.png`
- [ ] **Feature graphic:** `mockup_feature/feature-graphic/feature-graphic-en.png`
- [ ] **Phone screenshots:** `mockup_feature/android/en/` (8 görsel, sırayla)
- [ ] **Manage translations → Turkish:** `mockup_feature/android/tr/` + `feature-graphic-tr.png` + Türkçe metin
- [ ] **Manage translations → diğer 10 dil** (dil kodları `STORE_LISTING.md`): Short description + Full description
      (+ release notes: What's New) + `mockup_feature/android/<dil>/` 8 görsel + `feature-graphic-<dil>.png`.

### 3.4 Dahili test (Internal testing)
- [ ] **Test → Internal testing → Create new release**
- [ ] "Play App Signing" sorusu → **Continue**
- [ ] EAS'ten indirilen `.aab`'yi yükle → **Save → Review → Start rollout**
- [ ] **Testers** sekmesi → e-posta listesi oluştur, kendi mailini ekle → **opt-in linkinden** telefona kur

### 3.5 Production'a geçiş
- Hesap **kişisel** ve **Kasım 2023'ten sonra** açıldıysa: Google önce **12 test kullanıcılı,
  14 gün süren kapalı test** ister. Dashboard'da bu şart görünürse oturuma söyleyin, birlikte kurulur.
- Görünmüyorsa: **Production → Create release** → aynı AAB → gönder.
- **Durum (17 Ekim):** şart bu uygulamaya uygulanıyor. Dashboard'da "12 test kullanıcısı kesintisiz olarak 11 gündür
  kayıtlı" yazıyor. 14. gün ~20 Ekim; o gün **Üretime başvur** düğmesi açılır.
  - Arif'in kararı: kapalı test bitene kadar **hiçbir şeye dokunulmaz** (veri temizliği, yeni sürüm, liste değişikliği yok).
  - Başvuru formu kapalı testle ilgili soruları içerir: test kullanıcıları nasıl bulundu, nasıl bir etkileşim oldu,
    geri bildirimler, yapılan düzeltmeler, uygulamanın üretime neden hazır olduğu. Oturum Chrome'da taslağı hazırlar,
    **Arif gönderir**. Google incelemesi birkaç gün ile ~1 hafta sürer.

### 3.6 Yayın günü (üretim onayı geldikten sonra)
- [ ] Önce veritabanı temizliği (`FINALIZE.md` "★ 17 Ekim" → temizlik).
- [ ] Maps "Odyssey Android Maps SDK" anahtarından **debug SHA-1**'i kaldır.
- [ ] (İsteğe bağlı) Mağaza girişinin 11 dil çevirisi (§3.3).
- [ ] **Production → Create release** → vc4'ü kütüphaneden seç (yeni build gerekmez; temizlik yalnız veri) → ülkeler
      kapalı testle aynı → gönder.
- [ ] Aynı gün ASC'de **Release This Version** (§1.9).
- [ ] İki mağaza adresi siteye APP_SYNC ile gider: `APP_STORE_URL` / `PLAY_STORE_URL` → `--release` → deploy.
      Play adresi: `https://play.google.com/store/apps/details?id=com.odysseyjournal.app`.

---

## Dosya referansı

| Ne | Nerede |
|---|---|
| iOS ekran görüntüleri (1290×2796) | `mockup_feature/ios/<dil>/` — 12 dil |
| Android ekran görüntüleri (1080×1920) | `mockup_feature/android/<dil>/` — 12 dil |
| Feature graphic (1024×500) | `mockup_feature/feature-graphic/feature-graphic-<dil>.png` — 12 dil |
| Play ikonu (512×512) | `mockup_feature/play-icon-512.png` |
| Mağaza metinleri (12 dil) | `STORE_LISTING.md` |
| Yasal metinler | **Site deposu** `odyssey-journal-website/content/legal/` (12 dil; kaynak orası). Buradaki eski kopyalar `docs/archive/`'de |
| Genel durum, build/test, anahtarlar, sıradaki işler | `FINALIZE.md` |

`mockup_feature/` git'e girmiyor (büyük görsel dosyaları); yalnızca bu bilgisayarda duruyor —
yedeklemeyi unutmayın.
