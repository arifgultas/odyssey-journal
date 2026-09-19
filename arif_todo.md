# Arif'in yapılacaklar listesi

**Güncelleme:** 2026-09-19
Yalnızca **senin** yapman gereken işler. Kategoriler kabaca yapılma sırasına göre dizildi.
Ayrıntı gerektiğinde parantezdeki dosyaya bak: `FINALIZE.md` (genel durum), `store_control.md`
(mağaza adımları), `STORE_LISTING.md` (mağaza metinleri). Bir işi bitirince oturuma söyle;
oturum doğrulamasını yapıp bu listeyi ve FINALIZE'ı günceller.

---

## 1. Önce bunlar — güvenlik ve anahtarlar

- [ ] **fal.ai anahtarını iptal et** — fal.ai paneli → API Keys → mağaza görsellerinde kullanılan
      anahtarı sil. Geçmiş bir sohbette açık yazılmıştı. (`.env.local`'dan zaten silindi.)
- [x] ~~Google Maps: iki yeni kısıtlı anahtar, `.env`, günlük kota 300, bütçe uyarısı~~ ✅ 19 Eylül
- [x] ~~Supabase Redirect URL (`odysseyjournal://reset-password`)~~ ✅ 19 Eylül
- [x] ~~Eski `send-push-notifications` fonksiyonunu sil~~ ✅ 19 Eylül
- [x] ~~031 deploy onayı~~ ✅ 19 Eylül

> Bundan sonra `supabase/` altında bir değişiklik push edilince deploy **senin onayını bekler**:
> GitHub → Actions → "Deploy Supabase" → *Review deployments* → **Approve**.

---

## 2. Build'ler

- [ ] **iOS build 8** — EAS kredisi yenilenince (expo.dev → Billing/Usage'dan tarihi kontrol et)
      `eas build --platform ios --profile production` → TestFlight. Bugünkü tüm düzeltmeleri içerir.
      (FINALIZE "Engel: Expo (EAS) build kredileri")
- [ ] **Android AAB** — *ertelendi.* Android Studio → `android` klasörü → Build → Generate Signed
      App Bundle → yeni upload anahtarı `odyssey-upload.jks` (`store_control.md` §2).
  - [ ] `.jks` dosyasını ve şifreleri **iki ayrı yere yedekle** (kaybolursa güncelleme yüklenemez)
  - [ ] `.jks` oluşunca oturuma haber ver → oturum SHA-1'ini çıkarır → Google Cloud'da
        "Odyssey Android Maps SDK" anahtarına **+ Add** ile ekle (paket `com.odysseyjournal.app`)
  - [ ] EAS'ten alınmış eski AAB'yi (`324319a5`) **yükleme**

---

## 3. Cihazda test (yeni build'lerle)

TestFlight build 7'de avatar yükleme artık hata verir — beklenen, build 8'de düzelir.

**Güvenlik düzeltmeleri (19 Eylül)**
- [ ] Profil fotoğrafını değiştir → yeni avatar görünüyor
- [ ] Bir gönderiyi düzenle (metin + yeni fotoğraf) → kaydediliyor
- [ ] Profil sekmesinden çıkış yap → başka hesapla gir → önceki hesabın bildirimleri **gelmiyor**
- [ ] Giriş ekranı → Şifremi unuttum → e-postadaki linke telefonda bas → uygulama açılıp yeni
      şifre soruyor → yeni şifreyle giriş (Admin2'nin unutulan şifresi de böyle sıfırlanabilir)
- [ ] **Test hesabıyla** hesap sil → Supabase Dashboard → Storage → `posts/<uid>/` ve
      `avatars/<uid>/` klasörleri boşalmış mı
- [ ] Bir kullanıcıyı engelle → o kullanıcı sana mesaj atamıyor
- [ ] Bir gönderiyi paylaş → link `odysseyjournal.app/?post=…` → ana sayfa açılıyor
- [ ] Profildeki seyahat haritası görseli yükleniyor (yeni Static Maps anahtarı)
- [ ] Android: harita ekranı açılıyor (yeni Maps SDK anahtarı)

**Push bildirimi** (FINALIZE #2)
- [ ] Android'de review demo hesabıyla gir → Admin'in gönderisini beğen → Admin'in iPhone'una
      1 dakika içinde bildirim gelmeli. Gelmezse oturuma söyle (`push_notification_queue`'ya bakar).
      Kendi gönderini beğenmek bilerek bildirim üretmez.

**Dil turu** (FINALIZE A4 — uygulamayı **kapatmadan** dil değiştirerek)
- [ ] Şu ekranlar açıkken dili değiştir; metin anında yeni dile geçmeli: Topluluk Kuralları,
      Yeni Gönderi (tarih seçici, kategoriler), Şifremi Unuttum, Ayarlar profil kartı, Profil
      biniş kartı, Keşfet, dil seçme penceresi
- [ ] IT/DE profilde takipçi sayacı: "Seguaci" / "Abonnenten"
- [ ] Her dilde: o dilin dışında kalmış metin ya da boş alan var mı

**Arapça (RTL)** (FINALIZE A5)
- [ ] Dili Arapça yap → uygulamayı **tamamen kapatıp aç** → rozetler, + düğmesi, kapatma
      düğmeleri doğru kenarda mı, oklar doğru yöne mi bakıyor

---

## 4. App Store Connect (`store_control.md` §1)

- [ ] App Information: kategori **Travel** + **Social Networking**, Content Rights → Yes
- [ ] **Yaş derecelendirmesi anketi — dürüst doldur:** kullanıcı içeriği **Yes**, mesajlaşma **Yes**
      (4+ değil; muhtemelen 13+ çıkar)
- [ ] App Privacy tablosu (`store_control.md` §1.2)
- [ ] Fiyat: Free, tüm ülkeler
- [ ] 12 dil ekle; her dile `STORE_LISTING.md`'deki Subtitle, Promotional Text, Description,
      Keywords, What's New
- [ ] Ekran görüntüleri: EN → `mockup_feature/ios/en/`, TR → `mockup_feature/ios/tr/` (01→08 sırayla).
      Diğer dillere görsel yükleme (EN gösterilir)
- [ ] Support / Marketing / Privacy URL'leri
- [ ] App Review Information: demo hesap + iletişim + Notes (`store_control.md` §1.6)
- [ ] Version Release: **Manually release**
- [ ] Build **8**'i seç → Add for Review → Submit (build 7'yi gönderme)

---

## 5. Google Play Console (`store_control.md` §3)

- [ ] Uygulamayı oluştur (varsayılan dil English (United States))
- [ ] Set up your app: privacy policy, app access (demo hesap), ads: No, content rating
      (kullanıcılar etkileşiyor: Yes), hedef kitle 13+, data safety (silme URL'si dahil)
- [ ] Mağaza sayfası: EN metin + ikon + feature graphic + 8 görsel; TR çevirisi + TR görseller;
      diğer 10 dil için yalnız metin (`STORE_LISTING.md`)
- [ ] Dahili test: AAB'yi yükle, Play App Signing → Continue, kendini test kullanıcısı olarak ekle
- [ ] **İlk yüklemeden sonra:** Play Console → Test and release → App integrity → App signing →
      *App signing key certificate* SHA-1'ini Google Cloud'daki Android Maps SDK anahtarına ekle.
      **Eklenmezse Play'den kurulan uygulamada harita boş gelir.**
- [ ] Dashboard'da "12 test kullanıcısı / 14 gün kapalı test" şartı çıkarsa oturuma söyle,
      birlikte kurarız

---

## 6. Web sitesi (odysseyjournal.app — Hostinger)

- [ ] `/terms`: "Settings > Danger Zone" → **Settings > Account > Delete Account**
- [ ] `/delete-account`: "profili gizli yap" önerisini kaldır (uygulamada gizli profil yok)
- [ ] Uygulama yayına girince ana sayfadaki **App Store / Google Play** butonlarına gerçek mağaza
      linklerini koy (paylaşılan gönderi linkleri artık ana sayfaya geliyor)

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

- [ ] **Veri talepleri:** privacy@ adresine "verilerimin kopyası" isteği gelirse, göndermeden önce
      talebin hesabın **kendi e-posta adresinden** geldiğini kontrol et
- [ ] Paket güncellemeleri (`npm audit`, expo-doctor'daki 16 uyuşmazlık): **yayından önce yapma**,
      1.0'dan sonra ayrı bir build + test turuyla
- [ ] 1.1 için: Google / Apple ile giriş (Apple Services ID + key, Google OAuth client →
      Supabase Providers; Apple kuralı: Google varsa Apple da olmalı)
- [ ] İsteğe bağlı: diğer 10 dil için dile özel mağaza görselleri (oturum yerelde üretebilir, maliyetsiz)
