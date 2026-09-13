# Çok Dilli Destek — Devir Notu

**Son güncelleme:** 2026-09-13
**Konu:** "Bir dile geçtiğimde tüm yazılar o dilde olsun" + yer adlarının çevrilmesi (Constanța → Köstence)

---

## 1. Tek bakışta durum

| | Durum |
|---|---|
| Veritabanı migration'ları (026, 027, 028) | ✅ **CANLIDA** — push edildi, `Deploy Supabase` workflow'u uyguladı, canlıdan doğrulandı |
| Uygulama kodu (73 dosya) | ⚠️ **COMMIT EDİLMEDİ** — incelemeni bekliyor |
| Eski postların backfill'i | ⏳ **YAPILMADI** — service-role anahtarı gerekiyor |
| Testler | ✅ 16 suite / 178 test geçiyor |
| `npx tsc --noEmit` | ✅ temiz (yalnızca önceden var olan `lib/env.ts` zod hatası) |
| `npm run i18n:check` | ✅ 12 dil × 715 anahtar, 496 anahtar kodda kullanılıyor |

**Önemli:** Veritabanı uygulama kodunun ilerisinde. Bu doğru yön — üç migration da eklemeli (additive) ve
şu an yayında olan uygulamayla geriye dönük uyumlu. Ama **uygulama kodu migration'lar olmadan
çalışmaz** (`lib/posts.ts` artık `place_key` kolonuna yazıyor), yani kodu geri almak isterseniz
migration'lar kalabilir, tersi olmaz.

Push edilen commit: `b5c115a feat(db): localize place names and push notifications`

---

## 2. Sorun neydi (5 kök neden)

Tek bir hata değildi:

1. **Yanlış fallback zinciri.** `lib/i18n/index.ts` → `defaultLocale = 'tr'`. Bir anahtar Japoncada
   eksikse ekranda **Türkçe** çıkıyordu. Kullanıcının gördüğü asıl şikâyet buydu.
2. **Sessiz boşluklar.** `t()` eksik anahtarda `''` döndürüyordu — yazı hiç çıkmıyor, hata da görünmüyor.
   Kodda kullanılıp 12 dilin hiçbirinde tanımlı olmayan 4 anahtar vardı.
3. **Eksik/çevrilmemiş anahtarlar.** 46 eksik anahtar; Japonca 23, Arapça 22 değer İngilizce bırakılmış.
4. **i18n dışında sabit yazılar.** `app/admin.tsx` tamamen çevrilmemişti; 14 component + 5 hook/lib'de
   sabit metin vardı. Bazıları sabit **Türkçe**: `hooks/use-oauth.ts` ("Giriş Hatası"),
   `components/location-map-preview.tsx` ("Apple Haritalar") — yani İngilizce arayüzde Türkçe görünüyordu.
5. **Dinamik içerik hiç çevrilmiyordu.** Yer adları elle yazılmış 31 şehirlik tablodan geliyordu;
   Köstence orada yoktu ve olamazdı. Tarih formatları bazı yerlerde `'tr-TR'`/`'en-US'` sabitlenmişti.
   Push bildirim metinleri Postgres trigger'ında sabit İngilizceydi.

---

## 3. Bugün yapılanlar

### Aşama 1 — i18n altyapısı ve metinler

- `defaultLocale` → `en`. `t()` artık eksik anahtarda prod'da boş string, **dev'de `⟦key⟧` + uyarı**
  döndürüyor. Sessiz kaybolma bitti.
- 12 dil dosyası %100 eşitlendi: 46 eksik anahtar dolduruldu, 4 tanımsız anahtar eklendi,
  Japonca/Arapça'daki 45 çevrilmemiş değer çevrildi, kullanılmayan `countries` bölümü silindi,
  bozuk girintiler normalleştirildi.
- ~120 sabit metin i18n'e taşındı (yeni `admin` ve `modal` bölümleri dahil).
- Tarih/saat: `lib/date-formatter.ts`'e `formatShortDate`, `formatTime`, `formatShortWeekday`,
  `formatRelativeTime` eklendi; sabitlenmiş locale'ler kaldırıldı. Hermes'in ICU'suna güvenilmiyor.
- Ölü kod: `hooks/use-translation.ts` silindi (`context/language-context.tsx` ile aynı işi yapan,
  hiç import edilmeyen ikinci sistem). `lib/types/categories.ts`'teki `name`/`nameTr` ikili dil
  sistemi kaldırıldı — etiketler artık `categories.<id>` anahtarından geliyor.
