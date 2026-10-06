# Arif'in yapılacaklar listesi

**Güncelleme:** 2026-10-05
Yalnızca **senin** yapman gereken işler. Kategoriler kabaca yapılma sırasına göre dizildi.
Ayrıntı gerektiğinde parantezdeki dosyaya bak: `FINALIZE.md` (genel durum), `store_control.md`
(mağaza adımları), `STORE_LISTING.md` (mağaza metinleri). Bir işi bitirince oturuma söyle;
oturum doğrulamasını yapıp bu listeyi ve FINALIZE'ı günceller.

**Sırayla gidersen:** 0 (✅, yalnız e-posta testi kaldı) → 1 (fal anahtarı, 2 dk)
→ 2 (build'ler; iOS ~1 Ekim EAS kredisi, Android hazır) → 3 (cihaz testleri) → 4-5
(mağaza formları; build beklemeden doldurulabilir) → 6 (site metinleri) → 7 (yayından hemen önce) →
8 (acelesi yok).

> **6 Ekim gece — Android build 10 dahili testte ✅, trafik kaydı (034) canlıda ✅.** Senden: telefonda Play'den güncelle;
> bir gönderi + yorum + mesaj at, gönderiyi düzenle; sonra oturumun verdiği SQL'i Supabase'de çalıştırıp sonucu ilet.
> Kapalı test taslakta, test kullanıcı listesini bekliyor. 18+ kutusu cihazda denendi ✅ (işaretlenmeden kayıt ilerlemiyor).
>
> **6 Ekim akşam — App Store'a gönderildi ✅ (1.0 Waiting for Review, build 10).** Yaş 18+, 174 ülke (Çin yok), 14 dil,
> manuel yayın. Apple'dan e-posta gelince oturuma söyle: onaysa **Release** düğmesine sen basarsın; retse birlikte bakarız.
> **Sıradakiler:** (1) 12 Gmail → Play kapalı test (vc4 + "Uygulama erişimi" şifresi). (2) Cihazda 18+ kutusu ve e-posta dili
> testi. (3) Site isteği `SITE_SYNC_2026-10-06b`: 5651 trafik kaydı → migration `034` (deploy senin onayınla).
>
> **6 Ekim öğleden sonra — build 10 alındı ✅** (şifre sıfırlama linki düzeltmesiyle). iOS App Store Connect'e gitti;
> "işlendi" e-postası gelince TestFlight'tan güncelle, sonra "Şifremi unuttum"u dene (e-posta Gmail'de **Gönderilmiş**'te).
> Android: `odyssey-journal-1.0.0-vc4.aab` İndirilenler'de. Kapalı teste ve App Store incelemesine **build 10** gider.
>
> **6 Ekim öğlen — build 9 alındı ✅** iOS TestFlight'ta (sen güncelledin). Android AAB İndirilenler'de
> `odyssey-journal-1.0.0-vc3.aab`. Demo hesabın şifresi: uygulamada "Şifremi unuttum" → e-posta hello@ kutusuna gelir.
> Yeni şifreyi Play "Uygulama erişimi"ne de yazmak gerekecek.
>
> **6 Ekim — senden beklenenler** (oturum gerisini yapar; plan: `FINALIZE.md` "★ 6 Ekim planı")
> 1. **12 test kullanıcısının Gmail adresi.** Android telefonu olan 12 kişi. Oturum kapalı test listesine ekler, kanalı açar,
>    sürümü Google'a gönderir. Sen onlara katılım linkini iletirsin. Linke dokunup "test kullanıcısı ol" derler, Play'den
>    kurarlar ve **14 gün** telefonda tutarlar. Sayaç kapalı test sürümü yayına girince başlar.
> 2. **Demo hesabı doldur** (App Store ve Play incelemesi bundan önce olmamalı): `review@odysseyjournal.app` ile telefonda
>    gir, profil fotoğrafı ve adı ekle, 2-3 fotoğraflı gönderi paylaş, birkaç kişiyi takip et, bir mesajlaşma başlat (§3b).
> 3. **Build 9'a onay ver.** İçinde: "18 yaşında veya daha büyüğüm" kutusu. iOS build'i oturum almayı dener; Apple girişi
>    isterse komutu kendi terminalinde çalıştırırsın (`npx eas build -p ios --profile production`).
> 4. **App Store başvurusu (iOS):** App Store Connect formlarını oturum Chrome'da doldurur. Senden:
>    - beyan cevaplarına onay;
>    - yaş derecelendirmesi kararı (anketin çıkardığı mı, yoksa Koşullar'la aynı 18+ mı);
>    - inceleme bilgisinde **demo hesabın şifresi** (sen yazarsın);
>    - iletişim için ad ve telefon;
>    - son "Submit for Review" onayı.
> 5. **E-posta testi:** Türkçe telefonla yeni hesap aç; onay e-postası Türkçe gelmeli. Başka dilde: konu İngilizce, gövde o dilde.
> 6. **Şirket:** bakacağın konu, acele yok (bugünkü kişisel hesaplarla yayına çıkılabiliyor).
>
> **5 Ekim akşam/gece — yapılanlar ✅**
> - Play'de uygulama oluşturuldu, build 8 dahili testte, telefonda kuruldu (harita dolu).
> - Play kurulumu 11/11, kapalı testin kilidi açık. Hedef kitle **18+** (senin kararın). Site yaş sınırını 12 dilde 18 yaptı.
> - Paylaşım linkleri iPhone ✅ ve Android ✅ (kaldır + yeniden kur sonrası).
> - E-posta şablonları Supabase'de (senin onayınla, site oturumu koydu).
> - "18 yaşında veya daha büyüğüm" kutusu kodda, **build 9'u bekliyor** (build alınmadı).
>
> **5 Ekim — build 8 alındı ✅** (iOS TestFlight'a gönderildi; Android AAB İndirilenler'de)
> **Senden, sırayla:**
> 1. ✅ ~~**AAB'yi Play'e yükle**~~ — 5 Ekim akşam: uygulama oluşturuldu, `2 (1.0.0)` Dahili test'te, SHA-256 siteye gitti.
>    **Android telefonda:** gultassoftware@gmail.com ile `https://play.google.com/apps/internaltest/4701189709697953452`
>    → "Test kullanıcısı ol" → Play'den kur → haritayı kontrol et (SHA-1'ler harita anahtarına eklendi).
> 2. **TestFlight:** Apple'dan "işlendi" e-postası gelince build 8'i kur → Notlar'a `https://odysseyjournal.app/tr/p/<bir gönderi id>`
>    yaz, dokun → uygulama açılmalı. Sonra §3 cihaz turu ("4 Ekim akşam" + "5 Ekim").
> 3. **E-posta şablonları:** hazır olduğunda oturuma "şablonları panele koy" de.
> 4. **Şirket:** bakacağın konu; bugünkü hesaplarla yayına çıkmak mümkün (FINALIZE "5 Ekim" madde 5).
>
> **4 Ekim gün sonu:** `033` canlıda. Site, 4 Ekim'in iki metin güncellemesini 12 dilde yayına aldı (§6).
>
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
- [x] ~~**Moderatör hesabı aç ve yönetici yap**~~ ✅ 4 Ekim — `moderation@odysseyjournal.app` onaylı, `is_admin = true`
      (kalan: §1b Adım 4 uygulamada kontrol, kullanıcı adı; Adım 6 isteğe bağlı) — adım adım **§1b** (4 Ekim sorgusu: `admins: null` →
      moderasyon paneli kimseye görünmüyor; mağazaya göndermeden önce şart, Apple 1.2)
- [x] ~~**Tek salt-okuma sorgusu**~~ ✅ 4 Ekim sonucu: admin yok (yukarıdaki madde) · purge_job `17 3 * * *` ✓ ·
      6 ev konumu tabloya taşındı, sütunda 0 kaldı ✓ · maestro test hesabı yok ✓ · **demo hesap boş** (0 gönderi,
      ad/fotoğraf yok, hiç giriş yok) → build 8 gelince §3b
- [ ] ~~(sorgu metni, tekrar gerekirse)~~ — Supabase → SQL Editor'a yapıştır → Run → çıkan tek satırı oturuma ilet.
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
      Beklenen: `admins` en az bir hesap (yoksa §1b), `profiles_home_location_left: 0`,
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

## 1b. Moderatör hesabı — `moderation@odysseyjournal.app` (✅ 4 Ekim: Adım 1-3 bitti; onay e-postası gelmedi, SQL ile onaylandı)

**Neden ayrı hesap:** şimdiki "Admin" hesabının e-postası notlarda `admin@admin.com` — `admin.com` başkasına ait
gerçek bir alan adı, şifre sıfırlama oraya gider (hesap kurtarılamaz). Ayrıca 10 gönderisi olan, akışta görünen bir
içerik hesabı. Yasaklama / gönderi silme yetkisi gönderi paylaşmayan, kurtarılabilir, ayrı bir hesapta olmalı.
(4 Ekim kararı.) Demo hesap `review@` **yönetici yapılmaz**.

**Adım 1 — e-posta takma adı (Google Workspace, 2 dk)**
- [ ] admin.google.com → **hello@odysseyjournal.app** ile gir
- [ ] Sol menü **Directory → Users** → **hello@odysseyjournal.app** kullanıcısına tıkla
- [ ] **User information** → **Alternate email addresses (email aliases)** → **Add an alternate email**
- [ ] `moderation` yaz (alan adı `@odysseyjournal.app` zaten seçili) → **Save**
- [ ] Birkaç dakika bekle (takma adın aktif olması 5-10 dk sürebilir). Gelen e-postalar hello@ kutusuna düşer —
      `review@`, `privacy@` gibi

**Adım 2 — uygulamadan kayıt ol (telefonda, 5 dk)**
Build 7 (TestFlight) ya da Android'de Expo ile olur; build 8'i beklemeye gerek yok.
- [ ] Uygulamada başka hesapla girdiysen: Profil → çıkış yap
- [ ] Giriş ekranı → **Kayıt ol**
- [ ] E-posta: `moderation@odysseyjournal.app`
- [ ] Şifre: **güçlü ve yeni** bir şifre (en az 16 karakter; başka yerde kullanmadığın). **Hemen şifre yöneticine kaydet**
      — bu hesap yasaklama ve silme yetkisi taşıyacak
- [ ] Ad soyad: `Odyssey Team` (kayıt ekranı yalnız bunu soruyor; kullanıcı adını girişten sonra Profil → Profili
      düzenle'den `odysseyteam` yapabilirsin)
- [ ] Koşulları kabul et → Kayıt ol
- [ ] hello@ kutusuna gelen **onay e-postasındaki** linke bas (sitenin "e-posta onaylandı" sayfası açılır)
  - **Gelmezse** (4 Ekim'de böyle oldu — büyük olasılıkla takma ad kayıt anında henüz aktif değildi ve e-posta geri döndü):
    Gmail'de `moderation` ve `Address not found` diye ara (Spam dahil). Yoksa Supabase → **Authentication → Users**'ta
    adres "Waiting for verification" görünüyorsa SQL Editor'da elle onayla (adres senin alan adında, sakıncası yok):
```sql
update auth.users set email_confirmed_at = now()
where email = 'moderation@odysseyjournal.app' and email_confirmed_at is null;
```
    Listede hiç yoksa takma ad aktif olduktan sonra (başka adresten test e-postası atıp hello@'ya düştüğünü gör)
    uygulamadan yeniden kayıt ol.
- [ ] Uygulamada bu hesapla **giriş yap**. Gönderi paylaşma, kimseyi takip etme, ev konumu sorusunu **atla**
      (profil boş kalsın; amacı yalnız moderasyon)

**Adım 3 — yönetici yap (Supabase, 1 dk)**
- [ ] supabase.com → proje **odyssey-journal-eu** → sol menü **SQL Editor** → **New query**
- [ ] Şunu yapıştır → **Run**:
```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'moderation@odysseyjournal.app');
```
- [ ] Editör `update` için hep **"Success. No rows returned"** der (kaç satır değiştiğini göstermez) — bu normal
- [ ] Kontrol için aynı yerde çalıştır → `moderation@odysseyjournal.app | true` görmelisin. Liste boşsa hesap ya da
      profil satırı yok → Adım 2'ye dön:
```sql
select u.email, p.is_admin from auth.users u join public.profiles p on p.id = u.id where p.is_admin;
```
(Uygulamadan bu yetki verilemez — 030'daki koruma; SQL Editor sahibi olarak çalıştığı için geçer.)

**Adım 4 — uygulamada kontrol (1 dk)**
- [ ] Moderatör hesabıyla girili olsun; Ayarlar açıksa kapatıp yeniden aç (yetki Ayarlar açılırken okunuyor)
- [ ] **Ayarlar** → **Yasal ve Topluluk** kartının hemen üstünde yeni bir **ADMİN** kartı → **Moderasyon Paneli** görünüyor
- [ ] Panele gir → açılıyor (şikâyet yoksa liste boş — normal)
- [ ] İstersen dene: başka bir hesaptan bir gönderiyi **Şikâyet et** → moderatör hesabında panelde görünüyor

**Adım 5 — şikâyetleri takip (sürekli)**
Apple şikâyet edilen içeriğe **24 saat içinde** bakılmasını bekliyor. Uygulama şikâyette moderatöre bildirim
göndermiyor, iki yoldan biriyle günde bir bak:
- uygulamada moderatör hesabına geçip **Ayarlar → Moderasyon Paneli**, ya da
- Supabase → **Table Editor → `reports`** tablosu (yeni satır = yeni şikâyet)

**Adım 6 — eski "Admin" hesabı (isteğe bağlı, acil değil)**
Hesap **silinmeyecek**: 10 gönderisi demo akışı dolduruyor. Yalnız yönetici yapılmıyor.
- [ ] Supabase → **Authentication → Users** → listede "Admin" hesabının e-postasına bak. Gerçekten `admin@admin.com`
      gibi senin olmayan bir adresse **şifresini şifre yöneticine kaydet** (unutursan kurtarılamaz)
- [x] ~~Admin → "Elif Demir" / `elifdemir`~~ ✅ 4 Ekim (uygulamadan)
- [x] ~~**Admin2, Admin3** yeniden adlandır~~ ✅ 4 Ekim (SQL): **Can Yılmaz / `canyilmaz`** (3 gönderi),
      **Sofia Rossi / `sofiarossi`** (1 gönderi); Elif Demir 10 gönderi
- [ ] **Bu üç hesabın girişlerini not et** — e-postaları gerçek adres değil, "Şifremi unuttum" çalışmaz:
  1. Giriş e-postalarını öğren (salt okuma) → şifre yöneticine yaz:
```sql
select p.username, u.email from auth.users u join public.profiles p on p.id = u.id
where p.username in ('elifdemir', 'canyilmaz', 'sofiarossi');
```
  2. Can ve Sofia'ya yeni şifre (şifre yöneticinde üret; `SIFRE_1`/`SIFRE_2` yerine yaz, tırnaklar kalsın). Sonuç
     "Success. No rows returned" — normal. Çalıştırdıktan sonra sorguyu **kaydetme**, Snippets'e düştüyse sil:
```sql
update auth.users set encrypted_password = extensions.crypt('SIFRE_1', extensions.gen_salt('bf'))
where id = (select id from public.profiles where username = 'canyilmaz');
update auth.users set encrypted_password = extensions.crypt('SIFRE_2', extensions.gen_salt('bf'))
where id = (select id from public.profiles where username = 'sofiarossi');
```
  3. Uygulamada Can Yılmaz ile gir → profil yerinde → çık
  (Elif Demir'in şifresi biliniyor. Bu hesaplar yönetici değil; yönetici yalnız `moderation@`.)
- [ ] E-postasını kendi alan adına (örn. `travel@odysseyjournal.app` takma adı) taşımak istersen oturuma söyle;
      panelden doğrudan değiştirilemiyor, oturum SQL'ini hazırlar

---

## 2. Build'ler

- [x] ~~**iOS build 8**~~ ✅ 5 Ekim — TestFlight'a gönderildi. Eski not: EAS kredisi yenilenince (expo.dev → Billing/Usage'dan tarihi kontrol et)
      `eas build --platform ios --profile production` → TestFlight. 29 Eylül dahil tüm düzeltmeleri
      içerir. Önce §0.4'teki Sentry değişkenlerini EAS'e gir (yoksa build yine geçer, yalnız çökme
      raporları okunmaz).
      (FINALIZE "Engel: Expo (EAS) build kredileri")
- [x] ~~**Android AAB**~~ ✅ 5 Ekim — `C:\Users\arifg\Downloads\odyssey-journal-1.0.0-vc2.aab` (versionCode 2). Eski not:
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
- [ ] Bir hesaptan çık, başka hesapla gir → Ayarlar → Profili düzenle: formda **şu anki** hesabın adı ve kullanıcı adı
      var (4 Ekim'de önceki hesabınki çıkıyordu — `b5a41a6`)
- [ ] Moderatör hesabıyla Ayarlar → Moderasyon Paneli ve Ayarlar → Topluluk Kuralları: üstte **tek** başlık var
      ("settings" / "admin" yazan ikinci başlık yok — `3a13269`)

**4 Ekim akşam (ikinci tur)**
- [ ] Kayıt ekranında Koşullar ve Gizlilik linklerine bas → site telefon dilinde açılıyor (build 7'de yoktu)
- [ ] Kayıtlı bir e-postayla yeniden kayıt ol → "bu e-postayla hesap var" uyarısı
- [ ] Onaylamadığın bir hesapla giriş dene → "E-postayı tekrar gönder" → e-posta geliyor
- [ ] Ayarlar'dan çıkış → başka hesapla gir → Android'de geri tuşu önceki hesabın ekranlarına dönmüyor
- [ ] Uçak modunda çıkış yap → giriş ekranında kalıyor (geri sekmelere atmıyor)
- [ ] Başkasının yorumunda ⋯ → Şikâyet et ve Kullanıcıyı engelle; kendi gönderindeki başkasının yorumunu silebiliyorsun
- [ ] Bir profilde ⋯ → Şikâyet et / Engelle; sohbet başlığında ⋮ → Şikâyet et / Engelle; gönderi menüsünde "Kullanıcıyı engelle"
- [ ] Moderatör hesabında panel: yorum ve kullanıcı şikâyetleri görünüyor, yorum silinebiliyor, "Yasaklı" sayısına
      dokununca liste ve "Yasağı kaldır"
- [ ] Takipçi / takip listeleri açılıyor (engellediğin biri varsa da); başkasının takip listesinde yalnız gerçekten
      takip ettiklerin "Takip ediliyor"; kendi satırında Takip et yok
- [ ] Beğendiğin bir gönderi Kaydedilenler'de ve takip akışında dolu kalple görünüyor
- [ ] Gönderi detayında yazarın adına bas → profili; Takip et çalışıyor
- [ ] Gönderiyi düzenle → tarih rozetine bas → takvimde gönderinin tarihi seçili; konumu kaldırıp kaydet → konum gidiyor
- [ ] Gönderi düzenle/sil → profil sekmesi ve diğer listeler hemen güncel
- [ ] 100'den fazla mesajlı bir sohbette en son mesajlar görünüyor
- [ ] Sitedeki "Uygulamada aç" şeridi (`odysseyjournal.app/?post=…` telefonda) → uygulama doğrudan gönderiyi açıyor
- [ ] Uygulama kapalıyken gelen bildirime dokun → ilgili gönderi/profil açılıyor
- [ ] Keşfet'te bir gönderi başlığını ara → "Gönderiler" bölümünde çıkıyor; geçmişte "Tümünü temizle"
- [ ] Yer imine bas → koleksiyon seçicisini kaydetmeden kapat → simge boş kalıyor

**5 Ekim (paylaşım linkleri, build 8)**
- [ ] Uygulamada bir gönderiyi paylaş → link `odysseyjournal.app/p/…` (Türkçe telefonda `/tr/p/…`)
- [ ] O linki Notlar'a yapıştır, dokun → uygulama gönderiyi açıyor (site doğrulama dosyaları yayındaysa; değilse site
      açılır, bu da doğru)
- [ ] Uygulama silinmişken aynı link → site açılıyor
- [ ] Kayıt ekranındaki kutu: "Kullanım Koşulları'nı kabul ediyorum ve Gizlilik Politikası'nı okudum." İki link de
      açılıyor; bir de İngilizce ya da Rusça bak (cümle düzgün, linkler doğru yerde)
- [ ] İçerik kontrolüne takılan bir yorumda (ör. açık hakaret) uyarının sonunda "support@odysseyjournal.app adresine yazın" cümlesi
- [ ] **E-posta dili** (site şablonları Supabase'e girdikten sonra): uygulama Türkçeyken yeni bir adresle kayıt ol → onay
      e-postası Türkçe. Uygulamayı İngilizceye çevir → "Şifremi unuttum" → sıfırlama e-postası İngilizce

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

**Göz önünde bulundur:** inceleyici akışta yazar adı olarak "Admin", "Admin2" görecek → §1b Adım 6.

**Moderasyon paneli:** ayrı moderatör hesabında (`moderation@`, §1b). Demo hesap yönetici **yapılmaz**.

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
- [x] ~~**Site metninde güncellemeler** (`APP_SYNC_2026-10-04` ve `-04b`)~~ ✅ 4 Ekim — site oturumu 12 dilde yayına
      aldı (site `3730b91`): ev konumu, push kayıtları 30 gün, fotoğraf kontrolü, şikâyet/engelleme kapsamı.
- [x] ~~Hukuk metinlerini avukata göster~~ → avukat yok (4 Ekim kararı). Kontrolü site oturumu yapıyor (KVKK +
      GDPR/CCPA + mağaza kuralları).
- [x] ~~**Site için iki bilgi** (Apple Team ID, EAS SHA-256)~~ ✅ 5 Ekim — oturum expo.dev'den okudu, site deposuna
      `APP_SYNC_2026-10-05.md`. Kalan: Play'in uygulama imzalama SHA-256'sı ilk Play yüklemesinden sonra (§2), oturum yapar.
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
