# Odyssey Journal - Web Sitesi Legal İçerikleri

Aşağıdaki metinleri kopyalayıp web sitenizdeki ilgili sayfalara (`odysseyjournal.app/privacy-policy` ve `odysseyjournal.app/terms`) yapıştırabilirsiniz.

---

## 1. Privacy Policy (Gizlilik Politikası)
**Link:** `https://odysseyjournal.app/privacy-policy`

```markdown
# Privacy Policy for Odyssey Journal

**Last Updated: September 2026**

## 1. Introduction & Data Controller

Welcome to Odyssey Journal ("we," "our," "us," or the "App"). We respect your privacy and are committed to protecting your personal data in full compliance with the **Turkish Law on the Protection of Personal Data (KVKK - Law No. 6698)**, the **General Data Protection Regulation (GDPR - EU 2016/679)**, and the **California Consumer Privacy Act (CCPA)**.

This Privacy Policy explains how we collect, use, store, process, and protect your information when you use our mobile application and related web services at `https://odysseyjournal.app`.

- **Data Controller (Veri Sorumlusu):** Odyssey Journal / Arif Gültaş
- **Data Protection & Privacy Contact:** `privacy@odysseyjournal.app`
- **Customer Support:** `support@odysseyjournal.app`
- **Official Website:** `https://odysseyjournal.app`

By creating an account, downloading, or using Odyssey Journal, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy and our Terms of Service.

## 2. Information We Collect

### A. Information You Voluntarily Provide
- **Account Credentials**: Email address, password (securely hashed and salted via Supabase Auth), username, full name, profile bio, avatar image.
- **User-Generated Content (UGC)**: Travel posts, stories, photographs, comments, bookmarks, collections, reactions (likes), travel dates, and optional location names/destinations.
- **Direct Communications**: In-app private direct messages between travelers and support communications sent to our email addresses.

### B. Automatically Collected Technical Data
- **Device Information**: Device model, manufacturer, operating system and version, unique device identifiers, preferred language, time zone.
- **Diagnostic & Crash Data**: Crash logs, stack traces, and application performance metrics collected through Sentry (strictly scrubbed of Personally Identifiable Information - PII).
- **Network & Session Data**: IP address (anonymized/scrubbed where possible), connection status, app launch timestamps.

### C. Location Information
- **Precise Location (GPS)**: Only requested when you explicitly tag a travel post with your current location. We **never** track your location in the background or continuously. You may revoke location permissions at any time through your device settings.

## 3. Infrastructure & Supabase Data Architecture

Odyssey Journal uses **Supabase** (`https://supabase.com`) as its core cloud backend, database, authentication engine, and media storage provider.

- **Server Region**: Our primary production database and media storage are hosted on Supabase enterprise infrastructure (AWS EU region - Frankfurt, Germany).
- **Encryption in Transit**: All communications between the mobile application, web clients, and Supabase servers are encrypted using **TLS 1.3 / HTTPS**.
- **Encryption at Rest**: All database tables, user records, and uploaded media files are encrypted at rest using industry-standard **AES-256** encryption.
- **Row Level Security (RLS)**: Strict granular database policies enforce access isolation. Users can only read, insert, update, or delete data permitted by verified cryptographic authentication tokens (JWT).
- **Token Security**: Authentication tokens are stored locally on user devices using secure native storage mechanisms (iOS Keychain and Android Keystore / EncryptedSharedPreferences via Expo Secure/Async Storage).
- **Automated Backups**: Backups are performed automatically on our Supabase Pro tier, with point-in-time recovery to prevent data corruption.

## 4. How We Use Your Information & Legal Basis

We process personal data under the lawful bases defined in **KVKK Article 5 & 6** and **GDPR Article 6**:

| Purpose | Category of Data | Legal Basis (KVKK & GDPR) |
|---|---|---|
| Creating and managing your account | Email, username, password | Performance of Contract (Sözleşmenin İfası) |
| Publishing travel posts, photos, comments | User Content, photos, locations | Performance of Contract & Explicit Consent (Açık Rıza) |
| Interactive map & nearby destination tagging | GPS coordinates (per-post) | Explicit Consent (Açık Rıza) |
| Sending push notifications (likes, follows, chat) | Push notification token | Explicit Consent & Legitimate Interest |
| Application stability, crash triage, bug fixes | Anonymized crash logs (Sentry) | Legitimate Interests (Meşru Menfaat) |
| Preventing spam, abuse, security violations | IP, account identifiers | Legal Obligation & Security |

## 5. Third-Party Sub-Processors (Alt İşleyenler)

We partner only with reputable third-party service providers that maintain strict data security and privacy standards:

1. **Supabase, Inc.**: Cloud database, user authentication, object storage for photos. (Servers: AWS Frankfurt, Germany - EU).
2. **Sentry (Functional Software, Inc.)**: Real-time error monitoring and crash diagnostics with PII scrubbing.
3. **Google LLC (Google Maps Platform)**: Reverse geocoding and interactive map tiles.
4. **Google LLC (Google Workspace)**: Enterprise email hosting for customer support and privacy inquiries.
5. **Expo / 650 Industries, Inc.**: Application framework and push notification gateway.

We do **NOT** sell, rent, or trade your personal data to data brokers, advertisers, or any commercial third parties.

## 6. User-Generated Content & Third-Party Privacy (Kullanıcı Sorumluluğu)

