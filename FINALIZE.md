# Odyssey Journal — Yayın Öncesi Durum ve Kalanlar

**Son güncelleme:** 2026-09-19 (gece, code + security review sonrası)
**Bu dosya ne işe yarar:** Oturumlar arası tek referans. Nerede kaldık, sırada ne var, neden.
Dil işinin teknik detayı `I18N_HANDOFF.md`'de; bu dosya yayına kadar kalan her şeyi kapsıyor.

> `scratch/1209project_review.md` ve `scratch/1209task_summary.md` 8 Eylül tarihli ve artık
> güncel değil (örneğin "97/97 test" diyorlar, bugün 211). İş listesi olarak bu dosyayı
> kullanın; o ikisi mağaza tarafı için hâlâ iyi bir arka plan.

---

## ★ Güncel durum — 19 Eylül gecesi (BURADAN DEVAM EDİN)

**Kod:** `main` = son commit. iOS `buildNumber: "8"`, Android `versionCode: 2`. `.env` yeni
`sb_publishable_…` anahtarını taşıyor. `tsc` temiz · lint 0 hata · `i18n:check` geçti · 211 test.
**Mağaza adımları ayrı dosyada: `store_control.md`** (yalnızca App Store / Play işleri).

### Engel: Expo (EAS) build kredileri bitti — iOS ve Android
- **iOS build 8 şu an alınamıyor.** Windows'ta yerel iOS build mümkün değil (Mac + Xcode gerekir;
  `eas build --local` da iOS için macOS ister). Seçenekler:
  1. EAS ücretsiz kotasının aylık sıfırlanmasını beklemek (Android için **1 Ekim** görülmüştü;
     iOS'un tarihi expo.dev → Billing/Usage'dan kontrol edilmeli).
  2. Ücretli EAS planı (güncel fiyat: expo.dev/pricing).
  3. Build 7'yi incelemeye göndermek — **önerilmez**: kayıt ekranındaki Koşullar/Gizlilik linkleri
     ölü, Google/Apple butonları hata veriyor (Guideline 2.1 reddi riski).
- **Android etkilenmiyor:** AAB Android Studio'dan yerel alınıyor (`store_control.md` §2).
  Güncel kodla alınacağı için build 8 değişikliklerini zaten içerir. `android/` 19 Eylül'de
  `expo prebuild --clean` ile üretildi; o tarihten sonra `app.config.ts`'te native bir değişiklik
  yok (yalnızca iOS `buildNumber`), yeniden prebuild gerekmez. JS değişiklikleri Gradle
  build'inde bundle'a otomatik girer.

### 19 Eylül'de yapılanlar (özet — ayrıntı §0 ve §3)
| Konu | Sonuç |
|---|---|
| IT/DE "Follower" | Seguaci / Abonnenten; i18n kural 2 yakın eşleşmeleri de yakalıyor |
| Ayarlar → Hesap sağ ikonlar | kaldırıldı (`rightElement={null}`) |
| Derleme etiketi | platforma göre (iOS buildNumber / Android versionCode) |
| `supportsTablet: false` | iPad ekran görüntüsü istenmiyor |
| Push bildirimleri | **hiç gönderilmemişti** → `029` ile Postgres'ten (`pg_cron` + `pg_net`) doğrudan Expo'ya; canlıda. Uçtan uca cihaz testi yapılmadı |
| Supabase anahtarları | yeni `sb_publishable_` / `sb_secret_` devrede; legacy henüz açık |
| Mağaza görselleri | 32 kare + 2 feature graphic + Play ikonu, `mockup_feature/` (§3 A3), fal harcaması ~$1.16 |
| Web sitesi | `https://odysseyjournal.app` yayında; `/privacy-policy`, `/terms`, `/support`, `/delete-account` 200. GitHub Pages **kullanılmıyor** |
| Kayıt ekranı linkleri (8e4bb2e) | Koşullar / Gizlilik artık `lib/legal-links.ts` üzerinden siteyi açıyor; Ayarlar → Yasal'a iki satır eklendi |
| Google / Apple girişi (8e4bb2e) | Supabase'de **ikisi de kapalı** (`/auth/v1/settings` → `google:false, apple:false`). Butonlar `SOCIAL_SIGN_IN_ENABLED = false` ile gizlendi. Açmak için: Apple Services ID + key, Google OAuth client → Supabase Providers → bayrağı `true` yap. Apple 4.8: Google varsa Apple da olmalı. 1.1 için öneri |
| Veri kopyası (kullanıcı kararı) | Uygulama içi "Verilerimi İndir" **kaldırıldı** (`lib/export-data.ts` silindi). Ayarlar → Hesap'taki satır artık "Verilerimi İste": açıklama + "E-posta Gönder" → `mailto:privacy@odysseyjournal.app`. Hesap silme onayına da "önce kopya isterseniz privacy@'ye yazın" cümlesi eklendi. 12 dil; site (`/delete-account`, `/support`) ile aynı. Anahtarlar: `settings.download/exportSuccess/exportError` silindi, `settings.sendEmail` eklendi (727 anahtar) |
| **Code + security review** | 5 kritik/yüksek, 7 orta, 7 düşük bulgu (aşağıda "Review bulguları"). `030_security_fixes.sql` canlıda (e80f841) + istemci düzeltmeleri (e80f841, e5af2fc). Açık kalanlar: O2 (site), D3–D7 |
| Web sitesi metin hataları | kullanıcı düzeltiyor: `/terms` "Settings > Danger Zone" → doğrusu **Settings > Account > Delete Account**; `/delete-account` "profili gizli yap" önerisi (uygulamada gizli profil yok) |