- **Regresyon koruması:** `scripts/i18n-check.js` + `lib/__tests__/i18n-parity.test.ts` (34 test).
  Dört çürüme biçimini yakalıyor: eksik anahtar, İngilizce kalmış değer, kodda kullanılıp tanımsız
  anahtar, `{{count}}` yer tutucu kayması. `.github/workflows/ci.yml`'e "Translation Check" job'u eklendi.

### Aşama 2 — Yer ve ülke adları

- `scripts/generate-place-data.js` → Wikidata'dan **6.209 şehir × 12 dil** (1.26 MB) +
  **255 ülke × 12 dil** (77 KB) üretiyor.
- `lib/location-formatter.ts` sıfırdan yazıldı: 895 satırlık elle yazılmış tablo gitti, üretilen
  verinin üstünde ince bir katman kaldı. Public API korundu, 17 mevcut test geçiyor.
- `lib/place-names.ts` → canlı çözücü, üç katmanlı önbellek (bellek → AsyncStorage → Supabase).
- `hooks/use-place-name.ts` → kart önce offline değeri gösteriyor, çözüm gelince yükseltiyor.
- `lib/i18n/place-data/country-abbr.ts` → tr/ja/zh kısaltmaları, diğer 9 dilde ISO.
- Ham metin gösteren tüm ekranlar düzeltildi: `app/map.tsx`, `destination-posts`, `location-card`,
  `destination-card`, explore listeleri, post kartları, post detayı.

### Aşama 3 — Push bildirimleri ve veritabanı

- `026_place_names.sql` — paylaşımlı yer adı önbelleği (herkes okur, oturum açmış kullanıcı ekler,
  UPDATE/DELETE politikası bilerek yok).
- `027_posts_place_key.sql` — `posts.place_key` + destinasyon RPC'leri kanonik anahtara göre grupluyor.
- `028_localized_push_notifications.sql` — `profiles.preferred_language` + `push_notification_texts`
  (12 dil × 5 tip). Trigger artık alıcının dilinde metin seçiyor.
- `ProfileService.syncPreferredLanguage()` dil değişiminde ve açılışta profili güncelliyor.

### Yol boyunca bulunan ve düzeltilen 6 gerçek hata

Bunlar planda yoktu, iş sırasında çıktı:

1. **`026` her insert'i reddediyordu.** Politika `key = lower(key)` şartı koyuyordu ama gerçek
   anahtarlar büyük harfli ülke kodu taşıyor (`constanta|RO`) → paylaşımlı önbelleğe hiçbir kayıt
   yazılamazdı. Gerçek biçimi tanıyan regex'e çevrildi.
2. **`027` `post_count` anlamını bozuyordu.** Orijinal fonksiyon tüm zamanlar toplamını döndürüyordu;
   ilk yazdığım 7 günlük sayıyı döndürüyordu. `totals` CTE'si ile eski davranış geri geldi.
3. **`027`'de plpgsql belirsizlik tuzağı.** `ORDER BY post_count` — bu ad aynı zamanda OUT parametresi.
   Artık ifadeye göre sıralıyor (`ORDER BY COUNT(*)`).
4. **`place_key` ülke ekini kaybediyordu.** Postun ülkesi yapısal alanda yoksa anahtar `madrid`,
   varsa `madrid|ES` oluyordu → aynı şehir iki anahtar, önbellek ikiye bölünüyor. Artık ülke kodu
   gerekirse gömülü veriden alınıyor.
5. **Wikidata araması Türkçe ülke adıyla boş dönüyordu.** `"Kemer Türkiye"` İngilizce Wikidata'da
   bulunamıyor → gerçek yerler "çözülemedi" görünüyordu. Artık ülke önce İngilizceye çevriliyor,
   olmazsa şehir tek başına aranıyor. **Bu hata sadece backfill'de değil, canlı çözücüde de vardı.**
6. **Bulanık eşleşme yanlış ülke döndürüyordu.** `getLocalizedCountryCode('Atlantis')` → `AT`
   (Avusturya). Bulanık alias eşleşmesi kaldırıldı, tam eşleşmeye geçildi.

### Doğrulama kanıtı (canlıdan)

```
Applying migration 026_place_names.sql...
Applying migration 027_posts_place_key.sql...
Applying migration 028_localized_push_notifications.sql...
Finished supabase db push.          → Deploy Supabase, 31s, success
```
- `place_names` tablosu var, anon okuyabiliyor (boş).
- `push_notification_texts` dolu: `{{actor}} gönderinizi beğendi` (tr, like).
- `get_popular_destinations` yeni kolonları gerçek veriyle döndürüyor.

