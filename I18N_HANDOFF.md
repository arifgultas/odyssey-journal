# Çok Dilli Destek — Devir Notu

**Son güncelleme:** 2026-09-13 (finalize turu)
**Konu:** "Bir dile geçtiğimde tüm yazılar o dilde olsun" + yer adlarının çevrilmesi (Constanța → Köstence)

---

## 1. Tek bakışta durum

| | Durum |
|---|---|
| Veritabanı migration'ları (026, 027, 028) | ✅ **CANLIDA** |
| Uygulama kodu | ✅ **`main`'DE, PUSH EDİLDİ** — `bbb0a64` |
| 12 dil × 729 anahtar | ✅ %100 eşit |
| Sabit metin (t() dışı) | ✅ temiz — `i18n:check` 5. kuralı koruyor |
| Arapça RTL | ✅ **YAPILDI** (bu tur) |
| Türkçe ülke kısaltmaları | ✅ 3 harfli biçime taşındı (bu tur) |
| EAS Android production build | ✅ **DÜZELTİLDİ** (bu tur) — sebebi i18n değildi |
| Eski postların backfill'i | ✅ **UYGULANDI** — 13/13 post, 12 farklı yer, 0 çözülemeyen |
| Cihazda 12 dil taraması | ⏳ elle yapılacak (aşağıdaki kontrol listesi) |
| Push bildirimi doğrulaması | ⏳ SQL hazır, Supabase editöründen çalıştırılacak |
| `npm test` | ✅ 19 suite / 207 test |
| `npx tsc --noEmit` | ✅ tamamen temiz |

Bu turda `main`'e giden commit'ler (`bdc3a2c..bbb0a64`, fast-forward):
```
bbb0a64 chore: keep the service role key out of the EAS upload
02b2fd0 docs: bring the i18n handoff note up to date
e5a5c52 ci: run the EAS production build on demand, not on every commit
6a5ef82 fix(router): remove the duplicate /notifications route
101b6d9 fix(android): the three onboarding images are JPEGs, not PNGs
781dddb i18n(ar): right-to-left layout
1c5c952 i18n(tr): three-letter country abbreviations
f515f08 test(i18n): make the language-switch flow runnable
23a9d99 i18n: never show a raw error message, and catch untranslated literals in CI
```

