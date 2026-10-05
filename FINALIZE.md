# Odyssey Journal — Yayın Öncesi Durum ve Kalanlar

**Son güncelleme:** 2026-10-05 öğleden sonra (**build 8 alındı**: iOS TestFlight'a gönderildi, AAB hazır — hemen aşağıda).
Önceki: 2026-10-04 gün sonu (`033` canlıda; build'ler 5 Ekim'e kaldı).
Aynı gün akşam: ikinci tur (tüm uygulama yeniden tarandı, ~45 bulgu, `033`).
Aynı gün sabah: `032` canlıda, W1–W10 işlendi ("4 Ekim — build 8 öncesi son tur").
Önceki: 2026-09-30 (site ↔ uygulama uyum turu), 2026-09-29 akşam (finalize taraması, advisor S1–S5).
**Bu dosya ne işe yarar:** Oturumlar arası tek referans. Nerede kaldık, sırada ne var, neden.
Dil işinin teknik detayı `I18N_HANDOFF.md`'de; bu dosya yayına kadar kalan her şeyi kapsıyor.

> `scratch/1209project_review.md` ve `scratch/1209task_summary.md` 8 Eylül tarihli ve artık
> güncel değil (örneğin "97/97 test" diyorlar, bugün 211). İş listesi olarak bu dosyayı
> kullanın; o ikisi mağaza tarafı için hâlâ iyi bir arka plan.

---

## ★ 5 Ekim — build öncesi tamam, sırada build 8 (BURADAN BAŞLAYIN)

**Durum:** `main` = origin (`7b0725b` + bu notlar), CI yeşil. `supabase/**` değişmedi (deploy yok). Kullanıcı bu oturumda
**build alınmamasını** istedi; build'i ayrıca başlatacak. Build öncesi kalan her şey yapıldı:

| Ne | Nerede |
|---|---|
| **Paylaşım linkleri uygulamada açılıyor** (`SITE_SYNC_2026-10-04` §2): link `/<dil>/p/<id>` (EN kökte); iOS `associatedDomains: applinks:odysseyjournal.app`; Android doğrulanan intent filter (`/p/`, `/../p/.*`); `mapAppLink` tam adresi ve yalnız yolu `/post-detail/<id>`'ye çeviriyor, eski `odysseyjournal://post/<id>` aynen | `dd6baac` — `app.config.ts`, `lib/share.ts`, `lib/deep-links.ts` + testler |
| **E-posta dili — kullanıcı kararı: evet, build 8'e.** Kayıt `user_metadata.language` gönderiyor; `syncPreferredLanguage` (açılışta ve dil değişince) farklıysa `auth.updateUser({ data: { language } })` → şifre sıfırlama e-postası güncel dilde. Değeri olmayan hesaplar (eski build'ler) İngilizce alır. Şablonları site oturumu hazırlıyor (`{{ .Data.language }}`) | `7b0725b` — `app/(auth)/signup.tsx`, `lib/profile-service.ts`, `preferred-language.test.ts` |
| **Siteye bilgi:** Apple Team ID `28848845P3` (iOS bundle `app.odysseyjournal`), EAS upload anahtarı SHA-256 `EB:7F:…:45:2A` (tamamı site notunda), AASA/assetlinks örneği, e-posta şablon isteği | site `1246b55` `APP_SYNC_2026-10-05.md` |
| **Siteden `SITE_SYNC_2026-10-05`** (bu depoda): AASA + `assetlinks.json` canlıda (Team ID + EAS SHA-256; Apple CDN almış). **Kayıt kutusu KVKK'ya göre:** Koşullar kabul edilir, Gizlilik Politikası yalnız okunur — 12 dilde tek cümle `auth.consentSentence` (`{{terms}}`, `{{privacy}}`), linkler dilin dil bilgisine göre yerleşiyor (ru: araç hâli). **Moderasyon reddi** sonunda 12 dilde "hata olduğunu düşünüyorsan support@'ya yaz, bir kişi inceler" (`moderation.appealHint`). "Gultas Software" uygulama metinlerinde yok (yalnız Sentry org kimliği). Yanıt site `7c14e7c` (`APP_SYNC_2026-10-05` §5) | `04c00af` — `signup.tsx`, `content-moderation.ts`, 12 çeviri |
| **E-posta şablonları** site deposunda hazır (`supabase-email-templates/`, site `2843977`; okundu, temiz). Kullanıcı panele koymayı **build 8 sonrasına erteledi** → o zamana kadar e-postalar Supabase'in İngilizce varsayılanı | — |
| **Security Advisor:** 0 hata, **8** uyarı — 7 bilinen + `admin_delete_comment` (`033`; ilk satırda `is_admin` kontrolü, anon'a kapalı → bilerek) | Chrome, salt-okuma |

**Kontroller:** tsc temiz · **27 suite / 237 test** · i18n 12 × **757** · değişen dosyalarda lint 0 hata · `expo config`'te
`associatedDomains` ve `intentFilters` var · `/security-review` (iki commit): bulgu yok.

**Build 8 — alındı (5 Ekim 13:50), ikisi de `be5ac43`:**
| | |
|---|---|
| iOS build 8 | EAS `2c5d74bb`. İlk deneme (`8973c59e`) **düştü**: 7 Eylül'deki provisioning profile Associated Domains içermiyordu; `--non-interactive` Apple'a giremediği için yeteneği eşitleyemedi. Kullanıcı kendi terminalinde etkileşimli `eas build -p ios` ile Apple'a girdi → yetenek açıldı, yeni profil. **Ders:** native yetenek eklenen build'i etkileşimli al (yerelde ASC API anahtarı `.p8` yok). `eas submit` (`c5316cbd`) → App Store Connect'e yüklendi |
| Android AAB | EAS `0680e4c7`, versionCode 2. Kullanıcının İndirilenler klasöründe `odyssey-journal-1.0.0-vc2.aab` |
| Sentry | Source Map Uploads'ta `1.0.0 (8)` ve `1.0.0 (2)` (5 Ekim). Releases listesinde yeni sürümler uygulama ilk olay/oturumu gönderince görünür — normal |
| Site | `APP_SYNC_2026-10-05` §6 (site `2c4e0a2`) |

**Sıradaki:**
1. ✅ (5 Ekim akşam) Play'de uygulama oluşturuldu (kişisel hesap "Gültaş Software", app id `4973909615936715001`, en-US, ücretsiz). AAB Dahili test'e yayınlandı: `2 (1.0.0)`, Play App Signing açık. Test listesi "Odyssey Journal" (gultassoftware@gmail.com). Katılım linki: `https://play.google.com/apps/internaltest/4701189709697953452`. İnceleme beklerken uygulama adı geçici olarak "com.odysseyjournal.app (unreviewed)" görünüyor.
2. ½ Parmak izleri okundu (yukarıda "Google Maps anahtarları"); SHA-256 siteye gitti (`APP_SYNC_2026-10-05b`, site `1e0c973`). İki SHA-1 de "Odyssey Android Maps SDK" anahtarına eklendi (5 Ekim akşam, kullanıcı onayıyla; kaydedildikten sonra yeniden açılıp doğrulandı). Anahtarda şimdi debug + upload + app signing var; debug yayından önce kaldırılacak.
3. TestFlight kurulunca link testi (iPhone Notlar → `/tr/p/<id>`) ve cihaz turu `arif_todo.md` §3.
4. E-posta şablonları panele (kullanıcı onayıyla; site deposu `supabase-email-templates/`).
5. Şirket kararı (kullanıcı bakacak): bugün Apple Individual + Play kişisel + sitede veri sorumlusu "Arif Gültaş" — tutarlı. Şirket kurulursa Apple hesabı dönüştürülür (Team ID'nin kalması beklenir), Play'de yeni şirket hesabına uygulama aktarımı, site metinleri.

## 4 Ekim akşam — ikinci tur

**Neden:** kullanıcı build 7'de kayıt ekranındaki Koşullar/Gizlilik linklerinin açılmadığını gördü ve build 8'den önce
**bütün uygulamanın** yeniden kontrolünü istedi. Linkler kodda doğruydu (build 7 = `2fc5259`, linkler `8e4bb2e` ile
sonra geldi) ama üç tarama (giriş/ayarlar/yönetim, içerik, build hazırlığı + site) ~45 bulgu çıkardı. Karar:
**hatalar + Apple şartları build 8'e, yeni özellikler 1.1'e.**

**Commit'ler:** `b4b6d27` (şikâyet/engelleme + `033` + yönetim paneli), `26d897b` (giriş, çıkış, linkler, push),
`550ffd3` (içerik düzeltmeleri, 25 yeni metin × 12 dil). Site: `APP_SYNC_2026-10-04b.md` (`f073496`, şartlar
metninde şikâyet/engelleme kapsamı).

**Kontroller:** tsc temiz · **27 suite / 230 test** · i18n 12 × **756** · lint 0 hata / 182 uyarı · `expo export` iOS +
Android · `/security-review`: bulgu yok · PGlite `032`+`033` birlikte **61 kontrol** (ikinci çalıştırmalar dahil).

**Yapılanlar**
| Alan | Ne |
|---|---|
| Apple 1.2 | Yorum ve kullanıcı şikâyet edilebiliyor (yorum menüsü, profil menüsü, sohbet başlığı); engelleme gönderi menüsünde, yorumda, profilde, sohbette (`hooks/use-block-user.ts`). `033`: `reports` gönderi/yorum/kullanıcı hedefli, yazar (`reported_user_id`) sunucuda yazılıyor, hedef başına tek şikâyet; gönderi sahibi kendi gönderisindeki yorumu silebiliyor; `admin_delete_comment`. Yönetim paneli: yorum/kullanıcı şikâyetleri, yorum silme, yasaklı listesi + yasak kaldırma, gönderi gizli olsa da yasaklama |
| Giriş | Çevrimdışı çıkış oturumu yerelde kapatıyor; Ayarlar'dan çıkışta eski hesabın sekmeleri kalmıyor (`dismissAll`); kayıtlı e-postayla kayıt uyarı veriyor; onaylanmamış girişte "E-postayı tekrar gönder"; "E-posta" etiketi; giriş ekranları uygulama temasında |
| Linkler / push | `app/+native-intent.tsx` + `lib/deep-links.ts`: `odysseyjournal://post|user|collection/<id>` doğrudan ekrana (site şeridi); eski `use-deep-link-handler` silindi. Kapalı uygulamada push'a dokununca ekran açılıyor |
| Çökme / yanlış veri | Takipçi/takip listesi engelli kullanıcıda çöküyordu; başkasının takip listesinde herkes "Takip ediliyor"; kendi satırında Takip et; beğeni/kayıt durumu takip akışı, Kaydedilenler, koleksiyonlarda doluyor (`lib/post-interactions.ts`) |
| Bayat veri | Oluştur/düzenle/sil sonrası listeler yenileniyor (`lib/query-invalidation.ts`); post detail ve koleksiyon odakta yenileniyor; ana akış sayfalarını gereksiz yere sıfırlamıyor; engellemede doğru önerilen-kullanıcı anahtarı |
| Düzenleme | Tarih seçici bugünü gösterip seyahat tarihinin üzerine yazıyordu; konum/hava kaldırılabiliyor; moderasyon/hız sınırı/askı mesajları gösteriliyor (`ModerationRejectedError`, `postErrorMessage`); gönderi satırı görsellerden önce siliniyor |
| Sohbet | Uzun sohbette son mesajlar görünüyor; eski sohbetler listede kalıyor; gönderilemeyen mesaj uyarıyla geri alınıyor; okunmamış sayısı gizli (engelli) gönderenleri saymıyor |
| Diğer | Post detail'de yazara git + çalışan Takip et; Unsplash yedek görselleri (biri yabancı birinin portresi) → uygulamanın kendi görseli (`lib/post-image.ts`); "Editörün seçimi" → Trend; arama sonuçlarında gönderiler, geçmişi temizle; profil günlüğünde metin gönderileri; eski bildirimlerde tarih; koleksiyon seçici kaydetmeden kapanınca kayıt yok, "koleksiyonsuz kaydet" düzgün, kayıtlı gönderi koleksiyona taşınabiliyor; Kaydedilenler'de çift sayfa yok; çevrilmemiş "Traveler/Unknown User/You" |
| Build | EAS production'a `SENTRY_ALLOW_FAILURE=true` (ilk Sentry yüklemesi düşerse build düşmesin). Chrome'da doğrulandı: iOS push anahtarı (N2V7TK9B43), dağıtım sertifikası, provisioning profile, ASC API anahtarı EAS'te; Ekim dönemi 0 build kullanılmış. `STORE_LISTING`: "itinerary" anahtar kelimesi değişti |

**Bilerek yapılmayanlar:** image-picker / location eklentilerinin eklediği İngilizce mikrofon ve "her zaman konum"
metinleri **kaldırılmadı** — kod bu API'lere referans verdiği için metin silinirse App Store yüklemesi ITMS-90683
(eksik amaç metni) ile reddedilebilir. `(tabs)/create.tsx`'e e-posta doğrulama kontrolü eklenmedi (onaysız hesap zaten
giriş yapamıyor). 1.1'e: koleksiyon düzenleme, listelerde sayfalama, harita gönderi sınırı, gizli 3 kategori,
sıralama, W6, PR preview build, lint uyarıları, paket yükseltmeleri.

**Sonuç:** `033` aynı akşam canlıya alındı. Build'ler 5 Ekim'e kaldı; önce sitenin istediği `/p/<id>` linkleri
(yukarıda "5 Ekim").

---

## 4 Ekim — build 8 öncesi son tur

**Durum:** kodda bekleyen iş yok. `main` = origin (`9ee729a`), CI yeşil, **`032` canlıda** (Deploy Supabase
10:41'de geçti). Sırada: **iOS build 8 + Android AAB (versionCode 2) EAS'ten** → cihaz turu (`arif_todo.md` §3).

**Kontroller:** `tsc` temiz · **24 suite / 225 test** · `i18n:check` 12×732 · lint 0 hata / 175 uyarı ·
`expo export` iOS + Android paketleri derleniyor · çözümlenen config: buildNumber 8, versionCode 2, privacyManifests var.

**Bu turda yapılanlar**
| # | Ne | Nerede |
|---|---|---|
| S1 | Üç bucket'ta listeleme kapandı: SELECT yalnız sahibinin klasörü (+ legacy `avatars/<uid>-*`). Bucket'larda kalan **bütün** SELECT politikaları isimden bağımsız düşürülüyor (030'daki DO kalıbı) | `032` |
| S2/S3 | `get_popular_destinations` / `get_trending_locations` anon'a kapalı (PUBLIC dahil); `move_profile_push_token` doğrudan çağrılamaz | `032` |
| W1 | Ev konumu `profiles.home_location` → **`user_home_locations`** (yalnız sahibi). Eski build'ler sütuna yazarsa tetikleyici tabloya taşıyıp sütunu boşaltıyor (push token kalıbı). Km `get_travel_distance_km` RPC'sinden; uygulama başkasının profil satırını artık okumuyor. **Güvenlik incelemesi:** tam toplam, herkese açık gönderi koordinatlarıyla farklardan ev konumunu üçgenlemeye izin veriyordu → başkalarına km, ev konumunun 0,5°'ye (~55 km) yuvarlanmış hâlinden; sahibi tam değeri görüyor (`1ee62fb`) | `032`, `lib/profile-service.ts`, `home-location-modal.tsx`, `(tabs)/index.tsx` |
| W2 | **5 fotoğraf** her yolda: galeri `selectionLimit = 5 − mevcut` (0'da açılmıyor — 0 = sınırsız), kamera 5'te duruyor, yükleme ve düzenleme 5'i reddediyor. Tek kaynak `lib/post-limits.ts`. Yan: foto silinince açıklaması da gidiyor; dosya adlarına rastgele ek (paralel yüklemede çakışma) | `hooks/use-image-picker.ts`, iki oluşturma ekranı, `lib/image-upload.ts`, `lib/posts.ts` |
| W3 | Gönderilmiş push kuyruğu satırları 30 gün sonra siliniyor (`purge-push-queue`, her gece 03:17 UTC) | `032` |
| W4 | Çıkışta / başka hesap girince React Query önbelleği bellekte ve diskte temizleniyor (`clearUserQueryCache`); oturum kendiliğinden düşünce de (`SIGNED_OUT`) | `context/AuthContext.tsx`, `lib/query-persister.ts` |
| W5 | Moderasyon **yayından önce**: metin → yükleme → fotoğraf kontrolü → insert. İşaretlenen fotoğraf silinir, gönderi hiç oluşmaz; metin reddedilirse hiçbir şey yüklenmez. Fail-open değişmedi | `lib/posts.ts` |
| W7 | Gurme rozeti `food` kategorisinde 3 gönderiyle açılıyor; Fotoğrafçı artık fotoğraflı gönderileri sayıyor | `lib/badge-service.ts`, `getProfileStats` |
| W8/W10 | Gizlilik / Şartlar ve paylaşım linki uygulama dilinde (`/<dil>/…`, EN kökte; bilinmeyen kod → kök) | `lib/legal-links.ts`, `lib/share.ts` |
| W9 | `STORE_LISTING.md` 12 dilde "o günün hava durumu" → "paylaştığın andaki" | — |
| + | Profil haritası bütün yerleri işaretliyor (önceden en eski 10); statik yedek en yeni 10 | `(tabs)/profile.tsx` |
| + | Explore her açılışta bütün `posts`'u çekip cihazda geocode eden tek seferlik göç kaldırıldı | `(tabs)/explore.tsx`, `lib/search-service.ts` |
| + | **iOS privacy manifest** (uygulama hedefinde hiç yoktu): UserDefaults, FileTimestamp, SystemBootTime, DiskSpace gerekçeleri, tracking yok | `app.config.ts` |
| + | Sentry release'i native SDK veriyor (`bundle@sürüm+build`; sabit "1.0.0" build 7/8'i karıştırıyordu) | `lib/sentry.ts` |
| + | `store_control.md`: App Privacy'ye arama geçmişi, mesajlar, performans; Crash Data **bağlı**; Data safety'ye arama geçmişi, tanılama, push token; §2 "Android Studio/.jks" → EAS; inceleme notu W5'e göre | — |

**Test:** `032` PGlite'ta (FULL_SETUP + 004/025/028/011/030/031, `cron` stub'ı, canlıdaki gibi `home_location` sütunu)
**43 kontrol** geçti, ikinci çalıştırma dahil. Harness: scratchpad'de `test032.mjs` (kaynak 8959deb7'deki `test030.mjs`).
Yeni birim testleri: `post-limits`, `legal-links` (share dahil), `badges`, `query-persister`; `posts.test.ts` yeni sıraya göre.

**Canlı doğrulama (deploy sonrası):** OpenAPI'de `user_home_locations` + `get_travel_distance_km` var; anon
`get_trending_locations` → **401**; anon `posts` bucket listesi → **[]**. **Security Advisor (yeniden çalıştırıldı):
0 hata, 7 uyarı** — `pg_net` public'te (S4, dokunmayın) ve oturum açmış kullanıcının çağırması gereken 6 SECURITY
DEFINER fonksiyon (`clear_push_token`, `set_push_token`, `delete_user_account`, iki destinasyon RPC'si,
`get_travel_distance_km`) — bilerek. Bucket listeleme ve anon uyarıları düştü.

**Site:** `APP_SYNC_2026-10-04.md` site deposunda (`b5d3f84`, push'landı). Site metninde değişecek üç yer:
gizlilik §2A ev konumu, `/delete-account` §4 push kayıtları "30 gün", gizlilik §5/8 fotoğraf kontrolü "yayından önce".
Site oturumu yapacak (12 dil) — build'ler mağazaya çıkmadan önce.

**Bilerek yapılmayanlar:** onboarding'deki "seyahat ipuçları edinin" (12 dil) — topluluk gönderileri için savunulabilir
pazarlama dili, değiştirilmedi. W6 (admin'in sildiği gönderinin görselleri), sohbet ekranında şikâyet/engelle
(profilde var), PR'larda preview EAS build, hata ekranında stack, lint uyarıları, paket yükseltmeleri → 1.0 sonrası.

**Doğrulanamayanlar:** canlı veri okuması (admin var mı, demo hesap dolu mu, kaç profilde ev konumu vardı, `.maestro`
akışlarındaki `explorer@odyssey.com` canlıda var mı) bu oturumda izin sınıflandırıcısı tarafından reddedildi →
salt-okuma SQL'i `arif_todo.md` §1'de, kullanıcı çalıştırır. Eski build'lerde (TestFlight 7) km artık İstanbul'dan
hesaplanır (ev konumu sütunu boş) — beklenen.

**Build sırası:** (1) `eas build --platform android --profile production` (oturum) (2) iOS build 8 (kullanıcı ya da
oturum) → `eas submit -p ios` (3) Sentry → Releases'ta `app.odysseyjournal@1.0.0+8` / `com.odysseyjournal.app@1.0.0+2`
ve source map (4) Play dahili test + App integrity SHA-1'leri Maps anahtarına (5) cihaz turu.

---

## ★ 30 Eylül — siteden gelenler (4 Ekim'de işlendi — yukarıda)

Site oturumu (`odyssey-journal-website`) siteyi bu deponun build 8 hâline göre baştan düzeltti ve yayına aldı
(site `e89f542` hukuk 12 dil, `af1d965` ana sayfa, `79b9d8e` belgeler; deploy `492cc01`, canlıda doğrulandı).
Tam liste sitenin `APP_SYNC_2026-09-29.md` §5'inde ve `WORKLOG.md` "2026-09-30"de. Kısaca site artık şunu diyor:
oturum AsyncStorage'da (Keychain yok), yedek günlük/7 gün (PITR yok), gönderiler herkese açık, ev konumu
"diğer kullanıcılara gösterilmez", fotoğraflar OpenAI'da **yayından hemen sonra** kontrol edilir ve kontrol çalışmazsa
içerik kontrolsüz yayımlanabilir, silme anında + yedekte ≤ 7 gün, **kayıt başına 5 fotoğraf**, Apple ve FCM/APNs
alt işleyen, Sentry EU. Ana sayfaya topluluk bölümü eklendi; mağaza düğmeleri "Çok yakında"; `/?post=<uuid>`
ziyaretçisine `odysseyjournal://post/<id>` ile "Uygulamada aç" şeridi çıkıyor.

**Uygulamada yapılacaklar — build 8'den önce (site bunları bugünkü davranışa göre anlatıyor):**
| # | Bulgu | Yapılacak |
|---|---|---|
| W1 | **Ev konumu koordinatları başka kullanıcılara okunabilir görünüyor** — `profiles.home_location` için sütun kısıtı yok, SELECT yalnız engeli dışlıyor (`014`, `030:333`). Uygulama göstermiyor ama API ile okunur; site "gösterilmez" diyor | Canlı politikayı doğrula; `032`'ye ekle: koordinatları sahibine kısıtla (sütun REVOKE — önce istemcide `select('*')` taraması — ya da ayrı tablo). Mesafe hesabı başka profilde de ev konumunu okuyor (`profile-service.ts:181-260`) → sunucu tarafı hesap ya da yalnız sayı döndüren RPC |
| W2 | **Galeri seçici listeyi 5'e kesiyor, önce kameradan eklenenleri sessizce siliyor** (`hooks/use-image-picker.ts:104` `slice(0, maxImages)`); kamera sınırsız ekliyor, yükleme 10'da reddediyor | Kullanıcı kararı: **5** (site 5 diyor). Galeri `selectionLimit: 5 - images.length`, mevcutları silmesin; kamera 5'te dursun (iki oluşturma ekranı) |
| W3 | `push_notification_queue` satırları hiç silinmiyor (token, aktör adı, ID'ler) | `pg_cron`: gönderilmiş satırları 30 gün sonra sil. Eklenince sitede `/delete-account` §4'e süre yazılır |
| W4 | Çıkışta `REACT_QUERY_OFFLINE_CACHE` temizlenmiyor (`lib/query-persister.ts`) → aynı cihazdaki sonraki hesap öncekinin önbelleğini 24 saat görebilir | `AuthContext.signOut` içinde temizle |
| W5 | Fotoğraf moderasyonu yayından sonra ve fail-open (`lib/posts.ts:130-189`, `lib/content-moderation.ts:48-60`) | Bilinen tasarım; değişirse (önce kontrol, sonra insert) site gizlilik §5 madde 8 güncellenir |
| W6 | Admin'in sildiği gönderinin görselleri storage'da kalıyor (`admin_delete_post`) | 1.0 sonrası olabilir |
| W7 | Gurme rozeti hiç açılamıyor (`lib/badge-service.ts:62`) | Düzelt ya da çıkar (site rozet adı saymıyor) |
| W8 | Hukuk sayfaları hep İngilizce açılıyor (`lib/legal-links.ts`); sitede `/<dil>/…` var | `emailConfirmedUrl` gibi dile göre aç |
| W9 | Hava durumu paylaşım anının (`lib/weather.ts` `current=`), kaydın tarihinin değil | `STORE_LISTING.md`'deki "weather of that day" (12 dil) düzelt |
| W10 | Paylaşım linki `/?post=` İngilizce köke gidiyor | İstenirse `/<dil>/?post=` |

W1, W2, W4 kod/SQL değişikliği → build 8'e girmeli; W1 ve W3 `032` migration'ına (S1–S3 ile birlikte).

**Uygulama oturumunun notu (30 Eylül):** W1–W10 okundu, W2 doğrulandı (`hooks/use-image-picker.ts:104`
`slice(0, maxImages)`). **W1 dikkat:** `home_location` sütunu `supabase/migrations/` ve `FULL_SETUP.sql`'te
**hiç yok** — canlıya elle eklenmiş; yalnız `lib/profile-service.ts`, `lib/types/profile.ts`,
`app/(tabs)/index.tsx` kullanıyor. `032`'yi yazmadan önce canlı şemayı salt-okuma kontrol et (sütun tipi,
profiles SELECT politikaları, istemcide `select('*')` kullanan sorgular). Kullanıcı bu turu bir sonraki
oturuma bıraktı. **Sonraki oturumun planı (tek tur):** (1) `032` = S1–S3 + W1 + W3 → PGlite'ta test →
**push etmeden önce `/security-review`** → push → kullanıcı onayı → Security Advisor tekrar; (2) istemci:
W2, W4, W7, W8, W9 (W5, W6, W10 1.0 sonrası); (3) site deposuna `APP_SYNC_2026-09-30.md` (değişen davranış:
fotoğraf sınırı, ev konumu, kuyruk saklama süresi → site metni); (4) `arif_todo.md` + bu dosya.
Değişen her şey site oturumuna geri bildirilmeli (site deposunda `APP_SYNC` dosyası ya da yeni bir `APP_SYNC_<tarih>.md`).

---

## 29 Eylül — finalize taraması

**Kod:** `tsc` temiz · lint 0 hata (176 uyarı) · `i18n:check` geçti (12 × 732) · 20 suite / 211 test ·
`expo export` iOS + Android üretim paketi derleniyor. iOS `buildNumber: "8"` (henüz alınmadı; EAS'te
son iOS build 7), Android `versionCode: 2`. `android/` 29 Eylül'de yeniden üretildi.

**Yayına kadar sıra:** `032` (S1–S3, aşağıda "akşamı") → panel işleri ✅ (SMTP, OpenAI, Firebase, Sentry, site) → **~1 Ekim EAS kotasıyla
iki build de EAS'ten**: iOS build 8 + Android AAB (versionCode 2; yerel Android build bu makinede mümkün
değil, aşağıda "Android build notu") → Play dahili + kapalı test (14 gün şartı en uzun kalem, hemen
başlamalı) → cihaz turu (`arif_todo.md` §3) → App Store gönderimi.

### 29 Eylül akşamı — ek tarama ve kapanış

> İlk taramada kaçan bulgular gün içinde tek tek çıktı (kullanıcı haklı olarak uyardı). Kapanıştan önce
> sistematik ikinci tur yapıldı: Supabase Security Advisor, yedekler, auth ayarları, kullanıcı/rol
> durumu, uygulama içi ve mağaza metinleri, repodaki eski belgeler. Aşağıdakiler o turun sonucu.

**Gün içinde yapılanlar (sırayla):** finalize taraması + `acc5f32` (ikonlar, OpenAI izni, izin metinleri,
temizlik) → `dbc038d` (Sentry org/proje; Android AAB EAS'e) → Sentry token (Chrome ile, EAS secret +
`.env.sentry-build-plugin`) → GitHub Pages kapatıldı → site: gizlilik/silme/`/email-confirmed` 12 dil
(site `63b67be`, deploy `187e919`) → `915d72c` (onay linki `/<dil>/email-confirmed`; Supabase Redirect
URLs `https://odysseyjournal.app/**`) → site devir dosyası `APP_SYNC_2026-09-29.md` (site `2c6f1ab`) →
demo hesap planı (`arif_todo.md` §3b).

**Yeni bulgular — sonraki oturumda ilk iş (build'den önce, kod + onaylı deploy):**
| # | Bulgu | Yapılacak |
|---|---|---|
| S1 | **Security Advisor: `avatars`, `posts`, `collection-covers` bucket'ları listelenebiliyor** — oturumsuz biri bile tüm dosya listesini (tüm kullanıcıların fotoğraf yolları) çekebilir. Herkese açık bucket'ta dosya URL'si SELECT politikası olmadan da açılır; geniş SELECT yalnız listelemeyi açıyor | `032_…sql`: üç bucket'taki geniş SELECT politikasını düşür, yerine sahibinin klasörü (`(storage.foldername(name))[1] = auth.uid()::text`). Hesap silmedeki `listAllUserImages` kendi klasörünü listelediği için çalışmaya devam eder — PGlite'ta ve cihazda test |
| S2 | `get_popular_destinations`, `get_trending_locations` SECURITY DEFINER ve **anon çağırabiliyor** (RLS'i atlayıp gönderi konum özetini döndürüyor; anon `posts` okuyamıyor) | `032`: `REVOKE EXECUTE … FROM anon, public` (yalnız `authenticated`); uygulama bunları oturum açıkken çağırıyor mu diye önce kontrol |
| S3 | `move_profile_push_token()` tetikleyici fonksiyonu anon/authenticated'a EXECUTE açık | `032`: `REVOKE EXECUTE … FROM anon, authenticated, public` (tetikleyici olarak çalışmaya devam eder) |
| S4 | `pg_net` `public` şemasında | Uyarı; taşımak 029'daki `net.http_post` çağrılarını etkiler — **dokunmayın** |
| S5 | Uyarı sayılan ama doğru olanlar: `delete_user_account`, `set_push_token`, `clear_push_token` oturum açmış kullanıcıya açık | Bilerek öyle |

**Doğrulanan durumlar:** günlük yedek var, 7 gün (Pro); **PITR kapalı** → sitedeki "point-in-time recovery"
iddiası yanlış (site `APP_SYNC` §3.4). Sızmış şifre koruması açık, captcha kapalı, e-posta onayı açık,
yalnız Email sağlayıcı açık. **Hiçbir hesapta `is_admin` yok** → moderasyon paneli kimseye görünmüyor
(kullanıcıya SQL verildi, `arif_todo.md` §3b). Demo hesap `review@odysseyjournal.app` boş (§3b).
Repo kökündeki eski yasal kopyalar (`PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md`, `WEBSITE_LEGAL_DOCS.md`)
Keychain / PITR iddialarını taşıyordu → `docs/archive/`'e; kaynak site deposu.

**Code review (`/code-review high 8348967..HEAD`) — 10 bulgu, hepsi aynı akşam kapatıldı:**
| # | Bulgu | Düzeltme |
|---|---|---|
| R1 | **`WRITE_EXTERNAL_STORAGE`'ı engellemek Android ≤ 12'de galeriyi bozuyordu**: expo-image-picker READ+WRITE'ı birlikte istiyor, ikisi de verilmezse "denied" (ImagePickerModule.kt:255-261, 141); Android 9'da kamera da | İzin geri eklendi; engellenenler yalnız `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW` (N9 buna göre) |
| R2 | `await ensureConsent()` butonun kilitlenmesinden önce → çift dokunuşta gönderi/yorum iki kez; açık pencerede ikinci çağrı ilkinin Promise'ini eziyordu | Üç ekranda senkron `submitLock` ref'i; provider açık isteği paylaşıyor; izin diske yazıldıktan sonra cevap dönüyor |
| R3 | Index onboarding bayrağını async okuyup sonra `<Redirect>` ediyordu → açılıştaki deep link üzerine yazılabilirdi | Bayrak açılışta bir kez okunup bellekte; splash (`SplashGate`) onu da bekliyor → index ilk karede yönlendiriyor |
| R4 | Güncellemeden önce giriş yapmış kullanıcılar onboarding düğmesine hiç basmadığı için bayrak yoktu → çıkışta yine onboarding | Oturum açık görülünce `markOnboardingComplete()` (`AuthContext`) |
| R5 | Yorum eklerken eski `comments` kopyası → izin penceresi açıkken yenilenen yorumlar kaybolurdu; kutu, gönderim sırasında yazılanı da siliyordu | Fonksiyonel `setComments`; kutu yalnız gönderilen metin duruyorsa temizleniyor |
| R6 | Ayarlar'da ilk okuma, kullanıcının anahtarı çevirmesinin üzerine yazabiliyordu | `aiConsentTouched` ref'i |
| R7 | İzin yalnız ekranlardaydı; moderasyonu çağıran başka yol (`updateComment` ya da ileride eklenecek bir yol) izni atlayabilirdi | `lib/content-moderation.ts` her çağrıda izni kontrol ediyor, yoksa `AiConsentRequiredError` fırlatıyor ve OpenAI'a hiçbir şey gitmiyor (yeni test) |
| R8 | `locales` `zh-Hans`, `CFBundleLocalizations` `zh` → tutarsız | `CFBundleLocalizations` → `zh-Hans` (uygulamanın kendi dil kodu yine `zh`) |
| R9 | `LEGAL_URLS` adresi üç kez tekrar yazıyordu | `SITE_URL`'den türetiliyor |
| R10 | Provider value her render yeni nesne | `useMemo` |

`/security-review` çalışmadı: yalnız push edilmemiş değişikliklere bakıyor, bugünkü her şey push'luydu.
`032` (S1–S3) yazıldığında push etmeden önce onun üzerinde çalıştırılmalı.
Kontroller: `tsc` temiz · 20 suite / **212 test** · `i18n:check` · lint 0 hata · `android/` yeniden üretildi.

**Hâlâ doğrulanmamış (cihaz/mağaza gerektiriyor):** iOS push için EAS'te APNs anahtarı var mı (build 7
EAS'ten alındı; push testi söyleyecek), Sentry'ye source map yüklemesi (ilk EAS build'i), Android'e push
(FCM), App Store Connect'te önceki TestFlight yüklemelerine ITMS-9105x (privacy manifest) uyarı e-postası
gelmiş mi (kullanıcı e-postasına bakmalı).

### Build oturumu (~1 Ekim) — adım adım
0. **Önce S1–S3 + W1/W3 (`032` migration)** ve **W2, W4** (istemci; "30 Eylül" tablosu) → push → kullanıcı "Deploy Supabase"ı onaylar →
   Security Advisor'da uyarılar düştü mü. Kod değişikliği olmadığı için build'i beklemez ama yayından önce bitmeli.
1. expo.dev → Billing/Usage: iOS ve Android kotası yenilenmiş mi. `eas build:list --limit 3` ile son build'ler.
2. `git status` temiz, `main` = origin. `npx tsc --noEmit --skipLibCheck`, `npm test`, `npm run i18n:check`.
3. `eas build --platform android --profile production` → AAB (versionCode 2). `google-services.json`
   git dışı ama `.easignore` onu dışarıda bırakmıyor → EAS'e gider; `SENTRY_AUTH_TOKEN` EAS secret.
4. iOS build 8: kullanıcı ister kendisi ister oturum alır — `eas build --platform ios --profile production`,
   sonra TestFlight (`eas submit -p ios --profile production`, `ascAppId` `eas.json`'da).
5. İlk build'den sonra Sentry → gultas-software → Releases'ta `com.odysseyjournal.app@1.0.0+…` ve
   source map görünüyor mu (yerel denemede yükleme adımına sıra gelmemişti).
6. Play Console: dahili test → AAB yükle → App integrity'deki iki SHA-1'i Maps SDK anahtarına ekle →
   kapalı test (12 kişi / 14 gün) şartını kontrol et (`store_control.md` §3).
7. Cihaz turu `arif_todo.md` §3 (şifre sıfırlama linki build 8'de çalışmalı).

### Taramada bulunanlar ve durumları
| # | Bulgu | Durum |
|---|---|---|
| N1 | `android/` manifest'inde **eski Maps anahtarı** (prebuild yeni anahtardan önce alınmıştı) | ✅ yeniden prebuild; manifest `AIzaSyB46u…` |
| N2 | Android ikonlarına (foreground, monochrome) **sahte damalı desen gömülü**, alfa yok | ✅ `icon.png`'den yeniden üretildi (gerçek alfa, güvenli alan %59); adaptive arka plan `#F7F6F0` (iOS ikonunun kremi) |
| N3 | Android bildirim ikonu renkli/opak → durum çubuğunda beyaz kare | ✅ `assets/images/notification-icon.png` (beyaz siluet) |
| N4 | **Android'de push hiç çalışmıyor**: FCM / `google-services.json` yok, token alınamıyor (hata yutuluyor) | ✅ `google-services.json` + FCM V1 (kullanıcı, 29 Eylül akşamı); `android/` yeniden üretildi. Cihazda uçtan uca test bekliyor |
| N5 | Supabase'de e-posta onayı açık; varsayılan SMTP yalnız ekip üyelerine gönderir (2/saat) → yeni kullanıcı onay/şifre sıfırlama e-postası alamaz | ✅ Workspace SMTP (hello@ girişi, noreply@ gönderen). Ekip dışı adresle kayıt testi bekliyor |
| N6 | **Apple 5.1.2(i)**: gönderi/yorum metni ve fotoğraflar OpenAI moderasyonuna gidiyor; izin ve açıklama yoktu | ✅ uygulama (aşağıda) · ✅ gizlilik politikası 12 dil (site deposu `63b67be`) |
| N7 | Site `/delete-account` kaldırılmış "Download My Data"yı anlatıyor | ✅ 12 dil "Verilerimi İste" (site `63b67be`) |
| N8 | GitHub Pages hâlâ yayında (`docs/*.html`, eski gizlilik politikası) | ✅ `docs/*.html` silindi · Pages kapatıldı (`gh api -X DELETE …/pages`) |
| N9 | Gereksiz Android izinleri | ✅ `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW` engellendi. `READ_EXTERNAL_STORAGE` **ve `WRITE_EXTERNAL_STORAGE`** (code review R1) **bilerek kaldı**: Android ≤ 12'de `hooks/use-image-picker.ts` galeri izni istiyor, engellenirse fotoğraf seçimi düşer |
| N10 | İzin pencereleri yalnız İngilizce | ✅ `lang/<dil>.json` × 12 + `locales` (iOS; Android kendi metnini kullanır). Konum metnindeki var olmayan "yakındaki destinasyonlar" çıkarıldı |
| N11 | Sentry'ye kaynak haritası yüklenmiyor → yayın çökmeleri okunamaz | ✅ debug ID + eklenti; org `gultas-software` / proje `odyssey-journal` (`app.config.ts`), token EAS'te (secret) ve `.env.sentry-build-plugin`'de |
| N12 | Kayıt onay linki Supabase varsayılanına (localhost) gidiyordu | ✅ `emailRedirectTo: emailConfirmedUrl(language)` → sitenin yeni `/<dil>/email-confirmed` sayfası (süresi dolmuş linkte ayrı mesaj). Supabase: Site URL `https://odysseyjournal.app`, Redirect URLs'e `https://odysseyjournal.app/**` |

**Android build notu (29 Eylül) — yerel build bu makinede mümkün değil, AAB EAS'ten alınacak.**
`./gradlew :app:bundleRelease` iki engele takıldı:
1. Android Studio'nun gömülü JDK'sı 25 → Gradle 8.14.3 açılmıyor ("Unsupported class file major version 69").
   JDK 17 ile (`C:\Program Files\Java\jdk-17`) bu geçiliyor.
2. `:app:buildCMakeRelWithDebInfo[arm64-v8a]` → ninja: `Filename longer than 260 characters`. CMake nesne
   yolu proje yolunu **iki kez** içeriyor (`.cxx/…` altında `C_/Users/…/node_modules/…`): bugünkü yolla 383
   karakter, `C:\oj`'de bile ~269. `subst` ile sürücü kökü de olmuyor (expo-modules-autolinking kökte
   `package.json` bulamıyor). Çözüm ya Windows uzun yol desteği (`LongPathsEnabled`, yönetici) + SDK'dan
   CMake ≥ 3.30 (ninja ≥ 1.12), ya da EAS. **EAS seçildi** (`.easignore` `/android`'i dışarıda bırakıyor →
   EAS kendi prebuild'ini yapar; `google-services.json` yükleniyor, `SENTRY_AUTH_TOKEN` EAS secret).
   Bu build'in düştüğü noktaya kadar Firebase (`processReleaseGoogleServices`), JS paketi ve Sentry modül
   toplama sorunsuzdu; Sentry'ye asıl yükleme adımına sıra gelmedi → ilk EAS build'inde Sentry → Releases'a bakılacak.

### OpenAI izni (N6) — nasıl çalışıyor
- `context/ai-consent-context.tsx` → `useAiConsent().ensureConsent()`: izin yoksa pencere açar, cevaba
  göre `true/false`. Çağrılan yerler: `app/create-post.tsx` (oluştur + düzenle), `app/(tabs)/create.tsx`,
  `app/comments/[postId].tsx`. Reddedilirse hiçbir şey gönderilmez; yorum metni kutuda kalır
  (`CommentInput.onSubmit` artık `false` dönünce temizlemiyor).
- Kayıt: `lib/ai-consent.ts`, AsyncStorage, hesap + cihaz başına (yeni cihaz yeniden sorar).
- Geri alma: Ayarlar → Yasal ve Topluluk → "Yapay zekâ içerik kontrolü" anahtarı.
- Kayıt ekranında onay kutusunun altında bilgi satırı (`aiConsent.signupNotice`).
- Tasarım notu: izin kayıtta değil **ilk paylaşımda** isteniyor — mevcut kullanıcıları da aynı yol
  kapsıyor ve kaydı uzatmıyor; Apple'ın istediği "ilk veri gönderiminden önce açık izin".

### Diğer değişiklikler
- **Onboarding bir kez:** `app/index.tsx` hazır `hooks/use-onboarding.ts`'i kullanıyor; görülünce doğrudan
  girişe. Oturumu düşen kullanıcı sekmelerden `/`'e yönlenir (index karar verir). Mevcut kurulumlar
  onboarding'i bir kez daha görür (bayrak yeni).
- **Temizlik:** şablon `modal` rotası + anahtarları, `reset-project`; hiçbir yerden import edilmeyen
  25 modül ve 23 varlık (`custom-icon`'un SVG'leri, şablon `splash-icon.png`) silindi — Metro onları
  zaten paketlemiyordu. `supabase/` kökündeki eski SQL'ler ve rehberler `supabase/archive/`'e (README:
  `storage-policies*.sql` 030'un kapattığı izinleri geri açar), kökteki 9 eski rehber `docs/archive/`'e.
  `.idea/`, `supabase/.temp/` git dışı.
- `supabase/**` değiştiği için bu push **"Deploy Supabase" onayı** ister; yeni migration yok, `db push`
  boş geçer — onaylamak zararsız.

### Kapsam dışı bırakılanlar (1.0 sonrası)
Paket yükseltmeleri (B4), 176 lint uyarısı (C3), iki kopya oluşturma ekranının birleştirilmesi
(`app/create-post.tsx` ~1900 satır / `app/(tabs)/create.tsx` ~1970 satır; ikisi de `lib/posts.ts` üzerinden
moderasyonlu), Google/Apple girişi, universal link.

---

## 19-20 Eylül durumu (29 Eylül'de güncellenen yerler işaretli)

**Kod:** `main` = son commit, push edildi. iOS `buildNumber: "8"`, Android `versionCode: 2`.
`tsc` temiz · lint 0 hata (185 uyarı) · `i18n:check` geçti · 20 suite / 211 test.
**Canlı veritabanı:** `031`'e kadar uygulandı. `supabase/**` push'ları artık GitHub'da **onay bekler**
(`production` environment) — onayı kullanıcı verir.

**Hangi dosya ne için:**
| Dosya | İçerik |
|---|---|
| **`arif_todo.md`** | Kullanıcının **bütün** işleri, kategorili. Kullanıcı bir işi bitirince orayı ve buradaki ilgili satırı güncelleyin |
| `store_control.md` | App Store / Play formları adım adım |
| `STORE_LISTING.md` | 12 dil mağaza metni + görsel klasörleri |
| Bu dosya | Durum, kararlar, oturum tarafında bekleyenler, teknik geçmiş |

> **Yerel `tsc` ile CI farkı:** `expo-env.d.ts` git dışı ve Expo'nun **web** tip eklerini getiriyor;
> bu yüzden yerelde `backgroundImage` gibi yalnız web'de çalışan stil özellikleri hata vermiyor,
> CI'da (o dosya yokken) veriyor. CI'ınki cihaz gerçeğine daha yakın — bu fark bir hatayı yakaladı
> (yukarıdaki gradyan). Yerelde temiz geçen bir şey CI'da düşerse önce buraya bakın.

**Yayın önündeki tek teknik engel:** iOS build 8 için EAS kredisi (aşağıda). Geri kalanı kullanıcının
mağaza formları ve cihaz testleri (`arif_todo.md`).

### Engel: Expo (EAS) build kredileri bitti — iOS
- **iOS build 8 şu an alınamıyor.** Windows'ta yerel iOS build mümkün değil (Mac + Xcode gerekir;
  `eas build --local` da iOS için macOS ister). Seçenekler:
  1. EAS ücretsiz kotasının aylık sıfırlanmasını beklemek (Android için **1 Ekim** görülmüştü;
     iOS'un tarihi expo.dev → Billing/Usage'dan kontrol edilmeli).
  2. Ücretli EAS planı (güncel fiyat: expo.dev/pricing).
  3. Build 7'yi incelemeye göndermek — **önerilmez**: kayıt ekranındaki Koşullar/Gizlilik linkleri
     ölü, Google/Apple butonları hata veriyor (Guideline 2.1 reddi riski); 19 Eylül güvenlik
     düzeltmelerini de içermiyor.
- **Android:** ~~AAB Android Studio'dan yerel alınıyor~~ → **29 Eylül: AAB de EAS'ten alınacak** (yerel
  build 260 karakter yol sınırına takılıyor). Ayrıca **29 Eylül düzeltmesi:** buradaki "yeniden prebuild gerekmez" yanlıştı — 19 Eylül
  prebuild'i yeni Maps anahtarından önce alınmıştı, manifest eski anahtarı taşıyordu. `android/` 29
  Eylül'de yeniden üretildi; `app.config.ts`'te native bir şey değişince (ya da `google-services.json`
  gelince) **yeniden** `npx expo prebuild --clean -p android` gerekir.

### Oturum tarafında bekleyenler (kullanıcıdan haber gelince)
| Tetikleyici | Oturum ne yapar |
|---|---|
| İlk Play yüklemesi yapıldı | Play Console → App integrity'deki upload + app signing SHA-1'lerini kullanıcıyla Maps SDK anahtarına ekle (upload anahtarı EAS'te; `.jks` yok) → kullanıcı Maps SDK anahtarına ekler |
| Kullanıcı legacy Supabase anahtarlarını kapattı | Salt-okuma testi: publishable anahtarla REST 200, eski anon JWT ile 401 |
| Push testi başarısız | `push_notification_queue` ve `push_tokens`'a bak (SQL'i kullanıcıya ver) |
| Play "12 test kullanıcısı / 14 gün" şartı çıktı | Kapalı test kurulumuna yardım |
| Cihaz testinde hata | Düzelt; `supabase/` değişirse push sonrası onay kullanıcıda |

### Kullanıcı kararları (yeniden açmayın)
- **Web sitesi hiçbir zaman kullanıcı içeriği göstermeyecek** (19 Eylül): sitede giriş yok, dolayısıyla
  gönderi/profil sayfası anlamsız. Site statik: ana sayfa (mağaza linkleri), gizlilik, şartlar, destek,
  hesap silme. Paylaşım linki ana sayfaya gider (`/?post=<id>`); `id` yalnız ileride kurulabilecek
  universal link / App Link (uygulama yüklüyse gönderiyi uygulamada açar) için linkte duruyor.
- **Veri kopyası yalnız e-postayla** (privacy@), uygulama içi dışa aktarma yok.
- İtalyancadaki alıntı kelimeler (Post, Badge, Account…) bilerek bırakıldı (§0).
- Google / Apple girişi 1.0'da kapalı, 1.1'e bırakıldı.
- `supabase/**` deploy'u onaylı (D6) — hangisi iyiyse diye kullanıcı oturuma bıraktı.

### Google Maps anahtarları (D4) — durum
Repo **public** ve eski Maps anahtarı (`AIzaSyCEGo…`, daha eskisi `AIzaSyDzxS…`) git geçmişinde açık.
19 Eylül'de iki yeni kısıtlı anahtar kuruldu ve oturum doğruladı:
- **"Odyssey Android Maps SDK"** → `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`. Android apps kısıtı
  (`com.odysseyjournal.app`), yalnız Maps SDK for Android. Düz HTTP'de 403 → kısıt çalışıyor.
  Harita yüklemeleri ücretsiz. iOS'ta harita Apple Maps, bu anahtar kullanılmıyor.
- **"Odyssey Static Maps"** → `EXPO_PUBLIC_GOOGLE_STATIC_MAPS_API_KEY` (profildeki statik harita;
  düz HTTP olduğu için uygulama kısıtı konamaz). Yalnız Maps Static API, günlük kota **300**
  (ayda ~9.000 < 10.000 ücretsiz → kötüye kullanımda bile ücret çıkmaz). Bütçe uyarısı var; o yalnız
  e-posta atar, harcamayı durduran kota.

SHA-1'ler üç aşamada (Maps SDK anahtarına **+ Add**, aynı paket adıyla):
- ✅ debug: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` — RN şablonunda herkeste
  aynı, **yayından önce kaldırılır**.
- ✅ upload key (EAS keystore): SHA-1 `88:FA:45:45:FD:1A:47:4C:26:60:AA:96:AA:AA:93:7B:43:C2:A8:3F`
  (SHA-256 `EB:7F:…:45:2A`, sitede zaten var). 5 Ekim'de Play → Uygulama imzalama'dan okundu.
- ✅ app signing key (Google): SHA-1 `83:64:A8:D9:2E:FE:E7:C6:A4:40:76:A6:2F:CB:F1:D4:D2:82:57:5C`,
  SHA-256 `F4:29:A7:DF:75:03:47:F9:1F:20:7B:0C:47:35:CF:3A:0B:81:4E:27:D2:92:DC:0B:E1:12:57:4E:0B:86:53:08`
  (siteye `APP_SYNC_2026-10-05b`, site `1e0c973`). **Bu SHA-1 eklenmezse Play'den kurulan uygulamada harita boş gelir.**

Kalan: yeni build'lerde harita çalışınca eski iki anahtarı silmek (kullanıcı, `arif_todo.md` §7).

### 19-20 Eylül'de yapılanlar (özet — ayrıntı aşağıda ve §0, §3)
| Konu | Sonuç |
|---|---|
| IT/DE "Follower" | Seguaci / Abonnenten; i18n kural 2 yakın eşleşmeleri de yakalıyor |
| Ayarlar → Hesap sağ ikonlar | kaldırıldı (`rightElement={null}`) |
| Derleme etiketi | platforma göre (iOS buildNumber / Android versionCode) |
| `supportsTablet: false` | iPad ekran görüntüsü istenmiyor |
| Push bildirimleri | **hiç gönderilmemişti** → `029` ile Postgres'ten (`pg_cron` + `pg_net`) doğrudan Expo'ya; token'lar artık `push_tokens`'ta (030). Uçtan uca cihaz testi yapılmadı |
| Supabase anahtarları | yeni `sb_publishable_` / `sb_secret_` devrede; legacy henüz açık |
| Web sitesi | `https://odysseyjournal.app` (Hostinger) yayında; `/privacy-policy`, `/terms`, `/support`, `/delete-account` 200. GitHub Pages **kullanılmıyor** |
| Kayıt ekranı linkleri (8e4bb2e) | Koşullar / Gizlilik `lib/legal-links.ts` üzerinden siteyi açıyor; Ayarlar → Yasal'a iki satır |
| Google / Apple girişi (8e4bb2e) | Supabase'de **ikisi de kapalı**; butonlar `SOCIAL_SIGN_IN_ENABLED = false` ile gizli. Açmak için: Apple Services ID + key, Google OAuth client → Supabase Providers → bayrak `true`. Apple 4.8: Google varsa Apple da olmalı |
| Veri kopyası | Uygulama içi "Verilerimi İndir" kaldırıldı → "Verilerimi İste" (`mailto:privacy@`), 12 dil, site ile aynı |
| **Code + security review** | 5 kritik/yüksek, 7 orta, 7 düşük bulgu ("Review bulguları"). `030` + `031` canlıda, istemci düzeltmeleri e80f841 / e5af2fc. Açık: D4 (kısmen), D5, D7 — hepsi kullanıcı tarafı |
| Supabase deploy | `production` environment onayı + CLI `2.117.0` sabit (D6) |
| `moderate-content` | yalnız bu projenin `posts` görselleri, ≤ 10 görsel, ≤ 20k karakter; hata metni istemciye gitmiyor (D3) |
| Google Maps | yeni SDK + Static anahtarları, kota 300 (yukarıda) |
| Paylaşım linkleri (O2) | `/post/<id>` 404 idi → `/?post=<id>` (ana sayfa). Site gönderi göstermeyecek (kullanıcı kararı) |
| Mağaza metinleri (C6) | `STORE_LISTING.md` **12 dil**, sınırlar script'le doğrulandı; yanlış "çevrimdışı yazma" iddiası ve "4+" çıkarıldı |
| Mağaza görselleri | 12 dil × 8 ekran × iOS/Android (192) + 12 feature graphic, yerelde maliyetsiz (`compose.js`, `feature-graphic.js`, `fonts.js`: JA/KO/ZH/AR için Noto Serif / Naskh, `mockup_feature/_work/fonts/`, git dışı). Satır genişlikleri script'le ölçüldü; arayüz her dilde EN. İlk EN/TR seti fal ile (~$1.16, §3 A3) |
| KO çeviri hatası | `컨렉션` → `컬렉션` (3 yer, `ko.ts`) |
| Web sitesi metin hataları | kullanıcı düzeltiyor (`arif_todo.md` §6) |
| CI action'ları (20 Eylül) | GitHub Node 20 action'larını Node 24'e zorluyor + uyarı veriyor → `checkout`/`setup-node`/`upload-artifact` **v7**, `supabase/setup-cli` **v3** (CLI yine 2.117.0'a sabit, artık npm'den), `expo-github-action` **v9**. İşlerin kendi Node'u 20/18 → **24** (ikisinin de desteği bitmişti). `supabase-deploy`'a `workflow_dispatch` eklendi |
| **CI'da tip kontrolü hiç çalışmamış** | `tsc --exclude supabase/functions` — `tsc`'de böyle bir seçenek yok (TS5023), adım her seferinde düşüyordu ve `continue-on-error` bunu gizliyordu. Seçenek kaldırıldı (`tsconfig.json` zaten hariç tutuyor); lint ve tsc artık hata verirse CI kırmızı (uyarılar kırmaz) |
| Profil günlük kartlarında gradyan | `backgroundImage: 'linear-gradient(...)'` **yalnız web CSS'i** → cihazda hiç çizilmiyordu. `expo-linear-gradient` ile gerçek gradyan (`app/user-profile/[id].tsx`, 2 yer). **Cihazda bakılmalı** |

### Review bulguları — 19 Eylül (repo + canlıya salt-okuma yoklama)
> **Durum:** K1, K2, Y1–Y5, O1, O3–O7, D1, D2, D3 **düzeltildi** (aşağıda "Review düzeltmeleri").
> Açık: **D4** (kısmen, yukarıda "Google Maps anahtarları"), **D5, D7**. O2 ✅ (ana sayfaya yönlendirme). D6 ✅ (environment onayı). Aşağıdaki metin bulguların ilk hâli; satır numaraları 030 öncesine ait.

Kaynak: `FULL_SETUP.sql` + `supabase/migrations/*` + istemci kodu. Canlıda yalnızca anon REST
yoklaması yapıldı (anon `profiles`/`posts` okuyamıyor → `is_blocked_by` anon'a kapalı, iyi;
`interactions` tablosu **yok**). Sütun yetkileri ve fonksiyon gövdeleri canlıda doğrulanmadı →
aşağıdaki SQL.

**Kritik**
- **K1 — Kullanıcı kendini admin yapabilir / banını kaldırabilir.** `profiles` UPDATE politikası
  yalnızca `auth.uid() = id` bakıyor (`019_…sql:134`), sütun kısıtı yok, koruyan trigger yok.
  `supabase.from('profiles').update({ is_admin: true })` → admin paneli + `admin_delete_post` /
  `admin_ban_user` açılır. Aynı yolla `is_banned=false`, `followers_count`, `posts_count` de yazılır.
  Düzeltme: BEFORE UPDATE trigger (auth.uid() sahibiyse `is_admin/is_banned/banned_at/*_count`
  değişemez) ya da `REVOKE UPDATE` + yalnız izinli sütunlara `GRANT UPDATE (…)`.
- **K2 — Hesap silme canlıda hata veriyor olabilir.** `011_delete_user_account.sql:45`
  `DELETE FROM public.interactions` — tablo canlıda yok (PGRST205). 011 sürümü canlıdaysa RPC her
  seferinde düşer; uygulama "genel hata" gösterir (Apple 5.1.1(v) reddi). `FULL_SETUP.sql`
  sürümünde bu satır yok; hangisinin canlıda olduğu SQL #3 ile görülür. Ayrıca hiçbir sürüm
  storage'daki avatar / gönderi görsellerini silmiyor (URL'ler herkese açık kalıyor).

**Yüksek**
- **Y1 — Herkes herkesin avatarını ezebilir/silebilir.** `FIX_AVATAR_UPLOAD.sql` + `FULL_SETUP.sql:992-994`
  avatars UPDATE/DELETE'i tüm authenticated'a açıyor. Sebep: `profile-service.ts:352` yolu
  `avatars/<uid>-<ts>` (klasör uid değil) → sahiplik politikası işlemiyordu. Düzeltme: yol
  `${userId}/…` + sahiplik politikaları (collection-covers'daki gibi).
- **Y2 — `posts` bucket'a herkes her yola yazabilir.** INSERT yalnız `bucket_id` + authenticated
  (`FULL_SETUP.sql:998`); klasör, MIME, boyut sınırı yok → herkese açık dosya barındırma,
  başkasının klasörüne dosya bırakma. Düzeltme: `(storage.foldername(name))[1] = auth.uid()::text`
  + bucket `allowed_mime_types = {image/jpeg,image/png,image/webp}`, `file_size_limit`.
- **Y3 — Engelleme DM'leri kapsamıyor.** `messages` INSERT yalnız `sender_id = auth.uid()`;
  `lib/chat.ts`'de de engel kontrolü yok. Engellenen kişi mesaj atmaya devam eder (okunmamış
  sayacı artar, realtime düşer). UGC şartı açısından önemli. Düzeltme: INSERT WITH CHECK'e
  `NOT public.is_blocked_by(sender_id, receiver_id)`; SELECT'e de aynısı.
- **Y4 — Herkes herkese bildirim + push üretebilir.** `notifications` INSERT: `auth.uid() = actor_id`,
  `user_id` serbest → engel ve bildirim tercihleri atlanır, döngüyle push spam. İstemci
  bildirimi hiç doğrudan eklemiyor (hepsi SECURITY DEFINER tetikleyici) → politikayı düşürmek yeter.
- **Y5 — `expo_push_token` her oturum açmış kullanıcıya açık** (profiles SELECT tüm sütunlar;
  `is_admin`, `notification_preferences` da). Expo push, "enhanced push security" kapalıyken
  kimlik istemediği için token'ı bilen herkes o cihaza push atabilir. Düzeltme: token'ı yalnız
  sahibinin okuyabildiği ayrı tabloya taşımak ya da `REVOKE SELECT (expo_push_token, …)`.
  (Kolon REVOKE'u `select('*')` kullanan sorguları kırar → önce istemcide `*` taraması.)

**Orta**
- **O1 — Şifre sıfırlama akışı çalışmıyor.** `forgot-password.tsx:81` `odysseyjournal://reset-password`'a
  yönlendiriyor ama bu rota/ekran yok, `PASSWORD_RECOVERY` dinlenmiyor, token hiç
  kullanılmıyor. Kullanıcı e-postadaki linke basınca hiçbir şey olmaz. Ayrıca Supabase Auth →
  Redirect URLs'de bu şema kayıtlı olmalı.
- **O2 — Paylaşım linkleri 404.** `lib/share.ts:59` `https://odysseyjournal.app/post/<id>` → sitede
  404; AASA / assetlinks de 404 (universal link yok). Ya sitede `/post/*` sayfası ya da mesajdan URL'yi çıkarmak.
- **O3 — Gönderi düzenleme moderasyonsuz.** `updatePost` (`lib/posts.ts:201`) metin/görsel
  moderasyonu çağırmıyor; temiz gönderi sonradan değiştirilebilir. (Moderasyon zaten tamamen
  istemcide ve fail-open — doğrudan API çağrısıyla atlanabilir; bilinen tasarım sınırı.)
- **O4 — Gönderi hız sınırı `created_at` geri alınarak atlanır.** `created_at` istemciden geliyor
  (`posts.ts:165`, seyahat tarihi) ve limit `created_at >= now()-1h` sayıyor.
- **O5 — Alıcı, aldığı mesajın `content`/`sender_id`'sini değiştirebilir** (UPDATE politikası sütun
  kısıtsız); DELETE her iki tarafa da tüm satırı sildiriyor ("benden sil" UI'si dışında).
- **O6 — Profil sekmesinden çıkışta push token silinmiyor** (`(tabs)/profile.tsx:181` → `signOut`;
  yalnız Ayarlar yolu `removePushToken` çağırıyor). Aynı cihazda sonraki hesap öncekinin
  bildirimlerini alır. Düzeltme: `removePushToken`'ı `AuthContext.signOut` içine almak.
- **O7 — Gönderi sahibi `likes_count`/`comments_count`'u yazabilir** (posts UPDATE sütun kısıtsız) → trend manipülasyonu.

**Düşük / bakım**
- **D1** `fix_function_search_path.sql` elle yeniden çalıştırılırsa bildirim tercihi kontrolünü
  (023) geri alır. Numarasız 4 dosyayı `db push` zaten atlıyor → `supabase/archive/`'e taşıyın.
- **D2** `send-push-notifications` hâlâ repoda; CI `supabase functions deploy` her seferinde yeniden
  deploy ediyor. Silinmeli + `supabase functions delete send-push-notifications`.
- **D3** ✅ `moderate-content` iç hata metnini istemciye döndürüyordu; `imageUrls` serbestti. Artık hata yalnız logda, istemciye `"Moderation unavailable"`; en fazla 10 görsel, yalnız bu projenin `posts` bucket URL'leri, metin ≤ 20.000 karakter (aksi 400).
- **D4 — kısmen ✅** Google Maps anahtarı git geçmişinde ve **repo public**. Yeni kısıtlı anahtarlar
  kuruldu (yukarıda "Google Maps anahtarları"); eski anahtarların silinmesi yeni build'lerden sonra. Service-role / sb_secret **geçmişte yok** ✅.
- **D5** `npm audit --omit=dev`: 46 (2 critical: `tar`, `shell-quote`) — hepsi expo-cli/metro
  derleme araçlarında, uygulama paketinde değil. Yayından önce yükseltmeyin (B4).
- **D6** ✅ `supabase-deploy.yml` onaysız canlıya `db push` + CLI `version: latest` idi. Artık
  `environment: production` (required reviewer) + CLI `2.117.0`.
- **D7** E-postayla veri talebi: privacy@ yanıt vermeden önce talebin hesabın kendi
  e-postasından geldiğini doğrulamalı (süreç notu).

### Review düzeltmeleri — 19 Eylül
`supabase/migrations/030_security_fixes.sql` (PGlite'ta FULL_SETUP + 004/025/028/011 üstünde
33 kontrolle test edildi; `posts_count`'suz şemada da):
- **K1** `guard_profile_columns` tetikleyicisi: istemci (`authenticated`/`anon`) `is_admin`,
  `is_banned`, `banned_at`, takipçi/gönderi sayaçlarını yazamaz — eski değer geri konur, hata
  vermez. SECURITY DEFINER sayaç tetikleyicileri ve admin fonksiyonları etkilenmez.
- **K2** `delete_user_account` `interactions`'sız yeniden tanımlandı. İstemci dosya yollarını
  RPC'den önce listeliyor, RPC **başarılı olunca** siliyor (`listAllUserImages` /
  `removeUserImages`, `lib/image-upload.ts`) — RPC düşerse hesap görselleriyle kalır. Silme,
  kullanıcı silindikten sonra hâlâ geçerli olan oturum JWT'siyle yapılıyor; test hesabı silinince
  `posts/<uid>/` ve `avatars/<uid>/`'in boşaldığı Dashboard → Storage'dan doğrulanmalı.
- **Y1/Y2** avatars + posts bucket'larındaki tüm politikalar düşürülüp sahiplik temelli yeniden
  kuruldu; üç bucket'a MIME (görsel) + 10 MB sınırı. Avatar yolu artık `<uid>/<zaman>.jpg`
  (`uploadImage` ile, JPEG). Eski `avatars/<uid>-…` dosyaları sahibi tarafından değiştirilebilir/silinebilir.
  **Eski build'lerde (TestFlight 7) avatar yükleme artık başarısız olur** — beklenen.
- **Y3** Engellenen kullanıcı mesaj gönderemez (INSERT politikası). **O5** alıcı yalnız
  `is_read`'i değiştirebilir (`guard_message_columns`).
- **Y4** `notifications` INSERT politikası kaldırıldı.
- **Y5** Token'lar `push_tokens` tablosunda (yalnız sahibi okur; yazma `set_push_token` /
  `clear_push_token` RPC'leriyle). Mevcut token'lar taşındı, `profiles.expo_push_token` boşaltıldı.
  Eski build'ler hâlâ o sütuna yazarsa tetikleyici token'ı `push_tokens`'a taşıyıp sütunu boşaltır
  → eski build'lerde push çalışmaya devam eder. Bir cihaz token'ı tek hesaba ait.
- **O4** `posts.inserted_at` (sunucu zamanı) — hız sınırı artık buna göre; yorumların `created_at`'i sunucuda sabitleniyor.
- **O7** gönderi sahibi `likes_count`/`comments_count` yazamaz (`guard_post_columns`).

İstemci: **O1** `app/reset-password.tsx` (linkteki token/`code` → oturum → mevcut
`ChangePasswordModal`; hatada `errors.linkExpired`). **O3** `updatePost` metin + yeni görsel
moderasyonu; kaldırılan görseller artık yalnız güncelleme başarılı olunca siliniyor.
**O6** `removePushToken` artık `AuthContext.signOut` içinde (her çıkış yolu).
**D1** numarasız 4 SQL → `supabase/archive/` (README: yeniden çalıştırmayın). **D2**
`send-push-notifications` repodan silindi — **deploy edilmiş kopyası duruyor**, kaldırmak için:
`npx supabase functions delete send-push-notifications --project-ref <ref>`.
`FULL_SETUP.sql` başına "030'u da uygula" notu. Açık kalanlar: O2 (site), D3, D4, D5, D6, D7.

**031_follow_counter_and_covers.sql** (doğrulama SQL'inin bulduğu iki kalıntı):
- Canlıda `follows` üstünde **iki** takip sayacı tetikleyicisi vardı (`trigger_update_follow_counts`
  FULL_SETUP'tan, `update_follower_counts_trigger` 004'ten) → her yeni takip 2 sayılacaktı.
  `follow_count_drift: 0` idi, yani henüz olmamıştı. 004'ünki düşürüldü; sayılar `follows`'a göre
  yeniden eşitlendi (fark yoksa satır değişmez). Beğeni/yorum sayaçlarında tek tetikleyici var.
- `collection-covers`'ın SELECT politikası canlıda yoktu → kullanıcı kendi kapağını
  silemiyor/değiştiremiyordu ve hesap silmede kapaklar listelenemiyordu. Eklendi.
PGlite'ta 030 üstünde test edildi (takip tek sayılıyor).

**Doğrulama SQL'i (salt okuma, kullanıcı çalıştırır).** Supabase SQL editörü yalnız **son**
sorgunun sonucunu gösterir; bu yüzden tek sorgu, tek satır JSON. 030 sonrası beklenen:
`profiles_triggers` içinde `guard_profile_columns` ve `move_profile_push_token`, `k2_broken: false`,
`notif_insert_policies: 0`, `profile_tokens_left: 0`, `buckets` üçünde de `10485760`,
`prefs_respected` hepsi `true`. `follow_count_drift` > 0 ise takipçi sayıları tutmuyor
(`follows_triggers`'da iki sayaç tetikleyicisi varsa çift sayım):
```sql
select jsonb_pretty(jsonb_build_object(
  'profiles_triggers', (select jsonb_agg(tgname order by tgname) from pg_trigger
                        where tgrelid = 'public.profiles'::regclass and not tgisinternal),
  'follows_triggers',  (select jsonb_agg(tgname order by tgname) from pg_trigger
                        where tgrelid = 'public.follows'::regclass and not tgisinternal),
  'k2_broken',         (select bool_or(position('interactions' in prosrc) > 0) from pg_proc
                        where proname = 'delete_user_account'),
  'notif_insert_policies', (select count(*) from pg_policies
                        where schemaname = 'public' and tablename = 'notifications' and cmd = 'INSERT'),
  'storage_policies',  (select jsonb_agg(policyname order by policyname) from pg_policies
                        where schemaname = 'storage' and tablename = 'objects'),
  'buckets',           (select jsonb_object_agg(id, file_size_limit) from storage.buckets),
  'push_tokens',       (select count(*) from public.push_tokens),
  'profile_tokens_left', (select count(*) from public.profiles where expo_push_token is not null),
  'prefs_respected',   (select jsonb_object_agg(proname, position('notification_preferences' in prosrc) > 0)
                        from pg_proc where proname in ('create_like_notification',
                        'create_comment_notification', 'create_follow_notification')),
  'follow_count_drift', (select count(*) from public.profiles p
                        where p.followers_count <> (select count(*) from public.follows f where f.following_id = p.id)
                           or p.following_count <> (select count(*) from public.follows f where f.follower_id = p.id))
)) as report;
```

**Kısıtlar (önceki oturumlardan):** canlı veritabanına yazma ve auth admin çağrıları izin sınıflandırıcısı
tarafından reddediliyor — etrafından dolaşmayın, SQL'i kullanıcıya verin. iOS build'i kullanıcı alır.
Kullanıcıya her zaman Türkçe yanıt.

---

## 0. 19 Eylül — cihazda görülen iki düzeltme + küçük temizlik

**"FOLLOWER" İtalyancada İngilizce kalıyordu.** Donma hatası değildi: `it.ts` ve `de.ts`'de
değer gerçekten `'Follower'` idi. `i18n:check` kural 2 yalnızca İngilizceyle **birebir aynı**
değerleri yakalıyordu; "Follower" ≠ "Followers" olduğu için geçti.
- IT → **Seguaci** (liste başlığı, profil sayacı, bildirim ayarı "Nuovi seguaci", boş durum
  "Ancora nessun seguace", hata metni). DE → **Abonnenten** (aynı 7 yuva).
- Diğer İtalyanca alıntı kelimeler (Post, Badge, Account, Password, Email, Feed) **bilerek
  bırakıldı** — İtalyancada standart kullanım. Kullanıcı kararı; yeniden açmayın.
- Push şablonu zaten doğruydu (`028_…sql:85` "ha iniziato a seguirti").
- **Kural 2 genişletildi:** büyük/küçük harf ve sondaki "s" yok sayılarak karşılaştırılıyor.
  Meşru 10 yakın eşleşme (IT: Categorie, Post, Badge, Note…; DE: Kilometer)
  `i18n-allowed-identical.json`'a eklendi. Negatif test: `Seguaci` → `Follower` geri
  alınınca kural `[it] profile.followers` diye düşüyor.

**Ayarlar → Hesap:** "Engellenen Kullanıcılar" ve "Verilerimi İndir" satırlarının sağındaki
ikonlar (ban / download) kaldırıldı, soldaki ikonlar duruyor. `rightElement={null}` verildi —
prop'u silmek `SettingsRow`'un varsayılan `>` okunu gösterirdi.

**Build 5 öncesi aynı gün eklenenler:**
- `supportsTablet: false` — `true` iken App Store Connect 13" iPad ekran görüntüsü istiyordu;
  uygulama yalnızca dikey ve telefon için tasarlandı. iPad'de iPhone uyumluluk modunda açılır.
  `ios.buildNumber` → `'5'`.
- **Ayarlar'daki "Derleme" etiketi iOS'ta hep 1 gösteriyordu:** `android.versionCode || ios.buildNumber`
  okuyordu, yani iOS'ta da Android'in `1`'i çıkıyordu. Artık platforma göre.
- `eas.json` → `cli.appVersionSource: "local"` açıkça yazıldı; build numarası
  `app.config.ts`'ten gelir (elle artırma düzeni aynen devam).
- **B3 yapıldı** (ana dil gözden geçirmesi yerine inceleme): JA'dan `CH:'瑞'`, `SE:'典'`
  (Japoncada 瑞 hem İsviçre hem İsveç, 日瑞 iki türlü okunur — ZH ile aynı karar) ve `BE:'白'`
  (nadir, "beyaz"/白露 Belarus okunur) çıkarıldı → ISO. ZH tablosu olduğu gibi doğru.
  Kayıtlı 14 gönderinin hiçbiri bu karakterleri kullanmıyor.
- **A6 kısmen doğrulandı (salt okuma, bildirim gitmedi):** `push_notification_texts` canlıda
  12 dil × 6 tip (`actor_fallback, comment, default, follow, like, mention`), eksik yok. Tablo ve
  tetikleyici aynı migration'da (028) → tetikleyici de canlı. Kuyruktaki son kayıtlar Temmuz'dan
  (028 öncesi), yani gerçek bir yerelleştirilmiş bildirim henüz görülmedi. Uçtan uca kanıt
  isteniyorsa `I18N_HANDOFF.md` §5'teki ROLLBACK'li sorgu hâlâ geçerli.

**Küçük temizlik:** B1 (preview build artık yalnızca `workflow_dispatch`), C1 + C2
(`tsc_*.txt` ve `scratch/` `.gitignore`'da, repodan çıkarıldı — dosyalar diskte duruyor).

`tsc` temiz · `i18n:check` geçti · 20 suite / 211 test · lint 0 hata / 185 uyarı.
**Cihazda doğrulanmadı** — yeni build gerekiyor.

---

## 1. 17-18 Eylül — React Compiler turu

**Bildirilen sorun:** Dil İngilizce seçiliyken Ayarlar'da "TITOLARE DEL PASSAPORTO" /
"MODIFICA PROFILO", Profil'de "Carta d'imbarco / Paesi / Chilometri / Giorni" İtalyanca
kalıyordu. Aynı ekranın geri kalanı doğru İngilizceydi.

**Kök neden — eksik çeviri değildi.** `app.config.ts` içinde `experiments.reactCompiler: true`
açık. Dil context'indeki `t` şöyle yazılmıştı:

```tsx
const translate = useCallback((key, options) => t(key, options), [language]);
//                                                                ^ gövdede hiç okunmuyor
```

React Compiler bağımlılık dizisine bakmaz, gövdeden kendi çıkarımını yapar. Gövde `language`'i
kullanmadığı için fonksiyonu modül kapsamına kaldırıyordu — derlenmiş çıktı birebir
`var translate = _temp`. Yani `t`'nin kimliği uygulama boyunca hiç değişmiyordu. Derlenen her
bileşen de çevirilerini tam o kimliğe göre önbelleğe alıyor:

```js
if ($[7] !== t) { t4 = t("post.boardingPass"); ... } else { t4 = $[8]; }
```

Sonuç: her metin **bir kez** hesaplanıp bileşenin ilk açıldığı andaki dilde donuyordu.
Ekrandaki karışıklığın sebebi derleyicinin bazı dosyalarda pes etmesiydi: `app/settings.tsx`
optimize edilmemiş (→ doğru İngilizce), `components/settings/profile-card.tsx` edilmiş
(→ donmuş İtalyanca).

**Ölçüm:** `app/` + `components/` altındaki 99 `.tsx` dosyasının 57'si optimize ediliyor,
**18 dosyada 66 donmuş çeviri yuvası** vardı — dil seçme modalının kendisi dahil.

**Düzeltme:** Dil artık veri olarak akıyor — `t(key, { locale: language, ...options })`.
`language` gövdede gerçekten okunduğu için derleyici onu gerçek bağımlılık sayıyor, `t` her
dil değişiminde yeni kimlik alıyor, 66 önbellek yuvasının hepsi geçersiz kılınıyor.

**Yanında düzeltilenler:**
- `components/change-password-modal.tsx` çevrilmiş hata metnini state'e yazıyordu; artık
  **anahtar** saklanıyor (`lib/auth-errors.ts` → `localizedErrorKey()`).
- Açılışta ilk kare cihaz dilinde çiziliyordu; hesaplanan ama hiç okunmayan `isReady` bayrağı
  artık `app/_layout.tsx` içindeki `SplashGate` ile splash'ı bekletiyor.
- Çökme ekranı `LanguageProvider`'ın dışındaydı, cihaz dilini kullanıyordu; içeri alındı.
- Profil haritasının pin başlıkları ve statik harita URL'si uygulama dilini takip ediyor;
  `app.config.ts` → `ios.infoPlist.CFBundleLocalizations` 12 dili bildiriyor.

**Yeni koruma — `i18n:check`'in 6. kuralı.** Hata tamamen derleme çıktısında yaşıyordu: kaynak
koda bakan hiçbir lint kuralı ve hiçbir Jest testi göremezdi, çünkü Jest React Compiler'ı
çalıştırmıyor. `scripts/i18n-compiler-check.js` dosyayı Metro'nun gerçek `caller` bayraklarıyla
derleyip üç durumu ayırt ediyor, üçü de elle test edildi:

| Derleme çıktısı | Sonuç |
|---|---|
| `var translate = _temp` (modül kapsamına kaldırılmış) | ❌ yayınlanan hata |
| `useCallback` yerinde (derleyici dosyadan vazgeçmiş) | ❌ memoizasyon kayıp, doğrulanamıyor |
| `$[n] !== language` ile anahtarlanmış blok | ✅ |

İkinci durum teorik değil: bu turda `LanguageProvider` gövdesine bir `try` eklenince derleyici
**bütün dosyadan** vazgeçti ve kural bunu yakaladı. Bu yüzden hata yakalama modül seviyesindeki
`applyLayoutDirection` içine taşındı — **provider gövdesine `try` koymayın.**

Ayrıca `lib/__tests__/i18n-locale-option.test.ts` düzeltmenin dayandığı `t(key, { locale })`
davranışını doğruluyor.

**Commit:** `12ba4f2` — `main`'de, push edildi. 11 dosya, +459/-58.
`npx tsc --noEmit` temiz · `i18n:check` 6 kural · `npm test` 20 suite / 211 test · lint 0 hata.

Bu commit'in üstüne iki build cut'ı geldi: `70f4ff1` (build 3) ve `2fc5259` (build 4,
"Language issue"). İkisi de yalnızca `ios.buildNumber` artırıyor, kod değişikliği yok —
yani **TestFlight build 4 bu düzeltmeyi taşıyor** ve cihazda doğrulanmayı bekliyor.

---

## 2. Tek bakışta nerede kaldık

| Alan | Durum |
|---|---|
| Kod geliştirme (34 özellik, 55+ bileşen) | ✅ |
| 12 dil × 727 anahtar, %100 eşit | ✅ |
| Dil değişiminde donan metinler | ✅ düzeltildi (§1), **cihazda doğrulanmadı** |
| Arapça RTL | ✅ yapıldı, **görsel doğrulaması yok** |
| Yer adları (Wikidata, 6.209 şehir × 12 dil) | ✅ canlıda, backfill 13/13 |
| `npm test` | ✅ 20 suite / 211 test |
| `npx tsc --noEmit` | ✅ temiz |
| `npm run lint` | ✅ 0 hata (185 uyarı) |
| `npx expo-doctor` | ⚠️ 16/17 — 16 paket sürüm uyuşmazlığı |
| Hesap silme (Apple şartı) | ✅ `delete_user_account` RPC, çift onaylı |
| Şikâyet / engelleme (UGC şartı) | ✅ `report-modal`, `blocked-users`, `community-guidelines` |
| Legal dokümanlar & KVKK | ✅ |
| Mağaza metinleri (`STORE_LISTING.md`) | ✅ EN + TR hazır |
| iOS TestFlight | build 7 (yeni anahtar) test ediliyor · **build 8 EAS kredisi bekliyor** |
| Android production build | **EAS'ten** AAB (versionCode 2) alınacak (29 Eylül) · 19 Eylül EAS AAB `324319a5` kullanılmayacak |
| Mağaza ekran görüntüleri / mockup | ✅ 32 kare + 2 Feature Graphic, `mockup_feature/` (§3 A3) |
| **Push bildirimleri** | ⚠️ hiç gönderilmemişti — 029 ile düzeltildi, cihazda uçtan uca doğrulanmadı (§3 B2) |
| Mağazaya gönderim | ❌ |

---

## 3. Finalize için kalanlar

### A — Yayını durduran işler

**A1. Android `versionCode` elle artırılıyor — ilk yüklemeden SONRA unutmayın.**
_Düzeltme (19 Eylül):_ ilk AAB için `1` geçerli; Play yalnızca **aynı** kodu ikinci kez reddeder.
Aşağıdaki uyarı ikinci yüklemeden itibaren geçerli.

`app.config.ts:32` hâlâ `versionCode: 1`, iOS ise `buildNumber: '4'`. Play Console aynı
`versionCode` ile ikinci bir yükleme kabul etmez; ilk AAB'yi yüklemeden fark edilmezse her
denemede takılırsınız. iOS'ta her build'de elle artırılıyor, Android'de hiç artırılmamış.
**Yapılacak:** Android'e ilk yüklemeden önce artırın, sonrasında her yüklemede. İkisini
otomatik artırmak isterseniz `eas.json` içinde `autoIncrement` var, konuşalım.

**A2. ✅ Android production build geçti (19 Eylül)** — EAS build `324319a5`, commit `844dff1`, `versionCode: 1`, mevcut EAS keystore'u. AAB: https://expo.dev/artifacts/eas/itRd32wL2IfZ-fyEvwPAjYpWJgJyk8pppMM9i3xlMhY.aab . Sırada: Play Console'a elle ilk yükleme (dahili test). `mergeReleaseResources` hatası bir daha görülmedi.
⚠️ Kişisel geliştirici hesabı Kasım 2023'ten sonra açıldıysa Play, production'dan önce
**12 test kullanıcılı, 14 günlük kapalı test** istiyor. En uzun süren adım bu.
`eas build --platform android --profile production` → AAB → Play Console dahili test kanalı.
Bu adım daha önce `:app:mergeReleaseResources` hatasıyla düşüyordu; sebep bulunup düzeltildi
(onboarding görselleri JPEG'ken `.png` adlanmıştı) ve `lib/__tests__/assets.test.ts` artık
koruyor, ama build'in gerçekten geçtiği bir kez daha görülmedi.

**A3. ✅ Mağaza görselleri hazır (19 Eylül).** `mockup_feature/` (git'e girmiyor, büyük ikili):
- `ios/{en,tr}/01…08-*.png` — 1290×2796 (6.9"/6.7"; ASC küçüklere kendisi ölçekler)
- `android/{en,tr}/01…08-*.png` — 1080×1920
- `feature-graphic/feature-graphic-{en,tr}.png` — 1024×500 (yalnız Play)

| # | Ekran | EN | TR |
|---|---|---|---|
| 1 | Feed | See the world through travelers' eyes | Dünyayı gezginlerin gözünden gör |
| 2 | Profil (biniş kartı) | Your passport, stamped with memories | Anılarla damgalanmış pasaportun |
| 3 | Harita | Pin every place you've been | Gittiğin her yeri haritana işle |
| 4 | Keşfet | Find your next destination | Sıradaki rotanı keşfet |
| 5 | Şehir gönderileri | Every city, told by travelers | Her şehir, gezginlerin kaleminden |
| 6 | Gönderi oluştur | Turn photos into travel stories | Fotoğraflarını seyahat hikâyesine dönüştür |
| 7 | Mesajlar | Plan the next trip together | Sonraki yolculuğu birlikte planla |
| 8 | Ayarlar (pasaport + 12 dil) | Your journal, in 12 languages | Günlüğün, 12 dilde |
| FG | Feature Graphic | Capture your journey. Share your story. | Yolculuğunu kaydet. Hikâyeni paylaş. |

Onboarding ve Koleksiyonlar listeden çıktı: onboarding görüntüsü yoktu, Kaydedilenler boştu.

**Nasıl üretildi** (`scripts/store-assets/`, hepsi tekrar çalıştırılabilir):
- `edit-screen.js <iş>` — gerçek ekran görüntüsünde yalnızca `jobs.js`'teki bölgeler fal.ai
  `openai/gpt-image-2.5/flare/edit` (medium) ile yeniden çiziliyor; model tüm kareyi yeniden
  çizdiği için çıktısından **yalnızca bu bölgeler** kesilip orijinalin üstüne yapıştırılıyor →
  arayüz pikseli uygulamanın kendisi (Apple 2.3.3). `keep` (bölge içinde korunacak UI),
  `stack` (tek mesaj satırını çoğaltma), `clear`, `labels` (bozuk harita etiketini yerelde
  düzeltme). `--recomposite` modeli çağırmadan yeniden birleştirir (ücretsiz).
- `compose.js [ios|android|all] [en|tr|all]` — arka plan, Playfair başlık, çerçeve. Android
  karelerinde iPhone görüntüsünün durum çubuğu, Android görüntüsünden kesilen gerçek durum
  çubuğuyla değiştiriliyor.
- `feature-graphic.js` — `openai/gpt-image-2.5/flare/text-to-image` sanat + yerel ikon/yazı.
- Harcama: 13 çağrı, tahmini ~$1.16 (`mockup_feature/_work/spend.json`; script $5'ta durur).
- Kaynak ekran görüntüleri `SS/` (git dışı). Harita ve Profil için Android'e özel gerçek
  yakalama kullanıldı (Google Maps); diğer 6 ekran iPhone görüntüsü.

**Bilinen sınırlar:** TR setindeki ekranların arayüzü İngilizce (yalnız başlıklar Türkçe) — TR
ekran görüntüsü alınmadı. İstenirse aynı `jobs.js` TR ekran görüntüleriyle bir kez daha
çalıştırılır; üretilmiş fotoğraflar aynı yerlere denk geldiği için maliyet düşük olur.

**A4. 12 dilde cihaz taraması — özellikle donma hatası.**
Bugünkü hata yalnızca **"dili değiştir, aynı ekranda kal"** durumunda çıkıyordu; uygulamayı
yeniden başlatınca kayboluyordu. Yani **uygulamayı kapatmadan** test edin. En yoğun donmuş
dosyalar; bu ekranlar açıkken dili değiştirin:

| Ekran | Donmuş yuva |
|---|---|
| Topluluk Kuralları | 13 |
| Yeni Post — tarih seçici | 11 |
| Şifremi Unuttum | 7 |
| Yeni Post — kategoriler | 5 |
| Ayarlar profil kartı / Profil biniş kartı | 4 + 4 |
| Keşfet — sonuçlar / öneriler / geçmiş | 2 + 1 + 1 |
| Dil seçme modalının kendisi | 1 |

Ayrıca her dilde aranan iki şey: o dil dışında kalmış metin ve boş alan. Ekran bazlı liste
`I18N_HANDOFF.md` §5'te.

**A5. Arapça RTL görsel doğrulaması.**
Mekanik kısım doğru (47 mutlak kenar, 34 ikon çevrildi) ama göz kontrolü yapılmadı. Aranan:
yanlış kenara yapışmış rozet/FAB/kapatma düğmesi, ters bakan ok. Dil değişince "uygulamayı
yeniden başlat" uyarısı çıkar — uygulamayı **tamamen kapatıp** açın, Fast Refresh yetmez.

**A6. Push bildirimi doğrulaması.**
Supabase SQL editöründe; sorgunun sonunda `ROLLBACK` var, gerçek bildirim gitmiyor. Sorgu
`I18N_HANDOFF.md` §5'te. Beklenen `body`: `<isim>さんがあなたの投稿にいいねしました`.

### B — Yapılmalı ama yayını durdurmaz

**B1. ✅ (19 Eylül) — `eas-build.yml` her `main` push'unda bir preview Android build tetikliyordu.**
`.github/workflows/eas-build.yml:35` (`if: push && ref == main`) + `:59`
(`eas build --platform android --profile preview --no-wait`). `ci.yml`'deki production
build'i elle tetiklenir hale getirmiştik ama bu ayrı workflow'a dokunulmamıştı — yani dünkü
push da bir preview build kuyruğa sokmuş olabilir. Kimsenin almadığı artifact için EAS
dakikası yakıyor. **Yapılacak:** `workflow_dispatch`'e çevirin ya da silin.

**B2. Service-role anahtarı döndürülmedi — iki aşamalı, YAYINDAN ÖNCE bitmeli.**
_19 Eylül bulgusu:_ Supabase'de eski (legacy) anahtarlar yalnız başına döndürülemiyor; anon +
service_role birlikte kapatılıyor. Uygulama hâlâ legacy anon anahtarını kullanıyor ve **push
cron'u (`013_push_notification_cron.sql:21`) `send-push-notifications`'ı legacy service_role
JWT ile çağırıyor** — legacy kapatılırsa push bildirimleri durur. Sıra:
1. ✅ Dashboard → API Keys → `sb_publishable_…` ve `sb_secret_…` oluşturuldu; `.env`
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` ← publishable, `.env.local` `SUPABASE_SERVICE_ROLE_KEY` ←
   secret. İkisi de salt-okuma sorgusuyla test edildi (REST 200, auth 200).
2. ✅ (kod) `029_push_delivery_in_database.sql` + `moderate-content` düzeltmesi. **Asıl bulgu:
   push bildirimleri hiç gönderilmemişti** — kuyruktaki 10 satırın hepsi `sent = false`, en
   eskisi Haziran. Cron (`013`) `current_setting('app.settings.service_role_key')` ile
   edge function'ı çağırıyordu; bu ayar barındırılan projede hiç yoktu. 029 teslimi tamamen
   Postgres'e alıyor: `pg_cron` her dakika `flush_push_queue()` → `pg_net` ile doğrudan Expo'ya.
   Hiçbir API anahtarına bağlı değil. 1 günden eski birikmiş satırlar gönderilmeden kapatılıyor.
   `moderate-content` artık istekteki `apikey` başlığını (publishable) kullanıyor, enjekte
   edilen legacy anon anahtarını değil. `send-push-notifications` fonksiyonu artık kullanılmıyor.
   **Canlıya gitmesi:** `main`'e push → `Deploy Supabase` workflow'u (`db push` + functions deploy).
3. ⏳ Canlıda doğrula: yeni bir beğeni/takip → 1 dk içinde telefona bildirim + kuyrukta
   `sent = true`. Sonra **yeni anahtarlı build'ler** (iOS + Android) cihazda doğrulanınca
   Dashboard → API Keys → legacy anahtarları kapat (geri alınabilir). **Dikkat:** 19 Eylül'deki
   Android AAB (`324319a5`) legacy anon anahtarıyla derlendi; legacy kapatılmadan önce Android
   yeniden build alınmalı. iOS build 6'nın hangi anahtarla çıktığı kullanıcıya soruldu.
Neden: anahtar bir oturumda düz metin paylaşıldı ve RLS'i tamamen baypas eder. Uygulama kodu okumuyor;
yalnızca `scripts/` altındaki araçlar ve push cron'u kullanıyor.

**B3. ✅ (19 Eylül, §0)** — Japonca / Çince ülke kısaltmaları gözden geçirildi.
Emin olunmayanlar zaten ISO'ya düşürülmüş; sette kalanlar
`lib/i18n/place-data/country-abbr.ts` içinde yorumla işaretli (Japoncada `瑞` İsviçre, `典`
İsveç — karıştırılması kolay).

**B4. Paket sürüm uyuşmazlıkları (16 paket).**
`npx expo-doctor` 16/17 geçiyor, düşen tek kontrol bu. Kritik olanlar:
- `jest` 30.2.0 / beklenen `~29.7.0`, `@types/jest` 30.0.0 / beklenen 29.5.14 — **major**
- `react-native-maps` 1.26.20 / beklenen 1.20.1 — **minor**, harita davranışında ilk şüpheli
- 13 adet `expo-*` patch farkı

Testler ve build şu an geçiyor, o yüzden acil değil; ama bir şey bozulursa ilk bakılacak yer
burası. `npx expo install --check` hepsini listeler. **Yayından hemen önce yükseltmeyin** —
yükseltme yapılacaksa yeni bir build ve yeni bir cihaz turu gerekir.

### C — Teknik borç, sonraya

**C1. ✅ (19 Eylül)** — `tsc_errors.txt` (0 bayt) ve `tsc_output.txt` repoda izleniyor.** Build çıktısı, kaynak
değil. `.gitignore`'a alınıp `git rm --cached` yapılmalı.

**C2. ✅ (19 Eylül)** — `scratch/` klasörü repoda izleniyor.** İçindeki iki `.md` 8 Eylül tarihli ve artık yanlış
bilgi veriyor (97 test diyor, 211 var). Ya güncellensin ya `.gitignore`'a alınsın.

**C3. 185 eslint uyarısı** (0 hata). Çoğu kullanılmayan değişken ve eksik hook bağımlılığı.
`react-hooks/exhaustive-deps` uyarılarına dikkat: React Compiler açıkken bağımlılık dizileri
zaten yeniden türetiliyor, yani bu uyarıların bir kısmı yanıltıcı. Toplu "temizlik" turu
yapmayın — bugünkü hata tam olarak öyle bir "gereksiz bağımlılık" görüntüsünden doğdu.

**C4. RTL ilk açılış.** Cihaz dili Arapça olan bir kullanıcı ilk açılışta Arapça metni LTR
düzende görüyor, ikinci açılışta düzen doğru. `forceRTL` native tarafta kalıcı olduğu için
bilerek sessiz bırakıldı; otomatik yeniden başlatma yeni bir native bağımlılık isterdi.

**C5. Native harita etiketleri cihaz dilini izliyor.** Ekran görüntüsündeki "AVRUPA" bu.
iOS'ta MapKit bunu uygulama içi seçimle değiştirmeye izin vermiyor. Pin başlıkları ve statik
harita URL'si düzeltildi, kıta/ülke etiketleri düzeltilemedi. Gerçekten şart olursa Android'de
process locale'i zorlamak konuşulabilir; iOS'ta çözüm yok.

**C7. Yaş derecelendirmesi** — `STORE_LISTING.md`'deki "4+" kaldırıldı (19 Eylül). Kullanıcı gönderileri ve
doğrudan mesajlaşma olduğu için Apple'ın anketinde büyük olasılıkla 12+/13+ çıkar; anket kullanıcıda (`arif_todo.md` §4).

**C6. ✅ (19 Eylül) Mağaza metinleri ve görselleri yalnızca EN + TR idi** — artık 12 dil (`STORE_LISTING.md`, `mockup_feature/`).

---

## 4. Önerilen sıra

Artık kullanıcı işleri `arif_todo.md`'de, yapılma sırasına göre kategorili. Özetle: fal anahtarı iptali →
iOS build 8 (EAS kredisi) + Android AAB → cihaz testleri (A4 dil turu, A5 RTL, push, 19 Eylül güvenlik
listesi) → mağaza formları → yayından hemen önce legacy Supabase / eski Maps anahtarları ve debug SHA-1.
A1–A3 ✅; A4–A6 cihaz testi bekliyor.

---

## 5. Komut referansı

```bash
npm run i18n:check                  # 6 kural: eksik/çevrilmemiş/tanımsız anahtar, placeholder
                                    # kayması, t()'den geçmeyen metin, React Compiler donması
node scripts/i18n-compiler-check.js # 6. kuralı tek başına
npm run i18n:format                 # locale dosyalarını normalleştir
npm run i18n:places                 # yer verisini Wikidata'dan yeniden üret
npm test                            # 20 suite / 211 test
npx tsc --noEmit                    # tip kontrolü
npm run lint                        # 0 hata / 185 uyarı
npx expo-doctor                     # 16/17
npx expo install --check            # sürüm uyuşmazlıklarını listele

eas build --platform android --profile production   # AAB
eas build --platform ios --profile production       # sonra TestFlight
```

**Test etme biçimi:** Android'de Expo dev sunucusu + fiziksel cihaz, iOS'ta TestFlight.
Maestro kullanılmıyor; `.maestro/` akışları duruyor ama koşulmuyor.

---

## 6. Bir sonraki oturumun bilmesi gerekenler

- **Site ↔ uygulama uyumu:** site deposundaki `APP_SYNC_2026-09-29.md` açık bulguları listeliyor (gizlilik
  §3/§13 Keychain iddiası yanlış — oturum AsyncStorage'da; şartlar §4.3 "prescreen etmiyoruz"; FCM/APNs;
  PITR). Kullanıcı bunları site projesinde ayrı oturumla yapacak.
- **Web sitesi ayrı bir depo:** `C:Usersarifg.claudeprojectsodyssey-journal-website`
  (GitHub `arifgultas/odyssey-journal-website`, private). Sayfalar üretiliyor: `content/` + `templates/`
  düzenlenir, `npm run build` → commit → push → `npm run deploy` (`deploy` dalı; Hostinger webhook'la
  çeker). **Hostinger dosya yöneticisinden dosya düzenlemeyin** — bir sonraki deploy üzerine yazar.
  12 dil, bir dil denetleyicisi karışık dilli sayfayı build'de düşürür. Kararlar sitenin `WORKLOG.md`'sinde.
- **`LanguageProvider` gövdesine `try` koymayın.** React Compiler bütün dosyadan vazgeçer ve
  `t`'nin memoizasyonu sessizce kaybolur. `i18n:check` bunu yakalar ama sebebi bilmek zaman
  kazandırır.
- **`translate` içindeki `language` süs değil.** Bağımlılık dizisi React Compiler'a yetmiyor;
  dilin gövdede okunuyor olması gerekiyor. `context/language-context.tsx` içindeki uzun yorum
  bunu anlatıyor, silmeyin.
- **Dil hatalarını uygulamayı yeniden başlatarak test etmeyin.** Donma hatası yalnızca oturum
  içinde dil değiştirince görünüyordu; yeniden başlatma yanlış negatif verir.
- Alınmış kararlar tablosu `I18N_HANDOFF.md` §4'te — yeniden tartışmamak için oraya bakın.
