# Privacy Policy for Odyssey Journal

**Last Updated: September 2026**

---

## 1. Introduction & Data Controller

Welcome to Odyssey Journal ("we," "our," "us," or the "App"). We respect your privacy and are committed to protecting your personal data in full compliance with the **Turkish Law on the Protection of Personal Data (KVKK - Law No. 6698)**, the **General Data Protection Regulation (GDPR - EU 2016/679)**, and the **California Consumer Privacy Act (CCPA)**.

This Privacy Policy explains how we collect, use, store, process, and protect your information when you use our mobile application and related web services at `https://odysseyjournal.app`.

- **Data Controller (Veri Sorumlusu):** Odyssey Journal / Arif Gültaş
- **Data Protection & Privacy Contact:** `privacy@odysseyjournal.app`
- **General Support:** `support@odysseyjournal.app`
- **Official Website:** `https://odysseyjournal.app`

By creating an account, downloading, or using Odyssey Journal, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy and our Terms of Service.

---

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

---

## 3. Infrastructure & Supabase Data Architecture

Odyssey Journal uses **Supabase** (`https://supabase.com`) as its core cloud backend, database, authentication engine, and media storage provider.

### Supabase Security & Storage Specifications:
- **Server Region**: Our primary production database and media storage are hosted on Supabase enterprise infrastructure (AWS EU region - Frankfurt, Germany).
- **Encryption in Transit**: All communications between the mobile application, web clients, and Supabase servers are encrypted using **TLS 1.3 / HTTPS**.
- **Encryption at Rest**: All database tables, user records, and uploaded media files are encrypted at rest using industry-standard **AES-256** encryption.
- **Row Level Security (RLS)**: Strict granular database policies enforce access isolation. Users can only read, insert, update, or delete data permitted by verified cryptographic authentication tokens (JWT).
- **Token Security**: Authentication tokens are stored locally on user devices using secure native storage mechanisms (iOS Keychain and Android Keystore / EncryptedSharedPreferences via Expo Secure/Async Storage).
- **Automated Backups**: Backups are performed automatically on our Supabase Pro tier, with point-in-time recovery to prevent data corruption.

---

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

---

## 5. Third-Party Sub-Processors (Alt İşleyenler)

We partner only with reputable third-party service providers that maintain strict data security and privacy standards:

1. **Supabase, Inc.**: Cloud database, user authentication, object storage for photos. (Servers: AWS Frankfurt, Germany - EU).
2. **Sentry (Functional Software, Inc.)**: Real-time error monitoring and crash diagnostics. Client-side PII scrubbing is enabled to prevent transmission of emails, usernames, or sensitive payload data.
3. **Google LLC (Google Maps Platform)**: Reverse geocoding and interactive map tiles.
4. **Google LLC (Google Workspace)**: Enterprise email hosting for customer support and privacy inquiries.
5. **Expo / 650 Industries, Inc.**: Application framework and push notification gateway (Expo Push Service).

We do **NOT** sell, rent, or trade your personal data to data brokers, advertisers, or any commercial third parties.

---

## 6. User-Generated Content & Third-Party Privacy (Kullanıcı Sorumluluğu)

> **IMPORTANT / ÖNEMLİ:**
> Odyssey Journal is a social travel documentation platform. When creating posts and sharing photos:
> - You are strictly responsible for ensuring that you have full legal rights, copyright, and authorization for all photos, text, and media you upload.
> - **Third-Party Personal Data & Images**: You must **NOT** post recognizable faces, private moments, identity details, or license plates of other individuals without their explicit, informed consent.
> - **Indemnification (Tazminat & Rücu)**: In the event of any administrative fines, regulatory penalties (including KVKK fines), civil claims, or damages asserted against Odyssey Journal / the developer arising from content you published, you agree to indemnify, hold harmless, and defend us in full, and reimburse all damages, legal fees, and costs.
> - We reserve the right to review, moderate, hide, or permanently remove any content reported for violating privacy, copyright, or community guidelines, and to terminate repeat offender accounts without notice.