Senin örneğin test altında (`lib/__tests__/place-names.test.ts`):
```
getLocalizedCityName('Constanța', 'tr')  → 'Köstence'
formatPostLocation({city:'Constanța', country:'Romania'}, 'ja') → 'コンスタンツァ, RO'
getLocalizedCountryCode('Spain', 'tr' / 'ja' / 'en') → 'İS' / '西' / 'ES'
```

---

## 4. Alınan kararlar (yeniden tartışmamak için)

| Karar | Neden |
|---|---|
| Yer adları Wikidata'dan üretilen gömülü veri + canlı yedek | Elle tablo ölçeklenmiyor; Wikidata tek istekte 12 dil etiketi veriyor, API anahtarı istemiyor |
| Nüfus eşiği **100.000** (6.209 şehir, 1.26 MB) | 250.000'de 580 KB olurdu ama Bruges, Salzburg, Granada offline kapsam dışı kalıyordu. Değiştirmek: `node scripts/generate-place-data.js --min-population=250000` |
| Ülke kısaltması: geleneği olan dilde özel, diğerlerinde ISO | tr `İS`, ja/zh `西` gerçek gelenek; İspanyolca/Fransızca/Almanca'da böyle bir gelenek yok. Uydurma kısaltma üretilmedi |
| `GB` içeride ISO, ekranda `UK` | Okuyucu "UK" tanıyor, ISO standardı `GB` |
| Fallback dili `en` | Japonca arayüzde Türkçe görmek İngilizce görmekten daha kafa karıştırıcı |
| Tip güvenliği (planın 1.2 maddesi) **yapılmadı** | 715 anahtarlık özyinelemeli birleşim tipi TypeScript'i `TS2590` ile kilitliyor. Yerine `i18n:check` kodda kullanılan her anahtarı doğruluyor |
| Üretilen veri JSON string olarak gömülü, ilk erişimde parse ediliyor | Obje literali TypeScript'i kilitliyordu; string hem küçük hem tembel |
| Arapça RTL **yapılmadı** | Metin çevirisinden bağımsız bir düzen işi; planda opsiyonel işaretliydi |

---

## 5. Yarın: sıradaki adımlar

### Adım 1 — Uygulama kodunu incele ve commit et (73 dosya)
```bash
git status --short
git diff                      # 57 değişmiş dosya
git diff --cached             # boş: sadece migration'lar commit edildi
```
Bakılacak yerler: `lib/location-formatter.ts` (sıfırdan yazıldı), `lib/place-names.ts` (yeni),
`app/admin.tsx` (tamamen çevrildi), `lib/i18n/translations/*.ts` (12 dosya).