### Sıradaki işler
| # | Kim | İş |
|---|---|---|
| 1 | Kullanıcı | TestFlight build 7'yi test et: giriş, akış, mesajlar, gönderi (yeni anahtar), "Derleme 7", IT/DE takipçi |
| 2 | Kullanıcı | **Push testi:** Android'de review demo hesabıyla giriş → Admin'in gönderisini beğen → Admin'in iPhone'una 1 dk içinde bildirim. (Kendi gönderini beğenmek bilerek bildirim üretmez, `023_…sql:19`. Admin2 şifresi unutuldu.) Gelmezse oturum `push_notification_queue`'ya bakar |
| 3 | Kullanıcı | Android AAB (Android Studio, yeni upload keystore) → Play dahili test (`store_control.md` §2-3) |
| 4 | Kullanıcı | EAS kredisi gelince iOS build 8 → App Store'a **build 8** gönder |
| 5 | Kullanıcı → Oturum | Build 8 + yeni AAB cihazda sorunsuzsa legacy anahtarları kapat: Supabase Dashboard → Project Settings → API Keys → Legacy API Keys → "Disable JWT-based API keys" (geri alınabilir). Oturum salt-okuma testiyle doğrular. Sonrasında eski anahtarlı build'ler (iOS ≤6, EAS AAB `324319a5`) çalışmaz |
| 6 | Kullanıcı | fal.ai anahtarını fal panelinden iptal et (`.env.local`'dan silindi, ama sohbette açık yazılmıştı) |
| 7 | Oturum | Play 12 test kullanıcı / 14 gün kapalı test şartı çıkarsa kurulumuna yardım |
| 8 | Kullanıcı | **Review doğrulama SQL'i** (aşağıda) → Supabase SQL editörü, çıktıyı oturuma ver. Artık asıl amacı: 030'un canlı hâlini teyit etmek + **takipçi sayacı çift mi artıyor** (son satır) |
| 9 | Kullanıcı | Supabase → Authentication → URL Configuration → **Redirect URLs**'e `odysseyjournal://reset-password` ekle (yoksa sıfırlama linki siteye düşer) |
| 10 | Kullanıcı | Deploy edilmiş eski fonksiyonu sil: `! npx supabase functions delete send-push-notifications --project-ref <ref>` |
| 11 | Kullanıcı | Sitede `/post/*` için bir sayfa (mağaza linkleri) — paylaşım linkleri şu an 404 (O2) |
| 12 | Kullanıcı | Yeni build'lerde cihazda dene: avatar değiştir (TestFlight 7'de artık düşer, beklenen), gönderi düzenle, profil sekmesinden çıkış → başka hesapla gir (önceki hesabın push'u gelmemeli), şifre sıfırla, test hesabı sil → Dashboard → Storage'da `posts/<uid>/`, `avatars/<uid>/` boş mu |
| 13 | Kullanıcı | Google Cloud → Maps anahtarında Android paket + SHA-1 / iOS bundle kısıtı var mı (D4) |
| 14 | Kullanıcı karar | `supabase-deploy.yml` onaysız canlıya gidiyor (D6): GitHub Environment + required reviewer eklensin mi? |

### Review bulguları — 19 Eylül (repo + canlıya salt-okuma yoklama)
> **Durum:** K1, K2, Y1–Y5, O1, O3–O7, D1, D2 **düzeltildi** (aşağıda "Review düzeltmeleri").
> Açık: **O2** (site işi), **D3–D7**. Aşağıdaki metin bulguların ilk hâli; satır numaraları 030 öncesine ait.

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
- **D3** `moderate-content` iç hata metnini istemciye döndürüyor; `imageUrls` serbest.
- **D4** Google Maps anahtarı (güncel olan) git geçmişinde. Binary'de zaten var; Google Cloud'da
  Android paket+SHA-1 / iOS bundle kısıtı olduğundan emin olun. Service-role / sb_secret **geçmişte yok** ✅.
- **D5** `npm audit --omit=dev`: 46 (2 critical: `tar`, `shell-quote`) — hepsi expo-cli/metro
  derleme araçlarında, uygulama paketinde değil. Yayından önce yükseltmeyin (B4).
- **D6** `supabase-deploy.yml` onaysız canlıya `db push` + CLI `version: latest`. GitHub
  Environment + required reviewer önerilir.
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

Testte fark edilen, 030 dışı: FULL_SETUP (`trigger_update_follow_counts`) ve 004
(`update_follower_counts_trigger`) iki ayrı takip sayacı tetikleyicisi kuruyor; ikisi de canlıdaysa
takipçi sayıları **çift** artar. Aşağıdaki SQL'in son satırı bunu gösterir.

**Doğrulama SQL'i (salt okuma, kullanıcı çalıştırır).** 030 sonrası beklenen: ilk satır
`is_admin_writable` yine `true` çıkar (koruma sütun yetkisiyle değil `guard_profile_columns`
tetikleyicisiyle; ikinci sorguda görünmeli), `k2_broken = false`, storage'da avatars/posts için
yalnız 030'un 7 politikası, üç bucket'ta `file_size_limit = 10485760`:
```sql
select has_column_privilege('authenticated','public.profiles','is_admin','UPDATE') as k1_is_admin_writable,
       has_column_privilege('authenticated','public.profiles','expo_push_token','SELECT') as y5_token_readable;
select tgname from pg_trigger where tgrelid='public.profiles'::regclass and not tgisinternal;
select position('interactions' in prosrc) > 0 as k2_broken from pg_proc where proname='delete_user_account';
select policyname, cmd, qual, with_check from pg_policies
 where (schemaname='storage' and tablename='objects') or tablename in ('profiles','notifications','messages') order by tablename, policyname;
select id, public, file_size_limit, allowed_mime_types from storage.buckets;
select proname, position('notification_preferences' in prosrc) > 0 as respects_prefs from pg_proc
 where proname in ('create_like_notification','create_comment_notification','create_follow_notification');
select tgname from pg_trigger where tgrelid='public.follows'::regclass and not tgisinternal;  -- iki sayaç tetikleyicisi var mı?
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
| Android production build | Android Studio'dan yerel AAB (versionCode 2) alınacak · EAS AAB `324319a5` kullanılmayacak |
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

**C7. Yaş derecelendirmesi.** `STORE_LISTING.md` "4+" diyor; kullanıcı gönderileri ve doğrudan
mesajlaşma olduğu için Apple'ın yeni anketinde büyük olasılıkla 12+/13+ çıkar. Anketi dürüst doldurun.

**C6. Mağaza metinleri yalnızca EN + TR.** Uygulama 12 dil destekliyor. App Store /
Play Store listelemesini 12 dile çevirmek yayını engellemez ama dönüşümü artırır.

---

## 4. Yarın akşam için önerilen sıra

1. **A4** — 19 Eylül değişikliklerini taşıyan yeni build'le dil turunu yapın (IT/DE profilde Seguaci/Abonnenten). Bugünkü düzeltmenin gerçekten
   çalıştığını görmeden diğerlerine geçmeyin. (~30 dk)
2. **A5** + **A6** — Arapça göz kontrolü ve push SQL'i. İkisi de kısa. (~20 dk)
3. **A3** — Ekran görüntüleri. Dil turu temizse mağaza görselleri güvenle alınır. (~1 sa)
4. **A2** — Android production build (ilk AAB `versionCode: 1` ile olur; sonrakilerde artırın), Play Console dahili test.
5. ~~**B1**~~ — ✅ 19 Eylül'de yapıldı.
6. **B2** — anahtar rotasyonu.

A1-A6 biterse yayına gönderim önünde teknik engel kalmıyor.

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

- **`LanguageProvider` gövdesine `try` koymayın.** React Compiler bütün dosyadan vazgeçer ve
  `t`'nin memoizasyonu sessizce kaybolur. `i18n:check` bunu yakalar ama sebebi bilmek zaman
  kazandırır.
- **`translate` içindeki `language` süs değil.** Bağımlılık dizisi React Compiler'a yetmiyor;
  dilin gövdede okunuyor olması gerekiyor. `context/language-context.tsx` içindeki uzun yorum
  bunu anlatıyor, silmeyin.
- **Dil hatalarını uygulamayı yeniden başlatarak test etmeyin.** Donma hatası yalnızca oturum
  içinde dil değiştirince görünüyordu; yeniden başlatma yanlış negatif verir.
- Alınmış kararlar tablosu `I18N_HANDOFF.md` §4'te — yeniden tartışmamak için oraya bakın.