---

## 7. International Data Transfers (Yurt Dışına Veri Aktarımı)

To provide globally accessible, high-performance services, your data is processed on secure cloud infrastructure hosted in the European Union (Frankfurt, Germany) and the United States by our certified sub-processors (Supabase, Sentry, Google, Expo).

- **Under KVKK (Article 9)**: By registering an account and using Odyssey Journal, you provide explicit consent to the transfer of your account data, travel posts, and technical metadata to our secure international cloud servers for the performance of the service contract.
- **Under GDPR (Chapter V)**: Transfers to sub-processors outside the EEA are governed by European Commission Standard Contractual Clauses (SCCs) and adequacy decisions.

---

## 8. Data Retention & Deletion

- **Active Accounts**: We retain your personal data and travel journal entries for as long as your account remains active.
- **Account Deletion**: You can permanently delete your account and all associated posts, photos, comments, and messages directly in the App at: `Settings > Danger Zone > Delete Account`.
- **Purge Timeline**: Upon account deletion, your profile and posts are immediately removed from public view and permanently purged from our Supabase database and storage buckets within thirty (30) days, except where retention is legally required by applicable statute of limitations.

---

## 9. Rights Under Turkish Law (KVKK Madde 11 Hakları)

Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m. 11 uyarınca, veri sahibi olarak aşağıdaki haklara sahipsiniz:

1. Kişisel verilerinizin işlenip işlenmediğini öğrenme,
2. Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,
3. Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,
4. Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,
5. Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,
6. KVKK m. 7'de öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,
7. Düzeltme, silme ve yok edilme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
8. İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,
9. Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.

**Başvuru Yolu:** KVKK kapsamındaki taleplerinizi kimliğinizi teyit eden bilgilerle birlikte **`privacy@odysseyjournal.app`** adresine e-posta ile iletebilirsiniz. Talepleriniz, niteliğine göre en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılacaktır.

---

## 10. Rights Under GDPR (EEA & UK Users)

If you are a resident of the European Economic Area (EEA) or United Kingdom, you have the following rights under GDPR:
- **Right of Access** (Article 15)
- **Right to Rectification** (Article 16)
- **Right to Erasure / Right to be Forgotten** (Article 17)
- **Right to Restriction of Processing** (Article 18)
- **Right to Data Portability** (Article 20)
- **Right to Object** (Article 21)
- **Right to Lodge a Complaint** with your local Data Protection Supervisory Authority.

To exercise these rights, contact **`privacy@odysseyjournal.app`**.

---

## 11. California Privacy Rights (CCPA / CPRA)

California residents have the right to request disclosure of personal information collected, request deletion of personal information, opt-out of the sale of personal information (we do **not** sell personal information), and not be discriminated against for exercising these rights. Inquiries should be sent to **`privacy@odysseyjournal.app`**.

---

## 12. Children's Privacy

Odyssey Journal is not intended for or directed to children under the age of 13 (or under 16 in certain jurisdictions). We do not knowingly collect personal data from children. If we discover that a child has provided us with personal data, we will immediately delete such data from our servers. Parents or guardians who believe their child's data has been collected can contact **`privacy@odysseyjournal.app`**.

---

## 13. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect modifications in our services, technologies, or legal obligations. When significant changes occur, we will notify you through in-app notifications and update the "Last Updated" date at the top of this document. Continued use of the App following the notification constitutes your acceptance of the revised policy.

---

## 14. Contact Information

For any inquiries, questions, or requests regarding this Privacy Policy or your personal data:

- **Privacy & KVKK Requests**: `privacy@odysseyjournal.app`
- **Customer Support**: `support@odysseyjournal.app`
- **General Inquiries**: `hello@odysseyjournal.app`
- **Postal & Digital Verification**: Gultas Software / Arif Gültaş, Istanbul, Türkiye
- **Website**: `https://odysseyjournal.app/privacy-policy`

---

*By downloading or using Odyssey Journal, you acknowledge and agree to this Privacy Policy.*
