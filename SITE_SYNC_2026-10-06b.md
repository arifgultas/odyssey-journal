# SITE_SYNC 2026-10-06b — 5651: 1 yıllık içerik/trafik kaydı

Site oturumundan uygulamaya. Arif'in onayıyla yazıldı.

## Neden
5651 sayılı Kanun m. 5/3: kullanıcıların içerik barındırdığı yer sağlayıcı, **trafik bilgisini en az 1, en çok 2 yıl**
saklamak zorunda. Gönderi, yorum ve mesajlarda biz yer sağlayıcıyız. Bugün böyle bir kayıt yok: uygulama
veritabanında IP tutulmuyor, Supabase panel kayıtları ~7 gün. Hedef: kim, ne zaman, hangi IP'den, neyi
oluşturdu/değiştirdi/sildi; 1 yıl saklanır, sonra kendiliğinden silinir.

## Build 11 gerekmez
Yazmaların hepsi supabase-js ile doğrudan tabloya gidiyor (`lib/posts.ts`, `lib/comments.ts`, `lib/chat.ts` ...).
Bu yüzden iş **yalnızca veritabanı migration'ı**: tablolara trigger, istemcinin IP'si PostgREST'in istek
başlıklarından okunur. Migration uygulandığı anda tüm build'ler (eski sürümler dahil) kayıt üretir. Uygulama kodu
değişmez. (İleride kod değişikliği gerekirse, örn. IP başlığı gelmezse, o zaman ayrıca konuşalım.)

## Yapılacak: `034_traffic_log.sql`
1. **Tablo `public.traffic_log`**
   - `id bigint generated always as identity primary key`
   - `occurred_at timestamptz not null default now()`
   - `user_id uuid` — **foreign key YOK** (hesap silinince kayıt kalmalı; kanunen 1 yıl saklanır)
   - `ip inet` — istemci IP'si
   - `action text` — `insert` / `update` / `delete`
   - `table_name text`, `row_id text`
   - `user_agent text` (varsa)
   - Index: `occurred_at` (silme işi için), `user_id`.
   - **RLS açık, hiçbir policy yok** → kullanıcılar ve anon okuyamaz/yazamaz. Yalnız service role / SQL editör.
2. **Trigger fonksiyonu** (`security definer`, `set search_path = public`): `AFTER INSERT OR UPDATE OR DELETE ... FOR EACH ROW`
   - `user_id = auth.uid()`
   - IP: `current_setting('request.headers', true)::json` içinden `x-forwarded-for`'un **ilk** adresi; yoksa
     `cf-connecting-ip`; `inet`'e çevrilemezse `null`.
   - `user_agent`: aynı başlıklardan `user-agent`.
   - **Hata trigger'ı asla kırmasın**: fonksiyon gövdesi `begin ... exception when others then null; end` içinde, böylece
     kayıt yazılamasa bile kullanıcının gönderisi kaydedilir.
   - `row_id`: `coalesce(NEW.id, OLD.id)::text`.
   - Servis rolüyle (moderasyon edge function'ı, admin RPC'leri, cron) yapılan değişiklikler de kayda düşer; `auth.uid()`
     null olur, sorun değil.
3. **Hangi tablolar:** başkalarının görebildiği kullanıcı içeriği:
   - `posts`, `comments`, `messages`
   - `profiles` (kullanıcı adı, bio, avatar herkese açık)
   - `collections` — başkalarına görünüyorsa ekleyin, yalnız sahibine görünüyorsa gerek yok.
   - `likes`, `follows`, `bookmarks`, `search_history`, `notifications` → **eklemeyin** (içerik değil; gereksiz veri KVKK'ya ters).
4. **1 yıl sonra silme:** pg_cron (013'te zaten kullanılıyor), günde bir:
   `delete from public.traffic_log where occurred_at < now() - interval '365 days';`
5. **`delete_user_account` (011)**: `traffic_log`'a dokunmadığını kontrol edin. Hesap silinince bu kayıtlar 1 yılını
   doldurana kadar kalmalı.

## Test
- Cihazdan bir gönderi + yorum + mesaj at, bir gönderiyi düzenle, birini sil.
- SQL editörde: `select * from traffic_log order by id desc limit 10;` → `user_id` dolu, **`ip` gerçek telefon IP'si**
  (Supabase/Cloudflare sunucu adresi değil; Wi-Fi'deyken https://api.ipify.org ile karşılaştırın), `action` doğru.
- Eski build (8/9/10) ile de dene: kayıt düşmeli.
- Purge sorgusunu bir kez elle çalıştır, hata vermesin.

## Ayrıca kontrol (site metni için lazım)
- `auth.audit_log_entries` tablosunda `ip_address` dolu mu (giriş/kayıt olaylarında)? `delete_user_account` bunları
  siliyor mu? Supabase bu tabloyu ne kadar tutuyor? Gizlilik metni "hesap silinince veriler hemen silinir" diyor;
  orada IP kalıyorsa metne eklemem gerekiyor.

## Bitince
Bir `APP_SYNC_2026-10-06*.md` ile bildirin: migration numarası, hangi tablolar loglandı, alanlar, IP'nin gerçek
istemci IP'si geldiği (test sonucu), purge cron'u, `delete_user_account` kayıtlara dokunmuyor mu, `audit_log_entries`
cevabı. Site oturumu buna göre **Gizlilik §8 (saklama), Gizlilik toplanan veriler bölümü ve Hesap silme §4**'ü
12 dilde günceller. Kayıt kurulmadan metne yazılmayacak.