When creating posts and sharing photos:
- You are strictly responsible for ensuring that you have full legal rights, copyright, and authorization for all photos, text, and media you upload.
- **Third-Party Personal Data & Images**: You must **NOT** post recognizable faces, private moments, identity details, or license plates of other individuals without their explicit, informed consent.
- **Indemnification (Tazminat & Rücu)**: In the event of any administrative fines, regulatory penalties (including KVKK fines), civil claims, or damages asserted against Odyssey Journal / the developer arising from content you published, you agree to indemnify, hold harmless, and defend us in full, and reimburse all damages, legal fees, and costs upon first demand.
- We reserve the right to review, moderate, hide, or permanently remove any content reported for violating privacy, copyright, or community guidelines, and to terminate repeat offender accounts without notice.

## 7. International Data Transfers (Yurt Dışına Veri Aktarımı)

To provide globally accessible, high-performance services, your data is processed on secure cloud infrastructure hosted in the European Union (Frankfurt, Germany) and the United States. Under **KVKK (Article 9)**, by registering an account and using Odyssey Journal, you provide explicit consent to the transfer of your account data, travel posts, and technical metadata to our secure international cloud servers for the performance of the service contract.

## 8. Data Retention & Deletion

You can permanently delete your account and all associated posts, photos, comments, and messages directly in the App at: `Settings > Danger Zone > Delete Account`. Profile data and posts are removed immediately from public view and permanently purged within thirty (30) days.

## 9. Rights Under Turkish Law (KVKK Madde 11 Hakları)

Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m. 11 uyarınca, veri sahibi olarak; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, işlenme amacını öğrenme, aktarılan üçüncü kişileri bilme, düzeltme, silinme/yok edilme talep etme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz.

**Başvuru Yolu:** KVKK kapsamındaki taleplerinizi kimliğinizi teyit eden bilgilerle birlikte **`privacy@odysseyjournal.app`** adresine e-posta ile iletebilirsiniz. Talepleriniz en geç 30 gün içinde sonuçlandırılacaktır.

## 10. Rights Under GDPR & CCPA

EEA/UK residents possess rights of access, rectification, erasure, restriction, portability, and objection under GDPR. California residents enjoy rights to disclosure, deletion, and non-discrimination under CCPA. Contact **`privacy@odysseyjournal.app`**.

## 11. Contact Us

- **Privacy & KVKK Requests**: `privacy@odysseyjournal.app`
- **Customer Support**: `support@odysseyjournal.app`
- **General Inquiries**: `hello@odysseyjournal.app`
- **Website**: `https://odysseyjournal.app/privacy-policy`
```

---

## 2. Terms of Service (Kullanım Koşulları)
**Link:** `https://odysseyjournal.app/terms`

```markdown
# Terms of Service for Odyssey Journal

**Last Updated: September 2026**

## 1. Acceptance of Terms
By accessing, downloading, or using Odyssey Journal ("the App"), website (`https://odysseyjournal.app`), or any associated services provided by Odyssey Journal / Arif Gültaş ("we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms").

## 2. Description of Service
Odyssey Journal is a personal travel documentation and community platform allowing users to document journeys, share travel stories, discover destinations, interact with other travelers, and synchronize content using Supabase cloud infrastructure.

## 3. User Accounts & Eligibility
- You must be at least 13 years old to use the App.
- You are solely responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
- Notify us immediately at `support@odysseyjournal.app` if you suspect unauthorized access.

## 4. User-Generated Content & Personal Data Warranties
- You retain ownership of all original photographs and text you post.
- You grant us a worldwide, non-exclusive license to host and display your content solely for operating the App.
- You agree NOT to post content that violates copyrights or privacy rights, or contains personal data of third parties without consent (KVKK Law No. 6698).
- We reserve the right to remove any violating content without prior notice.

## 5. Indemnification & Recourse (Tazminat ve Rücu Hakları)
You agree to defend, indemnify, and hold harmless Odyssey Journal and its developer (Arif Gültaş) from any claims, losses, liabilities, legal costs, and administrative monetary penalties (including KVKK fines) arising from content you upload or your breach of third-party rights. We reserve the full right of direct recourse (rücu hakkı) against you to recover all fines, damages, and legal fees.

## 6. Cloud Infrastructure & Supabase
Odyssey Journal uses Supabase for database, authentication, and photo storage (hosted on AWS EU Frankfurt with AES-256 encryption). You acknowledge that cloud operations may occasionally experience latency or scheduled maintenance beyond our control.

## 7. Disclaimers & Limitation of Liability
The App is provided on an "AS IS" and "AS AVAILABLE" basis. To the maximum extent permitted by law, Odyssey Journal and its developer shall not be liable for any indirect, incidental, special, or consequential damages, or loss of data. Total aggregate liability is limited to the amount paid by you in the past 12 months, or 0 TL / $0 USD for free users.

## 8. Governing Law & Jurisdiction (Uygulanacak Hukuk ve Yetki)
These Terms are governed by the laws of the Republic of Turkey (Türkiye Cumhuriyeti Kanunları). All disputes shall be resolved exclusively by the Courts and Enforcement Offices of Istanbul (Çağlayan), Türkiye.

## 9. Contact Information
- **Customer Support**: `support@odysseyjournal.app`
- **Privacy & Legal Inquiries**: `privacy@odysseyjournal.app`
- **General Inquiries**: `hello@odysseyjournal.app`
- **Website**: `https://odysseyjournal.app/terms`
```
