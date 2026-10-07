# App Review — 2.1 Information Needed (7 Ekim 2026)

**Durum:** iOS 1.0 (build 10), 7 Ekim 06:45'te "Rejected — 2.1.0 Performance: App Completeness".
Gerçekte bir hata bulunmadı: Apple, inceleme geçmişi az olan yeni hesaplardan standart olarak 6 madde istiyor.
Uygulamada değişiklik ya da yeni build gerekmiyor. Videoyu ve aşağıdaki metni gönderip **Resubmit** etmek yeterli.

Apple metni iki yere istiyor:
1. **App Review → Reply to App Review** (video eki + metin),
2. **iOS App 1.0 → App Review Information → Notes** (aynı metin, sonraki sürümler için).

---

## 1. Ekran kaydı (yalnız sen yapabilirsin, fiziksel iPhone, güncel iOS)

Denetim Merkezi → Ekran Kaydı. Uygulama **kapalıyken** başlat. Önerilen akış (~3-4 dk):

1. Uygulamayı ana ekrandan aç (açılış ekranı görünsün).
2. **Kayıt:** "Hesap oluştur" → formu doldur (geçici bir e-posta), "18 yaşında veya daha büyüğüm" kutusunu göster
   ve işaretle → kaydol. (E-posta onayı gerekiyorsa onay ekranını göstermen yeterli.)
3. Çıkış yap → **giriş:** `review@odysseyjournal.app` ile giriş.
4. Ana akış → bir gönderiyi aç, fotoğrafları kaydır, **beğen** ve **yorum** yaz.
5. **Gönderi oluştur:** 2 fotoğraf seç, açıklama, konum, tarih, kategori → yapay zekâ içerik kontrolü izin ekranı
   → paylaş.
6. **Keşfet:** popüler yerler, bir yer ve bir gezgin ara.
7. **Profil:** pasaport görünümü, biniş kartı istatistikleri, **seyahat haritası**.
8. Bir gönderiyi koleksiyona kaydet.
9. **Mesajlar:** bir kişiye mesaj gönder.
10. **Şikâyet ve engelleme:** başka birinin gönderisinde menü → **Report** (bir sebep seç, gönder) → **Block**.
11. Ayarlar → Hukuk ve Topluluk → **Topluluk Kuralları**'nı aç.
12. **Hesap silme:** Ayarlar → Hesap → Hesabı Sil — **2. adımda açtığın geçici hesapla** sonuna kadar yap
    (demo hesabı silme!). Yani 12. adım için demo hesaptan çıkıp geçici hesaba gir.

Ücretli içerik yok, o kısım gerekmiyor.

Video büyükse Resolution Center eki yerine paylaşılabilir bir link (Google Drive "bağlantıya sahip olan herkes"
veya YouTube "liste dışı") metnin başına eklenir.

---

## 2. Gönderilecek metin (İngilizce, olduğu gibi yapıştır)

```
Hello App Review team,

Thank you for reviewing Odyssey Journal. Please find the requested information below.

1. SCREEN RECORDING
Attached (recorded on a physical iPhone running the latest iOS). It starts with launching the app and shows
account registration, login, creating a post, likes/comments, explore and search, the passport profile and travel
map, collections, direct messages, reporting a post, blocking a user, the Community Guidelines and the full
account deletion flow.

2. PURPOSE AND TARGET AUDIENCE
Odyssey Journal is a travel diary and travel community for adults (18+). Travelers turn their trip photos into
stories with captions, location, date and weather, and see every place they have shared on a personal travel
map and a passport-style profile. They can discover destinations through other travelers' posts, follow them,
comment and send direct messages to plan trips together. It solves the problem of travel memories being
scattered across camera rolls by keeping them in one organized, shareable journal. The app is free, has no
ads and no in-app purchases.

3. SETUP AND ACCESS
- Sign in with the demo account provided in the Sign-In Information section (review@odysseyjournal.app).
  It already has posts, followed users and a conversation, so all features can be tested right away.
- New accounts can also be created in the app with an email address (age confirmation 18+ is required).
- Create a post: "+" tab -> add photos, caption, location, date and categories -> Share.
- Travel map and passport: Profile tab.
- Report / block: "..." menu on any post or profile -> Report / Block.
- Community Guidelines: Settings -> Legal & Community.
- Account deletion: Settings -> Account -> Delete Account.
- No sample files or special hardware are needed.

4. EXTERNAL SERVICES
- Supabase: authentication (email/password, confirmation and password reset emails), database, photo storage
  and server functions.
- OpenAI Moderation API: post text, photos and comments are checked before publishing; flagged content is
  never posted. The app asks for the user's permission first (5.1.2(i)).
- Apple Maps (MapKit) and the iOS system geocoder: maps and place lookup on iOS. Google Static Maps and
  OpenStreetMap static maps: small map preview images.
- Open-Meteo: weather at the post location.
- Expo Push Notification Service / APNs: notifications for likes, comments, followers and messages.
- Sentry: crash and performance reporting.
No payment processors and no generative AI are used.

5. REGIONAL DIFFERENCES
The app works the same in every region where it is available (all App Store regions except mainland China).
The interface is shown in the device language when it is one of our 12 supported languages (English otherwise);
features and content rules do not change by region.

6. REGULATED INDUSTRY / THIRD-PARTY MATERIAL
Not applicable. The app does not operate in a regulated industry. All content is created by users, who must
accept the Terms of Use and Community Guidelines; reported content is reviewed by the developer.

Thank you,
Arif Gultas
```

---

## 3. Gönderim sırası

1. Videoyu kaydet (§1), bilgisayara al (veya link oluştur).
2. App Review → submission → **Reply to App Review**: metin + video → Send.
3. iOS App 1.0 → App Review Information → **Notes**: mevcut not metninin altına §2'deki 2-6. maddeler → Save.
4. Sağ üstte **Resubmit to App Review** (veya "Update Review").
