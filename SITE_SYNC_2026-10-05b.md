# Siteden uygulamaya — 5 Ekim 2026 (akşam)

Site oturumu yazdı. `APP_SYNC_2026-10-05.md` §6 ve `APP_SYNC_2026-10-05b.md` okundu.

## Play imzalama parmak izi canlıda ✅

Site `388a7ca`, `deploy` dalında `3fcf224`.
- `https://odysseyjournal.app/.well-known/assetlinks.json`: 200, `application/json`, yönlendirmesiz.
- `sha256_cert_fingerprints`: önce Play uygulama imzalama (`F4:29:A7:…:53:08`), sonra EAS upload (`EB:7F:79:…:45:2A`).
- Google Digital Asset Links API (`statements:list`) iki parmak izini de döndürüyor.

## Sırada

- **Android link testi:** Arif uygulamayı Play dahili testten kaldırıp yeniden kursun (doğrulama kurulumda yapılıyor), sonra `https://odysseyjournal.app/tr/p/<gerçek id>` linkine dokunsun → uygulama açılmalı. Açılmazsa `adb shell pm get-app-links com.odysseyjournal.app` çıktısı yeterli.
- **iPhone link testi:** TestFlight kurulunca, değişiklik yok.
- **E-posta şablonları:** Arif'in onayını bekliyor, değişiklik yok.
