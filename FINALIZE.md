# Odyssey Journal — Yayın Öncesi Durum ve Kalanlar

**Son güncelleme:** 2026-09-19
**Bu dosya ne işe yarar:** Oturumlar arası tek referans. Nerede kaldık, sırada ne var, neden.
Dil işinin teknik detayı `I18N_HANDOFF.md`'de; bu dosya yayına kadar kalan her şeyi kapsıyor.

> `scratch/1209project_review.md` ve `scratch/1209task_summary.md` 8 Eylül tarihli ve artık
> güncel değil (örneğin "97/97 test" diyorlar, bugün 211). İş listesi olarak bu dosyayı
> kullanın; o ikisi mağaza tarafı için hâlâ iyi bir arka plan.

---

## ★ Yayın kontrol listesi (19 Eylül akşamı — buradan devam edin)

**Durum:** kod tarafı bitti. `main` = `e03bba4`. iOS `buildNumber: "7"`, Android `versionCode: 2`,
`.env` yeni `sb_publishable_…` anahtarını taşıyor.

**Push testi "bildirim gelmedi" — hata değil:** 19 Eylül'deki iki beğeni **Admin'in kendi
gönderilerine Admin hesabından** yapılmış; tetikleyici kendi gönderini beğenince bilerek bildirim
üretmiyor (`023_…sql:19`). Doğru test: Admin2 (Android, token `QICjy…`) ile Admin'in bir
gönderisini beğen → Admin'in iPhone'una (token `8DGSX…`) 1 dk içinde bildirim.

**Android build kotası:** EAS ücretsiz planın Android kotası bu ay doldu, **1 Ekim'de** sıfırlanıyor.
Karar önerisi: Play'e şimdilik mevcut AAB (`324319a5`, versionCode 1, legacy anahtar) ile
dahili/kapalı test başlatılsın — 14 günlük kapalı test saati böylece hemen başlar. 1 Ekim'de
yeni anahtarlı AAB (versionCode 2) alınır, ardından legacy anahtarlar kapatılır. EAS upload'u
125 MB'tı (görsel klasörleri gidiyordu) → `.easignore`'a `SS/`, `mockup_feature/` eklendi.

| # | Kim | İş |
|---|---|---|
| 1 | Kullanıcı | iOS build 7 al → TestFlight. Giriş, akış, mesajlar, gönderi oluşturma çalışıyor mu (yeni anahtar) |
| 2 | Kullanıcı | Push testi: Admin2 ile Admin'in gönderisini beğen → iPhone'a bildirim |
| 3 | Kullanıcı | App Store Connect: ekran görüntüleri (`mockup_feature/ios/`), metinler (`STORE_LISTING.md`), yaş anketi (UGC + mesajlaşma → 12+/13+), gizlilik etiketleri, inceleme için demo hesap, build 7'yi seç, incelemeye gönder |
| 4 | Kullanıcı | **Android AAB'yi Android Studio'dan kendisi alıyor** (EAS kotası yerine). `android/` 19 Eylül'de `expo prebuild --clean` ile yeniden üretildi (versionCode 2, Maps anahtarı). Build → Generate Signed App Bundle → **yeni upload keystore** (proje dışında saklanmalı; kaybolursa güncelleme yüklenemez). EAS AAB'si (`324319a5`) Play'e **yüklenmeyecek**. İleride EAS'ten Android build alınacaksa bu keystore `eas credentials` ile EAS'e yüklenmeli. |
| 5 | Kullanıcı | Play Console: uygulama, dahili test, mağaza sayfası (`mockup_feature/android/`, feature graphic, `mockup_feature/play-icon-512.png`), içerik formları. Hesap silme URL'si: `privacy-policy.html` (silme bölümü var) |
| 6 | Kullanıcı → Oturum doğrular | iOS build 7 + Android versionCode 2 yeni anahtarla doğrulanınca: Supabase Dashboard → Project Settings → API Keys → Legacy API Keys → "Disable JWT-based API keys". Oturum salt-okuma testiyle doğrular (legacy reddediliyor, yeni çalışıyor). Geri alınabilir. Eski TestFlight build'leri (≤6) bundan sonra çalışmaz. |
| 7 | ✅ | fal.ai anahtarı `.env.local`'dan silindi (fal panelinden de iptal edilmeli) |

Push testi için Admin2 şifresi hatırlanmıyor → testi **review demo hesabıyla** yapın (Android'de demo
hesapla giriş → Admin'in gönderisini beğen).

**Adım adım mağaza talimatları: `store_control.md`.** Web sitesi `https://odysseyjournal.app`
(GitHub Pages kullanılmayacak — kullanıcı kararı, 19 Eylül). Mağaza formlarındaki adresler:
`/privacy-policy`, `/terms`, `/support`. Site yayına alınınca açıldıkları kontrol edilecek.

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
| 12 dil × 729 anahtar, %100 eşit | ✅ |
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
| iOS TestFlight | ✅ build 4 cihazda · **build 5 bekleniyor** (19 Eylül değişiklikleri) |
| Android production build | ✅ AAB hazır (19 Eylül) · Play Console'a yüklenmedi |
| Mağaza ekran görüntüleri / mockup | ✅ 32 kare + 2 Feature Graphic, `mockup_feature/` (§3 A3) |
| **Push bildirimleri** | ⚠️ hiç gönderilmemişti — 029 ile düzeltildi, canlıda doğrulanmadı (§3 B2) |
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
