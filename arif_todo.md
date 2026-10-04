# Arif'in yapılacaklar listesi

**Güncelleme:** 2026-10-04
Yalnızca **senin** yapman gereken işler. Kategoriler kabaca yapılma sırasına göre dizildi.
Ayrıntı gerektiğinde parantezdeki dosyaya bak: `FINALIZE.md` (genel durum), `store_control.md`
(mağaza adımları), `STORE_LISTING.md` (mağaza metinleri). Bir işi bitirince oturuma söyle;
oturum doğrulamasını yapıp bu listeyi ve FINALIZE'ı günceller.

**Sırayla gidersen:** 0 (✅, yalnız e-posta testi kaldı) → 1 (fal anahtarı, 2 dk)
→ 2 (build'ler; iOS ~1 Ekim EAS kredisi, Android hazır) → 3 (cihaz testleri) → 4-5
(mağaza formları; build beklemeden doldurulabilir) → 6 (site metinleri) → 7 (yayından hemen önce) →
8 (acelesi yok).

> **4 Ekim: kodda bekleyen iş yok** — W1–W10 ve `032` bitti, `032` canlıda (deploy onayın için teşekkürler).
> Sırada build'ler (§2). **Android AAB'yi oturum EAS ile alır** (bu bilgisayarda yerel Android build Windows'un
> 260 karakter yol sınırına takılıyor).

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

- [x] ~~**`032` deploy onayı**~~ ✅ 4 Ekim — canlıda; Security Advisor 0 hata (kalan 7 uyarı bilerek)
- [ ] **Tek salt-okuma sorgusu (2 dk)** — Supabase → SQL Editor'a yapıştır → Run → çıkan tek satırı oturuma ilet.
      Oturum canlı veriyi kendisi okuyamıyor (izin sınıflandırıcısı reddetti). Hiçbir şeyi değiştirmez:
```sql
select jsonb_pretty(jsonb_build_object(
  'admins', (select jsonb_agg(coalesce(username, id::text)) from public.profiles where is_admin),
  'review_account', (select jsonb_build_object(
      'username', p.username, 'full_name', p.full_name, 'avatar', p.avatar_url is not null,
      'posts', (select count(*) from public.posts where user_id = u.id),
      'following', (select count(*) from public.follows where follower_id = u.id),
      'last_sign_in', u.last_sign_in_at)
    from auth.users u left join public.profiles p on p.id = u.id
    where u.email = 'review@odysseyjournal.app'),
  'maestro_test_account_exists', exists(select 1 from auth.users where email = 'explorer@odyssey.com'),
  'home_locations_moved', (select count(*) from public.user_home_locations),
  'profiles_home_location_left', (select count(*) from public.profiles where home_location is not null),
  'purge_job', (select schedule from cron.job where jobname = 'purge-push-queue')
)) as report;
```
      Beklenen: `admins` en az bir hesap (yoksa §3b'deki `is_admin` SQL'i), `profiles_home_location_left: 0`,
      `purge_job: "17 3 * * *"`, `maestro_test_account_exists: false` (true ise o hesap silinmeli — şifresi public repoda).
- [ ] **E-postanı kontrol et:** App Store Connect'ten TestFlight build'leri için "ITMS-91053 / Missing
      API declaration" (privacy manifest) konulu uyarı e-postası geldi mi? Geldiyse oturuma ilet
      (build 8'den önce düzeltilmeli)

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
- [ ] **Test hesabıyla** (eski test hesabı `review@review.com` ya da "Deneme" — §3b; demo hesap `review@odysseyjournal.app` **değil**) hesap sil → Supabase Dashboard → Storage → `posts/<uid>/` ve
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
- [ ] **Android 12 ve altı bir telefon varsa** (yoksa geç): galeriden fotoğraf seç + kamera → izin isteniyor ve
      çalışıyor (code review R1: bir izin yanlışlıkla engellenmişti, düzeltildi)
- [ ] Paylaş / yorum gönder düğmesine hızlıca iki kez bas → gönderi ya da yorum **bir kez** oluşuyor
- [ ] Android ana ekran ikonu: arkasında gri-beyaz dama deseni **yok**, krem zemin üstünde pusula
      (eski kurulumu silip yeni AAB'yi kur; ikon önbelleği eskiyi gösterebilir)
- [ ] Telefon dili Türkçeyken: yeni gönderide kamera / galeri / konum izni soruları **Türkçe** (iOS)
- [ ] İlk gönderi ya da yorumda "İçerik güvenlik kontrolü" penceresi çıkıyor → "Şimdi değil" →
      gönderi/yorum paylaşılmıyor, yazdığın yorum kutuda duruyor → tekrar dene → "İzin ver" → paylaşılıyor
- [ ] Ayarlar → Yasal ve Topluluk → "Yapay zekâ içerik kontrolü" anahtarı açık; kapat → yeni
      gönderide pencere yeniden çıkıyor
- [ ] Çıkış yap, uygulamayı tamamen kapatıp aç → tanıtım ekranları değil doğrudan giriş ekranı
- [ ] §0.1'deki ekip dışı adresle kayıt + şifre sıfırlama testi

**4 Ekim değişiklikleri**
- [ ] Yeni gönderide kamerayla 2 + galeriden 4 fotoğraf dene → toplam **5**'te duruyor, "en fazla 5 fotoğraf" uyarısı;
      önce çekilen fotoğraflar **silinmiyor**. 5 doluyken kamera/galeri açılmıyor, uyarı çıkıyor
- [ ] 3 fotoğrafa açıklama yaz, ortadakini sil → kalan açıklamalar kendi fotoğraflarında
- [ ] Mevcut bir gönderiyi düzenle → 5'i geçecek fotoğraf eklenemiyor
- [ ] Çıkış yap → başka hesapla gir → önceki hesabın profili / akışı / arama geçmişi bir an bile görünmüyor
- [ ] Ana sayfadaki ev konumu sorusuna "Mevcut konumu kullan" → kendi biniş kartında km değişiyor; başka bir
      hesaptan senin profiline bak → km görünüyor (yaklaşık değer, birkaç km farklı olabilir — bilerek)
- [ ] "Yemek" kategorisinde 3 gönderi → Profil → rozetler: **Gurme** açık
- [ ] Ayarlar → Gizlilik Politikası / Kullanım Şartları telefon dilinde açılıyor (TR'de `/tr/…`)
- [ ] Gönderi paylaş → link `odysseyjournal.app/tr/?post=…` (uygulama TR iken), sayfada "Uygulamada aç" şeridi
- [ ] 10'dan fazla farklı yerde gönderisi olan hesapta profil haritası hepsini gösteriyor

**Dil turu** (FINALIZE A4 — uygulamayı **kapatmadan** dil değiştirerek)
- [ ] Şu ekranlar açıkken dili değiştir; metin anında yeni dile geçmeli: Topluluk Kuralları,
      Yeni Gönderi (tarih seçici, kategoriler), Şifremi Unuttum, Ayarlar profil kartı, Profil
      biniş kartı, Keşfet, dil seçme penceresi
- [ ] IT/DE profilde takipçi sayacı: "Seguaci" / "Abonnenten"
- [ ] Her dilde: o dilin dışında kalmış metin ya da boş alan var mı

**Arapça (RTL)** (FINALIZE A5)
- [ ] Dili Arapça yap → uygulamayı **tamamen kapatıp aç** → rozetler, + düğmesi, kapatma
      düğmeleri doğru kenarda mı, oklar doğru yöne mi bakıyor

## 3b. App Review demo hesabı — `review@odysseyjournal.app` (build 8'den önce ya da hemen sonra)

Apple ve Google inceleyicisi bu hesapla girip uygulamayı 5-10 dakikada gezer. Boş profil ve boş akış
"uygulama çalışmıyor / içerik yok" (Guideline 2.1) gibi okunabilir. 29 Eylül durumu (salt-okuma):
hesap onaylı, profil satırı var ama **ad, kullanıcı adı, fotoğraf yok; 0 gönderi, 0 takip; hiç giriş
yapılmamış.** Uygulamadaki 14 gönderinin hepsi `Admin` (10), `Admin2` (3), `Admin3` (1) hesaplarında.
E-postaları `review@` takma adı üzerinden hello@ kutusuna gelir.

**Şifre:** hesap 6 Eylül'de panelden açılmış. Şifreyi hatırlamıyorsan build 8 gelince giriş ekranı →
Şifremi unuttum → e-posta hello@ kutusuna gelir → yeni şifre (build 7'de sıfırlama ekranı yok). Şifreyi
bir yere not et; App Store Connect ve Play Console'a aynısını gireceksin.

Telefonda **review@ ile giriş yap** ve sırayla:
- [ ] Profil düzenle: ad `App Review`, kullanıcı adı `appreview`, kısa bio (örn. "Demo account for
      App Store and Google Play review"), bir profil fotoğrafı
- [ ] **2-3 gönderi**: her birinde 2-3 fotoğraf, konum (farklı şehirler), kategori, tarih. Böylece
      profil, biniş kartı, pasaport damgaları ve harita dolu görünür. İlk gönderide "İçerik güvenlik
      kontrolü" izni çıkar → İzin ver (bu da test)
- [ ] `Admin`, `Admin2`, `Admin3`'ü takip et (akış ve "takip edilenler" dolsun); Admin hesabından da
      demo hesabı takip et
- [ ] Admin'in bir gönderisini beğen, bir yorum yaz, bir gönderiyi kaydet + bir koleksiyon oluştur
- [ ] Admin hesabından demo hesaba 1-2 mesaj at (Mesajlar ekranı boş kalmasın)
- [ ] Çıkış yap

**Göz önünde bulundur:** inceleyici akışta yazar adı olarak "Admin", "Admin2" görecek. Mecburi değil,
ama istersen bu üç hesabın görünen adını gerçekçi gezgin adlarıyla değiştir (profil düzenle).

**Moderasyon paneli:** hiçbir hesapta `is_admin` açık değil, yani uygulamadaki moderasyon paneli şu an
kimseye görünmüyor. Şikâyetlere 24 saat içinde bakabilmek için (Apple 1.2) kendi hesabını yönetici yap —
Supabase → SQL Editor'da bir kez çalıştır (Admin hesabı `admin@admin.com` ise):
```sql
update public.profiles set is_admin = true where id = '643ff194-f61d-4ad8-b5e5-c5e24d60c4ad';
```
(Uygulamadan bu sütun değiştirilemez — 030'daki koruma; SQL editörü sahibi olarak çalıştığı için geçer.)

**Eski test hesapları:** `review@review.com` ("Review", 19 Eylül — büyük olasılıkla bir oturumun
Android push testi için açtığı hesap) ve bugünkü `arifgultas93@gmail.com` ("Deneme"). §3'teki
"**test hesabıyla hesap sil**" maddesini bunlardan biriyle yap → hem silme akışı test edilir hem hesap
temizlenir. Diğerini de aynı yolla sil.

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
- [ ] App Review Information: demo hesap **`review@odysseyjournal.app`** (§3b) + iletişim + Notes (`store_control.md` §1.6; 29 Eylül'de
      OpenAI moderasyon satırı eklendi)
- [ ] Version Release: **Manually release**
- [ ] Build **8**'i seç → Add for Review → Submit (build 7'yi gönderme)

---

## 5. Google Play Console (`store_control.md` §3)

- [ ] Uygulamayı oluştur (varsayılan dil English (United States))
- [ ] Set up your app: privacy policy, app access (demo hesap `review@odysseyjournal.app`, §3b), ads: No, content rating
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
- [x] ~~**Site ↔ uygulama uyum turu**~~ ✅ 30 Eylül — site oturumu yaptı ve yayına aldı: hukuk sayfaları 12 dil
      (Keychain, PITR, prescreen, FCM/APNs, Apple, ev konumu, anında silme …), ana sayfa (olmayan özellikler
      çıktı, topluluk bölümü, 5 fotoğraf, "Çok yakında"). Ayrıntı sitenin `WORKLOG.md` "2026-09-30".
- [x] ~~**Siteden uygulamaya dönen 10 madde** (W1–W10)~~ ✅ 4 Ekim — uygulamada yapıldı (`FINALIZE.md` "4 Ekim").
- [ ] **Site metninde 3 güncelleme** — site deposundaki `APP_SYNC_2026-10-04.md`: ev konumu, push kayıtları 30 gün,
      fotoğraf kontrolü yayından önce (12 dil). Site projesinde bir oturuma "APP_SYNC_2026-10-04'ü uygula" demen yeterli;
      mağazaya göndermeden önce.
- [ ] **Hukuk metinlerini avukata göster** (özellikle `tr`): sitede `npm run legal:package` EN/TR yan yana üretir.
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
