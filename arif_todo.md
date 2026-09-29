# Arif'in yapılacaklar listesi

**Güncelleme:** 2026-09-29
Yalnızca **senin** yapman gereken işler. Kategoriler kabaca yapılma sırasına göre dizildi.
Ayrıntı gerektiğinde parantezdeki dosyaya bak: `FINALIZE.md` (genel durum), `store_control.md`
(mağaza adımları), `STORE_LISTING.md` (mağaza metinleri). Bir işi bitirince oturuma söyle;
oturum doğrulamasını yapıp bu listeyi ve FINALIZE'ı günceller.

**Sırayla gidersen:** 0 (✅, yalnız e-posta testi kaldı) → 1 (fal anahtarı, 2 dk)
→ 2 (build'ler; iOS ~1 Ekim EAS kredisi, Android hazır) → 3 (cihaz testleri) → 4-5
(mağaza formları; build beklemeden doldurulabilir) → 6 (site metinleri) → 7 (yayından hemen önce) →
8 (acelesi yok).

> Kodda bekleyen iş yok. **Android AAB'yi artık oturum EAS ile alacak** (29 Eylül: bu bilgisayarda yerel
> Android build Windows'un 260 karakter yol sınırına takılıyor — aşağıda §2).

---

## 0. 29 Eylül — build 8 öncesi panel işleri ✅

- [x] ~~**0.1 Supabase SMTP** (Google Workspace)~~ ✅ 29 Eylül. Workspace'te tek kullanıcı
      `hello@odysseyjournal.app`; `support@`, `privacy@`, `noreply@`, `review@` onun takma adları.
      SMTP'de giriş hello@ + App password, gönderen `noreply@`.
  - [x] ~~Ekip dışı adresle kayıt + şifre sıfırlama e-postası~~ ✅ 29 Eylül (build 7 ile): ikisi de
        noreply@'dan geldi. Build 7'de sıfırlama linki "Unmatched route" veriyor — ekran
        (`app/reset-password.tsx`) build 7'den sonra eklendi, build 8'de gelir → §3'te tekrar dene.
        Onay linki artık sitenin **e-posta onaylandı** sayfasına, kullanıcının dilinde gidiyor
        (`/tr/email-confirmed` …; Supabase Redirect URLs'e `https://odysseyjournal.app/**` eklendi).
- [x] ~~**0.2 OpenAI anahtarı**~~ ✅ — oturum doğruladı: `moderate-content` anahtar kontrolünü geçiyor.
      (Moderasyon 1 Mart 2026'da `1bdc210` "Security is done" ile eklenmişti.)
- [x] ~~**0.3 Firebase**~~ ✅ — `google-services.json` kökte (git dışı), FCM V1 anahtarı expo.dev'de;
      oturum `android/`'i yeniden üretti.
- [x] ~~**0.4 Sentry**~~ ✅ — oturum yaptı: org `gultas-software`, proje `odyssey-journal`
      (`app.config.ts`'te sabit), Organization Token "EAS build (source maps)" → EAS production'da
      `SENTRY_AUTH_TOKEN` (secret) + yerelde `.env.sentry-build-plugin` (git/EAS dışı).

---

## 1. Önce bunlar — güvenlik ve anahtarlar

- [x] ~~**fal.ai anahtarını iptal et**~~ ✅ 29 Eylül — iki anahtar da (uygulama + site) silindi
- [x] ~~Google Maps: iki yeni kısıtlı anahtar, `.env`, günlük kota 300, bütçe uyarısı~~ ✅ 19 Eylül
- [x] ~~Supabase Redirect URL (`odysseyjournal://reset-password`)~~ ✅ 19 Eylül
- [x] ~~Eski `send-push-notifications` fonksiyonunu sil~~ ✅ 19 Eylül
- [x] ~~031 deploy onayı~~ ✅ 19 Eylül

> Bundan sonra `supabase/` altında bir değişiklik push edilince deploy **senin onayını bekler**:
> GitHub → Actions → "Deploy Supabase" → *Review deployments* → **Approve**.

---

## 2. Build'ler

- [ ] **iOS build 8** — EAS kredisi yenilenince (expo.dev → Billing/Usage'dan tarihi kontrol et)
      `eas build --platform ios --profile production` → TestFlight. 29 Eylül dahil tüm düzeltmeleri
      içerir. Önce §0.4'teki Sentry değişkenlerini EAS'e gir (yoksa build yine geçer, yalnız çökme
      raporları okunmaz).
      (FINALIZE "Engel: Expo (EAS) build kredileri")
- [ ] **Android AAB — oturum alır, EAS'ten (~1 Ekim kota yenilenince). Android Studio'ya gerek yok.**
      Neden: 29 Eylül'de bu bilgisayarda yerel build denendi; C++ derleme adımı Windows'un 260 karakterlik
      dosya yolu sınırına takılıyor (proje `C:\oj`'ye taşınsa bile 269). EAS Linux'ta derliyor ve EAS'te
      duran imza (upload) anahtarını kullanıyor → `.jks` oluşturma/yedekleme derdi yok.
      Build oturumunda oturuma "iOS ve Android build'lerini alalım" demen yeterli.
  - [ ] İlk Play yüklemesinden sonra: Play Console → Test and release → App integrity → App signing
        sayfasındaki **iki** SHA-1'i (App signing key + Upload key) Google Cloud'da "Odyssey Android Maps
        SDK" anahtarına **+ Add** ile ekle (paket `com.odysseyjournal.app`) — oturum yanında yapar
  - [ ] EAS'ten 19 Eylül'de alınmış eski AAB'yi (`324319a5`) **yükleme**

---

## 3. Cihazda test (yeni build'lerle)

TestFlight build 7'de avatar yükleme artık hata verir — beklenen, build 8'de düzelir.

**Güvenlik düzeltmeleri (19 Eylül)**
- [ ] Profil fotoğrafını değiştir → yeni avatar görünüyor
- [ ] Bir gönderiyi düzenle (metin + yeni fotoğraf) → kaydediliyor
- [ ] Profil sekmesinden çıkış yap → başka hesapla gir → önceki hesabın bildirimleri **gelmiyor**
- [ ] Giriş ekranı → Şifremi unuttum → e-postadaki linke telefonda bas → uygulama açılıp yeni
      şifre soruyor → yeni şifreyle giriş (Admin2'nin unutulan şifresi de böyle sıfırlanabilir)
- [ ] **Test hesabıyla** hesap sil → Supabase Dashboard → Storage → `posts/<uid>/` ve
      `avatars/<uid>/` klasörleri boşalmış mı
- [ ] Bir kullanıcıyı engelle → o kullanıcı sana mesaj atamıyor
- [ ] Bir gönderiyi paylaş → link `odysseyjournal.app/?post=…` → ana sayfa açılıyor
- [ ] Profildeki seyahat haritası görseli yükleniyor (yeni Static Maps anahtarı)
- [ ] Android: harita ekranı açılıyor (yeni Maps SDK anahtarı)
- [ ] Başka bir kullanıcının profilinde günlük kartları: fotoğrafın altında yazıyı okunur kılan
      koyulaşan gradyan görünüyor mu (20 Eylül'de düzeltildi; eskiden cihazda hiç çizilmiyordu)

**Push bildirimi** (FINALIZE #2)
- [ ] Android'de review demo hesabıyla gir → Admin'in gönderisini beğen → Admin'in iPhone'una
      1 dakika içinde bildirim gelmeli. Gelmezse oturuma söyle (`push_notification_queue`'ya bakar).
      Kendi gönderini beğenmek bilerek bildirim üretmez.
- [ ] **Ters yön (29 Eylül, Firebase sonrası yeni AAB ile):** iPhone'dan Admin olarak demo hesabın
      gönderisini beğen → Android telefona bildirim gelmeli; durum çubuğundaki ikon beyaz pusula
      silueti olmalı (düz beyaz kare değil)

**29 Eylül değişiklikleri**
- [ ] Android ana ekran ikonu: arkasında gri-beyaz dama deseni **yok**, krem zemin üstünde pusula
      (eski kurulumu silip yeni AAB'yi kur; ikon önbelleği eskiyi gösterebilir)
- [ ] Telefon dili Türkçeyken: yeni gönderide kamera / galeri / konum izni soruları **Türkçe** (iOS)
- [ ] İlk gönderi ya da yorumda "İçerik güvenlik kontrolü" penceresi çıkıyor → "Şimdi değil" →
      gönderi/yorum paylaşılmıyor, yazdığın yorum kutuda duruyor → tekrar dene → "İzin ver" → paylaşılıyor
- [ ] Ayarlar → Yasal ve Topluluk → "Yapay zekâ içerik kontrolü" anahtarı açık; kapat → yeni
      gönderide pencere yeniden çıkıyor
- [ ] Çıkış yap, uygulamayı tamamen kapatıp aç → tanıtım ekranları değil doğrudan giriş ekranı
- [ ] §0.1'deki ekip dışı adresle kayıt + şifre sıfırlama testi

**Dil turu** (FINALIZE A4 — uygulamayı **kapatmadan** dil değiştirerek)
- [ ] Şu ekranlar açıkken dili değiştir; metin anında yeni dile geçmeli: Topluluk Kuralları,
      Yeni Gönderi (tarih seçici, kategoriler), Şifremi Unuttum, Ayarlar profil kartı, Profil
      biniş kartı, Keşfet, dil seçme penceresi
- [ ] IT/DE profilde takipçi sayacı: "Seguaci" / "Abonnenten"
- [ ] Her dilde: o dilin dışında kalmış metin ya da boş alan var mı

**Arapça (RTL)** (FINALIZE A5)
- [ ] Dili Arapça yap → uygulamayı **tamamen kapatıp aç** → rozetler, + düğmesi, kapatma
      düğmeleri doğru kenarda mı, oklar doğru yöne mi bakıyor

---

## 4. App Store Connect (`store_control.md` §1)

- [ ] App Information: kategori **Travel** + **Social Networking**, Content Rights → Yes
- [ ] **Yaş derecelendirmesi anketi — dürüst doldur:** kullanıcı içeriği **Yes**, mesajlaşma **Yes**
      (4+ değil; muhtemelen 13+ çıkar)
- [ ] App Privacy tablosu (`store_control.md` §1.2)
- [ ] Fiyat: Free, tüm ülkeler
- [ ] 12 dil ekle; her dile `STORE_LISTING.md`'deki Subtitle, Promotional Text, Description,
      Keywords, What's New
- [ ] Her dile kendi ekran görüntüleri: `mockup_feature/ios/<dil>/` (01→08 sırayla;
      klasörler `en tr es fr de pt it ru ja ko zh ar`)
- [ ] Support / Marketing / Privacy URL'leri
- [ ] App Review Information: demo hesap + iletişim + Notes (`store_control.md` §1.6; 29 Eylül'de
      OpenAI moderasyon satırı eklendi)
- [ ] Version Release: **Manually release**
- [ ] Build **8**'i seç → Add for Review → Submit (build 7'yi gönderme)

---

## 5. Google Play Console (`store_control.md` §3)

- [ ] Uygulamayı oluştur (varsayılan dil English (United States))
- [ ] Set up your app: privacy policy, app access (demo hesap), ads: No, content rating
      (kullanıcılar etkileşiyor: Yes), hedef kitle 13+, data safety (silme URL'si dahil)
- [ ] Mağaza sayfası: EN metin + ikon + feature graphic + 8 görsel; sonra Manage translations ile
      diğer 11 dil: metin (`STORE_LISTING.md`) + `mockup_feature/android/<dil>/` + `feature-graphic-<dil>.png`
- [ ] Dahili test: AAB'yi yükle, Play App Signing → Continue, kendini test kullanıcısı olarak ekle
- [ ] **İlk yüklemeden sonra:** Play Console → Test and release → App integrity → App signing →
      *App signing key certificate* SHA-1'ini Google Cloud'daki Android Maps SDK anahtarına ekle.
      **Eklenmezse Play'den kurulan uygulamada harita boş gelir.**
- [ ] Dashboard'da "12 test kullanıcısı / 14 gün kapalı test" şartı çıkarsa oturuma söyle,
      birlikte kurarız

---

## 6. Web sitesi (odysseyjournal.app)

- [x] ~~`/terms`, `/delete-account` eski düzeltmeleri~~ ✅
- [x] ~~Gizlilik politikasında OpenAI, Google statik harita, OSM kaldırma, tablo satırı, aktarım listesi
      (12 dil); `/delete-account` "Verilerimi İste" paragrafı (12 dil); yeni `/email-confirmed` sayfası
      (12 dil)~~ ✅ 29 Eylül — oturum yaptı, sitenin kendi deposundan (`odyssey-journal-website`,
      `63b67be` → `npm run deploy`), canlıda doğrulandı. Ayrıntı sitenin `WORKLOG.md`'sinde.
- [x] ~~GitHub Pages kapat~~ ✅ 29 Eylül (`arifgultas.github.io/odyssey-journal` artık 404)
- [ ] **Site ↔ uygulama uyum turu (site projesinde, ayrı oturum):** site deposundaki
      `APP_SYNC_2026-09-29.md` bugün yapılanları ve açık bulguları (Keychain iddiası, "prescreen" cümlesi,
      FCM/APNs, PITR yedek iddiası …) listeliyor; en altta oturuma yapıştırılacak hazır metin var.
      Yayından (App Store gönderiminden) önce bitmeli.
- [ ] Uygulama yayına girince ana sayfadaki **App Store / Google Play** butonlarına gerçek mağaza
      linklerini koy (şu an `#download`). Sitenin `WORKLOG.md` → "Yapacaklarımız" adımları anlatıyor;
      oturuma linkleri vermen yeterli.

---

## 7. Yayından hemen önce / yayından sonra

- [ ] **Supabase eski (legacy) anahtarları kapat** — build 8 ve yeni AAB cihazda sorunsuz
      çalıştıktan sonra: Dashboard → Project Settings → API Keys → Legacy API Keys →
      "Disable JWT-based API keys" (geri alınabilir). Oturum sonra salt-okuma testiyle doğrular.
      Eski build'ler (iOS ≤ 6, EAS AAB `324319a5`) o andan sonra çalışmaz.
- [ ] **Eski Google Maps anahtarlarını sil** — yeni build'lerde harita çalışınca: Google Cloud →
      Credentials → `AIzaSyCEGo…` ile başlayan (ve varsa `AIzaSyDzxS…`) → ⋮ → Delete.
      TestFlight 7'deki haritalar durur — beklenen.
- [ ] **Debug SHA-1'ini kaldır** — "Odyssey Android Maps SDK" anahtarından
      `5E:8F:16:06:…:F6:25` satırını sil (React Native şablonunda herkeste aynı olan anahtar)

---

## 8. Süreç ve sonraki sürüm (acil değil)

- [ ] **`mockup_feature/` klasörünü yedekle** (git'e girmiyor; 12 dilin mağaza görselleri yalnız bu
      bilgisayarda — ~200 dosya)
- [ ] **Veri talepleri:** privacy@ adresine "verilerimin kopyası" isteği gelirse, göndermeden önce
      talebin hesabın **kendi e-posta adresinden** geldiğini kontrol et
- [ ] Paket güncellemeleri (`npm audit`, expo-doctor'daki 16 uyuşmazlık): **yayından önce yapma**,
      1.0'dan sonra ayrı bir build + test turuyla
- [ ] 1.1 için: Google / Apple ile giriş (Apple Services ID + key, Google OAuth client →
      Supabase Providers; Apple kuralı: Google varsa Apple da olmalı)
