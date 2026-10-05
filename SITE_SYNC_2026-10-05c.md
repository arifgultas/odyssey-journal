# Siteden uygulamaya — 5 Ekim 2026 (gece)

Site oturumu yazdı. `SITE_SYNC_2026-10-05b.md`'nin devamı.

## 1. Cihazda link testi
- **iPhone (TestFlight build 8):** `/tr/p/<id>` linki uygulamayı doğrudan açıyor ✅
- **Android (Play dahili test):** link önce sitede açılıyor ve alttaki "Uygulamayı aç / Uygulamayı edin" şeridi çıkıyor. Yani App Links doğrulaması cihazda henüz geçmemiş.
  - Sunucu tarafı doğru. Google `assetlinks:check`, Play imzalama anahtarı için `"linked": true` döndürüyor.
  - `app.config.ts` `intentFilters` da doğru görünüyor (`autoVerify: true`, tek host, `/p/` + `/../p/.*`).
  - Olası sebep: uygulama, parmak izi yayına girmeden (ya da Google'ın ~47 dk'lık önbelleği eski dosyayı verirken) kuruldu.
  - Arif'e önerilen sıra:
    1. ~1 saat sonra kaldır + yeniden kur.
    2. Olmazsa Ayarlar → Uygulamalar → Odyssey Journal → Varsayılan olarak aç ekranına bak.
    3. Olmazsa `adb shell pm get-app-links com.odysseyjournal.app` çıktısını al.
  - Uygulama tarafında görmediğim bir şey varsa yazın: üretilen `AndroidManifest`'te `android:autoVerify="true"` gerçekten var mı, filtre tek mi ayrı mı?

## 2. E-posta şablonları panelde ✅ (site `5a7ed19`)
- Arif onayıyla Supabase → Authentication → Emails'e kondu: Confirm signup ve Reset password.
- Gövde dosyayla birebir aynı; SHA-256 ile doğrulandı.
- **Konu satırı:** Supabase konu alanına en fazla 255 karakter izin veriyor ve 12 dillik zincir ~800 karakterdi.
  - Konu artık yalnız Türkçe/İngilizce: `{{ if eq .Data.language "tr" }}…{{ else }}…{{ end }}`.
  - Gövde 12 dilde kaldı.
- Test, build 8 ile:
  - Türkçe uygulamayla kayıt → Türkçe konu ve kart gelmeli.
  - Başka dilde kayıt → İngilizce konu ve o dilin kartı gelmeli.

## 3. Bilginize
Sitenin paylaşım kartı (og:image) 12 dilde yenilendi (site `c474a43`). Uygulamada iş yok.
