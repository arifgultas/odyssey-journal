# Odyssey Journal — Yayın Öncesi Durum ve Kalanlar

**Son güncelleme:** 2026-09-18
**Bu dosya ne işe yarar:** Oturumlar arası tek referans. Nerede kaldık, sırada ne var, neden.
Dil işinin teknik detayı `I18N_HANDOFF.md`'de; bu dosya yayına kadar kalan her şeyi kapsıyor.

> `scratch/1209project_review.md` ve `scratch/1209task_summary.md` 8 Eylül tarihli ve artık
> güncel değil (örneğin "97/97 test" diyorlar, bugün 211). İş listesi olarak bu dosyayı
> kullanın; o ikisi mağaza tarafı için hâlâ iyi bir arka plan.

---

## 1. Dün/bugün ne yapıldı (17-18 Eylül) — React Compiler turu

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
| iOS TestFlight | ✅ cihazda çalışıyor (build 4 = dil düzeltmesi) |
| **Android production build** | ❌ **hiç alınmadı** |
| **Mağaza ekran görüntüleri / mockup** | ❌ **başlanmadı** |
| Mağazaya gönderim | ❌ |

---

## 3. Finalize için kalanlar

### A — Yayını durduran işler

**A1. Android `versionCode` hiç artırılmadı.**
`app.config.ts:32` hâlâ `versionCode: 1`, iOS ise `buildNumber: '4'`. Play Console aynı
`versionCode` ile ikinci bir yükleme kabul etmez; ilk AAB'yi yüklemeden fark edilmezse her
denemede takılırsınız. iOS'ta her build'de elle artırılıyor, Android'de hiç artırılmamış.
**Yapılacak:** Android'e ilk yüklemeden önce artırın, sonrasında her yüklemede. İkisini
otomatik artırmak isterseniz `eas.json` içinde `autoIncrement` var, konuşalım.

**A2. Android production build alınmadı.**
`eas build --platform android --profile production` → AAB → Play Console dahili test kanalı.
Bu adım daha önce `:app:mergeReleaseResources` hatasıyla düşüyordu; sebep bulunup düzeltildi
(onboarding görselleri JPEG'ken `.png` adlanmıştı) ve `lib/__tests__/assets.test.ts` artık
koruyor, ama build'in gerçekten geçtiği bir kez daha görülmedi.

**A3. Mağaza ekran görüntüleri ve grafikler (Faz B).**
TestFlight cihazda hazır olduğu için doğrudan iPhone'dan alınabilir. 8 ekran: Onboarding,
Feed, Keşfet, Gönderi oluşturma, Harita, Profil, Mesajlaşma, Koleksiyonlar. Boyutlar:
iPhone 6.7" (1290×2796), 6.5" (1242×2688), Play Feature Graphic (1024×500).
**Not:** ekran görüntülerini almadan önce A4'teki dil turunu yapın — mağazaya yanlış dilde
donmuş bir metin girmesin.

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

**B1. `eas-build.yml` her `main` push'unda bir preview Android build tetikliyor.**
`.github/workflows/eas-build.yml:35` (`if: push && ref == main`) + `:59`
(`eas build --platform android --profile preview --no-wait`). `ci.yml`'deki production
build'i elle tetiklenir hale getirmiştik ama bu ayrı workflow'a dokunulmamıştı — yani dünkü
push da bir preview build kuyruğa sokmuş olabilir. Kimsenin almadığı artifact için EAS
dakikası yakıyor. **Yapılacak:** `workflow_dispatch`'e çevirin ya da silin.

**B2. Service-role anahtarı döndürülmedi.**
Anahtar bir oturumda düz metin paylaşıldı. RLS'i tamamen baypas eder. Supabase dashboard →
Project Settings → API → `service_role` → Rotate, yeni değer `.env.local`'a. Uygulama kodunda
hiçbir yerde okunmuyor, yalnızca `scripts/` altındaki araçlar kullanıyor.

**B3. Japonca / Çince ülke kısaltmaları ana dil gözden geçirmesi.**
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

**C1. `tsc_errors.txt` (0 bayt) ve `tsc_output.txt` repoda izleniyor.** Build çıktısı, kaynak
değil. `.gitignore`'a alınıp `git rm --cached` yapılmalı.

**C2. `scratch/` klasörü repoda izleniyor.** İçindeki iki `.md` 8 Eylül tarihli ve artık yanlış
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

**C6. Mağaza metinleri yalnızca EN + TR.** Uygulama 12 dil destekliyor. App Store /
Play Store listelemesini 12 dile çevirmek yayını engellemez ama dönüşümü artırır.

---

## 4. Yarın akşam için önerilen sıra

1. **A4** — TestFlight build 4 elinizde; dil turunu yapın. Bugünkü düzeltmenin gerçekten
   çalıştığını görmeden diğerlerine geçmeyin. (~30 dk)
2. **A5** + **A6** — Arapça göz kontrolü ve push SQL'i. İkisi de kısa. (~20 dk)
3. **A3** — Ekran görüntüleri. Dil turu temizse mağaza görselleri güvenle alınır. (~1 sa)
4. **A1 → A2** — `versionCode` artır, Android production build, Play Console dahili test.
5. **B1** — preview build workflow'unu kapat (Android build'i alırken EAS kuyruğunu meşgul
   etmesin).
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