Push sonrası CI: Test / Lint / TypeScript / Translation Check dördü de yeşil, **54 saniye**
(önceden 7+ dakika — production build artık her commit'te koşmuyor). `Deploy Supabase`
`paths: supabase/**` filtresi sayesinde atlandı, bu turda migration değişmedi.

---

## 2. Sorun neydi (5 kök neden)

1. **Yanlış fallback zinciri.** `defaultLocale = 'tr'` — Japoncada eksik bir anahtar ekranda
   **Türkçe** çıkıyordu.
2. **Sessiz boşluklar.** `t()` eksik anahtarda `''` döndürüyordu.
3. **Eksik/çevrilmemiş anahtarlar.** 46 eksik anahtar; Japonca 23, Arapça 22 değer İngilizce.
4. **i18n dışında sabit yazılar.** `app/admin.tsx` tamamen çevrilmemişti; bazıları sabit **Türkçe**.
5. **Dinamik içerik hiç çevrilmiyordu.** Yer adları 31 şehirlik elle yazılmış tablodan; tarih
   formatları sabitlenmiş; push bildirimleri trigger'da sabit İngilizce.

---

## 3. Yapılanlar

### Aşama 1-3 (önceki tur, `b5c115a` + `bdc3a2c`)

- `defaultLocale` → `en`; `t()` eksik anahtarda dev'de `⟦key⟧` + uyarı.
- 12 dil dosyası %100 eşitlendi; ~120 sabit metin i18n'e taşındı.
- `lib/date-formatter.ts` — 12 dil için ay/gün tabloları, Hermes ICU'suna güvenmiyor.
- `scripts/generate-place-data.js` → Wikidata'dan 6.209 şehir × 12 dil + 255 ülke × 12 dil.
- `lib/location-formatter.ts` sıfırdan yazıldı; `lib/place-names.ts` canlı çözücü + 3 katmanlı önbellek.
- `026/027/028` migration'ları: paylaşımlı yer adı önbelleği, `posts.place_key`, alıcının
  dilinde push bildirimleri.
- `scripts/i18n-check.js` + `lib/__tests__/i18n-parity.test.ts`, CI'da "Translation Check".

### Aşama 4 (bu tur) — kalan sabit metinler ve daha güçlü koruma

- **Ham `error.message` artık hiçbir yerde ekrana çıkmıyor.** Supabase bu mesajları her zaman
  İngilizce döndürür. `lib/auth-errors.ts` hatayı `code` alanından tanıyıp çeviri anahtarıyla
  cevaplıyor; tanınmayan hata `errors.generic`'e düşüyor. 6 çağrı yeri düzeltildi.
- `lib/export-data.ts` native paylaşım başlığı, `t(...) || 'English'` yedekleri, `%50`'nin
  Türkçe konumu, sürüm altbilgisindeki `V.`/`Build` düzeltildi.
- **İki canlı hata bulundu:** `CommentInput`'un varsayılan `'Add a comment...'` metni yorumlar
  ekranında 12 dilde de İngilizce çıkıyormuş — üstelik `comments.addComment` çevirisi dosyalarda
  kullanılmadan duruyormuş. `SearchBar` aynı durumda.
- **`scripts/i18n-literals.js` → `i18n:check`'in 5. kuralı.** Diğer dört kural metnin çeviri
  dosyasında olduğunu varsayıyor, dolayısıyla "hiç oraya girmemiş" metni göremiyor —
  bu turda düzeltilenlerin hepsi tam olarak o biçimdeydi. İstisnalar
  `scripts/i18n-allowed-literals.json` içinde.

### Aşama 5 (bu tur) — Arapça RTL

- `app/_layout.tsx`'te `I18nManager.allowRTL(true)`, her şeyden önce.
- `context/language-context.tsx` yön değiştiğinde `forceRTL` yazıp kullanıcıya **kendi dilinde**
  "uygulamayı kapatıp yeniden aç" diyor. Ayar native tarafta kalıcı, ikinci açılış ilk kareden
  itibaren doğru.
- **Yeni native bağımlılık eklenmedi.** `expo-updates`/`react-native-restart` ile otomatik
  yeniden başlatma mümkündü ama yayın öncesi native bağımlılık tablosunu değiştirmek risk.
- 134 `marginLeft`/`paddingRight`/`borderTopLeftRadius` → `marginStart`/`paddingEnd`/
  `borderTopStartRadius`; 47 tek yönlü mutlak kenar → `start`/`end`. Üç `left: '50%'` ortalama
  hilesi bilerek atlandı. `flexDirection: 'row'` (271 adet) hiç ellenmedi — `forceRTL` onları
  kendisi aynalıyor.
- `lib/rtl.ts` → 34 yön bildiren ok/chevron RTL'de ters çevriliyor.
- `lib/__tests__/rtl.test.ts` `app/` ve `components/` içinde Left/Right stil özelliği geri
  gelirse düşüyor.

### Aşama 6 (bu tur) — Türkçe ülke kısaltmaları

`AL → ALM`, `İS → İSP`, `İT → İTA`, `YU → YUN`, `İSVE → İSVÇ`, `PO → POR`, `JA → JAP`.
İki harfli biçimler ISO 3166-1 alpha-2 ile çakışıyordu: `AL` Arnavutluk'un kodu, `İS`
katlandığında `IS` yani İzlanda. `getCountryCode()` ISO kodunu kısaltmadan önce çözdüğü için
her ikisi de yanlış ülkeye okunuyordu. ABD ve İNG değişmedi; ja/zh tabloları ellenmedi.

---

## 4. Alınan kararlar (yeniden tartışmamak için)

| Karar | Neden |
|---|---|
| Yer adları Wikidata'dan üretilen gömülü veri + canlı yedek | Elle tablo ölçeklenmiyor |
| Nüfus eşiği **100.000** (6.209 şehir, 1.26 MB) | 250.000'de Bruges, Salzburg, Granada offline kapsam dışı kalıyordu |
| Ülke kısaltması: geleneği olan dilde özel, diğerlerinde ISO | Uydurma kısaltma üretilmiyor |
| Türkçe kısaltmalar 3 harfli | Gerçek Türkçe gelenek + iki ISO çakışmasını çözüyor |
| `GB` içeride ISO, ekranda `UK` | Okuyucu "UK" tanıyor |
| Fallback dili `en` | Japonca arayüzde Türkçe görmek daha kafa karıştırıcı |
| Tip güvenliği (özyinelemeli anahtar birleşimi) **yapılmadı** | 729 anahtar TypeScript'i `TS2590` ile kilitliyor; yerine `i18n:check` |
| Üretilen veri JSON string olarak gömülü | Obje literali TypeScript'i kilitliyordu |
| Arapça RTL **yapıldı**, native bağımlılık eklenmeden | Yeniden başlatma modalı, otomatik reload yerine |
| EAS production build elle tetikleniyor | Her commit'te 6 dk harcayıp kimsenin almadığı artifact üretiyordu |
| `categories.wildlife` duruyor | İleride kategori eklenirse çevirisi hazır |

---

## 5. Sıradaki adımlar

### ✅ Backfill — yapıldı

```
Scanned: 13   Updated: 13   No usable location: 0   Could not resolve: 0
Distinct places: 12 (3 looked up live and cached)
```

Canlıdan doğrulandı: 13 postun 13'ünde `place_key` ve `location.localizedNames` var, 12 farklı
yer. Asıl örnek yerinde:

```
Constanța -> tr: Köstence   ja: コンスタンツァ   en: Constanța
```

Script'in koşulsuz çalıştığını bilmek işe yarar: tekrar çalıştırıldığında yine "13 to update"
der, çünkü her postu mevcut değer aynı olsa da yeniden yazar. Bu bir hata değil.

### Sıradaki 1 — Cihazda 12 dil

Maestro **kullanılmıyor**; test Expo dev sunucusu + fiziksel Android cihaz, iOS ise TestFlight
üzerinden. `.maestro/` akışları duruyor ve bu turda çalışır hale getirildi ama koşulmuyor.

Her dilde aranan iki şey: **o dil dışında kalmış metin** ve **boş alan**.

| Ekran | Özellikle bak |
|---|---|
| Feed | Kart altındaki yer satırı (`Köstence, RO`), göreli zaman (`3 saat önce`) |
| Explore | Arama placeholder'ı, destinasyon kartları |
| Harita | Şehir adları, ülke kısaltmaları — Türkçe artık `ALM`, `İSP`, `İTA` |
| Post detayı | Tarih ve gün adı, yer satırı |
| Yorumlar | **Yazma kutusunun placeholder'ı** — bu turda düzeltilen canlı hata |
| Profil | Rozet detayı: yüzdenin yeri (tr `%50`, en `50%`) |
| Ayarlar | En alttaki sürüm satırı (`Sürüm 1.0.0 • Derleme 1`) |
| Giriş | Yanlış şifre gir — hata o dilde çıkmalı, İngilizce değil |

**Arapça için:** dil değişince "uygulamayı yeniden başlat" uyarısı çıkar. Uygulamayı
**tamamen kapatıp** aç — Fast Refresh veya dev menüden reload yetmez, `forceRTL` native
tarafta uygulanıyor. İkinci açılışta düzen sağdan sola olmalı. RTL'in mekanik kısmı doğru
ama görsel doğrulaması yapılmadı: 47 mutlak kenar ve 34 ikon çevrildi, aranan şey yanlış
kenara yapışmış rozet/FAB/kapatma düğmesi veya ters bakan ok.

### Sıradaki 2 — Push bildirimi doğrulaması

Supabase SQL editöründe; sonunda `ROLLBACK` var, hiçbir şey kalıcı olmuyor ve gerçek bildirim
gitmiyor:
```sql
BEGIN;
WITH target AS (SELECT id FROM public.profiles WHERE expo_push_token IS NOT NULL LIMIT 1)
UPDATE public.profiles p SET preferred_language = 'ja' FROM target WHERE p.id = target.id;

INSERT INTO public.notifications (user_id, actor_id, type)
SELECT p.id, p.id, 'like' FROM public.profiles p
WHERE p.preferred_language = 'ja' AND p.expo_push_token IS NOT NULL LIMIT 1;

SELECT title, body FROM public.push_notification_queue ORDER BY created_at DESC LIMIT 1;
ROLLBACK;
```
Beklenen `body`: `<isim>さんがあなたの投稿にいいねしました`

### Sıradaki 3 — iOS build

`main` hazır. `eas build --platform ios --profile production`, sonra TestFlight.

---

## 5b. Gizli anahtarlar nerede duruyor

`.env` **her EAS build'inde Expo'nun sunucularına yükleniyor** — `.easignore` onu bilerek
dışarıda bırakmıyor, çünkü `EXPO_PUBLIC_*` anahtarlarının build'e ulaşma yolu bu.

Dolayısıyla ayrım şu:

| Dosya | İçerik | EAS'e gider mi |
|---|---|---|
| `.env` | `EXPO_PUBLIC_*` anahtarları | evet, bilerek |
| `.env.local` | `SUPABASE_SERVICE_ROLE_KEY` | **hayır** — `.easignore:51` `.env*.local` |

İkisi de `.gitignore`'da. `SUPABASE_SERVICE_ROLE_KEY` RLS'i tamamen baypas eder ve uygulama
kodunda hiçbir yerde okunmuyor; yalnızca `scripts/` altındaki araçlar kullanıyor.
`scripts/backfill-place-names.js` önce `.env.local`'ı okuyor.

Uygulama paketine hiç girmediğini bilmek önemli: Expo yalnızca `EXPO_PUBLIC_` önekli
değişkenleri JS paketine gömer.

## 6. Açık konular

- **ja/zh ülke kısaltmaları ana dil gözden geçirmesi bekliyor.** Emin olunmayanlar zaten ISO'ya
  düşürülmüş; sette kalanlar `lib/i18n/place-data/country-abbr.ts` içinde yorumla işaretli
  (Japoncada `瑞` İsviçre, `典` İsveç — karıştırılması kolay).
- **Arapça RTL görsel doğrulaması yapılmadı** (yukarıda Adım 3).
- **RTL ilk açılış.** Cihaz dili Arapça olan bir kullanıcı ilk açılışta Arapça metni LTR
  düzende görüyor, ikinci açılışta düzen doğru. Açılışta uyarı göstermek `forceRTL` kalıcı
  olmazsa her açılışta uyarı riskine giriyordu; bilerek sessiz bırakıldı.
- **`react-native-maps` 1.26.20**, SDK 54'ün beklediği 1.20.1 değil (`npx expo-doctor`).
  Build artık geçtiği için acil değil ama bir yükseltmede ilk şüpheli bu olur. 16 paket
  sürüm uyumsuzluğu var; `npx expo install --check` hepsini listeler.
- **Service-role anahtarı döndürülmeli.** Anahtar bir oturumda düz metin olarak paylaşıldı.
  Supabase dashboard → Project Settings → API → `service_role` → Rotate, ardından yeni değer
  `.env.local`'a yazılır.
- **`eas-build.yml` her push'ta bir preview Android build tetikliyor** (`--no-wait`).
  `ci.yml`'den ayrı bir workflow; production build elle tetiklenir hale getirilirken buna
  dokunulmadı. İstenmiyorsa ayrıca ele alınmalı.

---

## 7. Komut referansı

```bash
npm run i18n:check                  # 5 kural: eksik/çevrilmemiş/tanımsız anahtar,
                                    # placeholder kayması, t()'den geçmeyen metin
npm run i18n:format                 # locale dosyalarını normalleştir
npm run i18n:places                 # yer verisini Wikidata'dan yeniden üret
node scripts/backfill-place-names.js --preview   # anahtar gerekmez, hiçbir şey yazmaz
npm test                            # 19 suite / 207 test
npx tsc --noEmit                    # tip kontrolü
```

Wikidata istekleri `.place-data-cache/` altında önbelleğe alınır (gitignore'da).

---

## 8. Dil dışı, ama bu turda çözülen

**EAS Android production build 5 commit'tir düşüyordu ve sebebi i18n değildi.**
`:app:mergeReleaseResources` şu hatayla düşüyordu:

```
ERROR: .../drawable-mdpi/assets_images_onboardingsharing.png:
AAPT: error: file failed to compile.
```

`onboarding-sharing`, `onboarding-cappadocia` ve `onboarding-community` dosyaları `ffd8ff`
ile başlıyordu — yani **JPEG, ama adları `.png`**. Metro baytlara bakıp sorunsuz çalıştığı
için uygulama geliştirmede sorunsuzdu ve bütün JS kontrolleri geçiyordu; Android'in kaynak
derleyicisi uzantıya güveniyor ve pes ediyor.

Yeniden kodlamak yerine uzantı düzeltildi: baytlar zaten iyi bir 1024×1024 JPEG, fotoğrafı
gerçek PNG'ye çevirmek boyutu üçe katlardı. `lib/__tests__/assets.test.ts` artık her görselin
imzasını uzantısıyla karşılaştırıyor — bu hata beş başarısız altı dakikalık uzak build'e mal
oldu, yerelde bir saniye sürüyor.

Ayrıca `app/notifications.tsx` (boş "deprecated" stub) silindi; `app/(tabs)/notifications.tsx`
ile aynı `/notifications` rotasını kaydediyordu.