### Adım 2 — Eski postların backfill'i
Önce önizleme (anahtar gerekmez, hiçbir şey yazmaz):
```bash
npm run i18n:backfill -- --preview
```
Bugünkü çıktı: **11 farklı yer, 0 çözülemeyen** (8 gömülü veriden, 3 Wikidata'dan).

Sonra gerçek yazma (service-role anahtarı şart — posts tablosu RLS'i anon'u `is_blocked_by`
fonksiyonuyla durduruyor):
```bash
SUPABASE_SERVICE_ROLE_KEY=<key> npm run i18n:backfill -- --dry-run   # önce bu
SUPABASE_SERVICE_ROLE_KEY=<key> npm run i18n:backfill               # sonra bu
```
Anahtar: Supabase dashboard → Project settings → API → `service_role`.

### Adım 3 — Cihazda 12 dili gez
```bash
npm start
```
Kontrol listesi: home, explore, create-post, post-detail, map, profile, settings, admin,
notifications, comments, chat, saved, collection. Aranan: o dil dışında metin **ve** boş alan.
Otomatik ekran görüntüsü:
```bash
maestro test .maestro/language-switch.yaml    # her dil için feed/map/profile screenshot
```

### Adım 4 — Push bildirimi testi
`preferred_language = 'ja'` olan bir profil için test notification satırı ekle,
`push_notification_queue.body`'nin Japonca olduğunu doğrula.

---

## 6. Açık konular

- **EAS Android production build başarısız.** Benim commit'imden değil — son 4 CI koşusunda da
  başarısız (`2fe9a24`, `67978fd`, `08f189f`). Gradle hatası:
  `https://expo.dev/accounts/arifgultas/projects/odyssey-journal/builds/8c2ef2fc-ded8-45de-a68b-4f69bfa71a8f`
  Yayına hazırlanılıyorsa ayrı bir iş olarak ele alınmalı.
- **ja/zh ülke kısaltmaları ana dil gözden geçirmesi bekliyor.** Emin olunmayanlar ISO'ya düşürüldü,
  sette kalanlar `lib/i18n/place-data/country-abbr.ts` içinde yorumla işaretli
  (örn. Japoncada `瑞` İsviçre, İsveç `典` — karıştırılması kolay).
- **Arapça RTL düzeni yapılmadı.** `isRTL()` tanımlı ama kullanılmıyor; gerçek RTL için
  `I18nManager.forceRTL(true)` + uygulamanın yeniden başlatılması gerekiyor.
- **`app/notifications.tsx` ile `app/(tabs)/notifications.tsx` aynı rotayı (`/notifications`) kaydediyor.**
  Kökteki dosya `return null` yapan bir "deprecated" stub. Çeviriyle ilgisi yok ama rota çakışması
  olabilir — ayrı bakılmalı.
- **`lib/env.ts`'te `zod` bulunamıyor hatası** (`npx tsc --noEmit`). Benden önce vardı,
  `node_modules` ile ilgili görünüyor.
- **`categories.wildlife` anahtarı 12 dilde var ama karşılığı olan kategori yok** (`TRAVEL_CATEGORIES`'de
  9 kategori var). Zararsız, ileride kategori eklenirse kullanılır.

---

## 7. Dosya haritası

### Yeni dosyalar
| Dosya | İş |
|---|---|
| `scripts/i18n-lib.js` | 12 locale dosyasını Node'da parse eden yükleyici |
| `scripts/i18n-check.js` | Dört çürüme biçimini yakalayan kontrol |
| `scripts/i18n-format.js` | Locale dosyalarını normalleştirir; veri değişirse yazmayı reddeder |
| `scripts/i18n-edit.js` | Locale dosyalarına cerrahi anahtar ekleme/silme |
| `scripts/i18n-allowed-identical.json` | Bilerek İngilizce kalan değerlerin beyaz listesi |
| `scripts/generate-place-data.js` | Wikidata'dan yer verisi üretir |
| `scripts/backfill-place-names.js` | Eski postları doldurur (`--preview` / `--dry-run`) |
| `lib/place-names.ts` | Canlı çözücü + üç katmanlı önbellek |
| `hooks/use-place-name.ts` | Kart için offline-önce yer adı |
| `lib/i18n/place-data/cities.generated.ts` | 6.209 şehir × 12 dil |
| `lib/i18n/place-data/countries.generated.ts` | 255 ülke × 12 dil |
| `lib/i18n/place-data/country-abbr.ts` | tr/ja/zh kısaltmaları |
| `lib/__tests__/i18n-parity.test.ts` | 34 test: dil dosyası bütünlüğü |
| `lib/__tests__/place-names.test.ts` | 16 test: Köstence/コンスタンツァ, İS/西/ES |
| `supabase/migrations/026_place_names.sql` | ✅ canlıda |
| `supabase/migrations/027_posts_place_key.sql` | ✅ canlıda |
| `supabase/migrations/028_localized_push_notifications.sql` | ✅ canlıda |
| `.maestro/language-switch.yaml` + `subflows/switch-language.yaml` | 12 dilde ekran görüntüsü akışı |

### Sıfırdan yazılanlar
- `lib/location-formatter.ts` — elle yazılmış 895 satırlık tablo → üretilen verinin üstünde ince katman

### Silinenler
- `hooks/use-translation.ts` — kullanılmayan ikinci i18n sistemi

---

## 8. Komut referansı

```bash
npm run i18n:check                  # dil dosyası bütünlüğü (CI'da da çalışıyor)
npm run i18n:format                 # locale dosyalarını normalleştir
npm run i18n:places                 # yer verisini Wikidata'dan yeniden üret
npm run i18n:backfill -- --preview  # her yerin neye çözüleceğini göster (anahtar gerekmez)
npm test                            # 16 suite / 178 test
npx tsc --noEmit                    # tip kontrolü
```

Wikidata istekleri `.place-data-cache/` altında önbelleğe alınır (gitignore'da). Yeniden üretim
o yüzden ikinci kez hızlıdır; klasör silinirse baştan indirir (~15 dk).
