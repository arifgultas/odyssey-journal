-- ==============================================================================
-- ODYSSEY JOURNAL - SUPABASE SECURITY ADVISOR HARDENING SCRIPT
-- ==============================================================================
-- Bu betik, Supabase Advisors (Linter) tarafından tespit edilen tüm güvenlik
-- uyarılarını (WARN) kalıcı olarak çözer:
-- 1. function_search_path_mutable (search_path sabitlenmesi)
-- 2. public_bucket_allows_listing (geniş storage SELECT politikalarının kaldırılması)
-- 3. pg_graphql table exposed (kullanılmayan GraphQL şema görünürlüğünün kapatılması)
-- 4. anon / authenticated security definer function executable (RPC yetkilerinin kısıtlanması)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FUNCTION SEARCH PATH MUTABLE ÇÖZÜMÜ
-- ------------------------------------------------------------------------------
-- Fonksiyonların search_path parametresini 'public' olarak sabitleyerek
-- arama yolu manipülasyonu açıklarını önler.

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_follow_counts() SET search_path = public;
ALTER FUNCTION public.update_post_likes_count() SET search_path = public;
ALTER FUNCTION public.update_post_comments_count() SET search_path = public;
ALTER FUNCTION public.delete_like_notification() SET search_path = public;
ALTER FUNCTION public.delete_follow_notification() SET search_path = public;
ALTER FUNCTION public.update_reports_updated_at() SET search_path = public;

-- Parametreli fonksiyonlar
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_places') THEN
        EXECUTE 'ALTER FUNCTION public.get_recommended_places SET search_path = public;';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_popular_destinations') THEN
        EXECUTE 'ALTER FUNCTION public.get_popular_destinations SET search_path = public;';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_trending_locations') THEN
        EXECUTE 'ALTER FUNCTION public.get_trending_locations SET search_path = public;';
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2. PUBLIC BUCKET ALLOWS LISTING ÇÖZÜMÜ
-- ------------------------------------------------------------------------------
-- Public bucket'lar (avatars, collection-covers, posts) CDN üzerinden dosya URL'i
-- ile doğrudan herkese açıktır. Ancak storage.objects üzerindeki geniş SELECT
-- politikaları anonim kullanıcıların tüm bucket dosyalarını listelemesine (scrape)
-- olanak tanır. Bu politikalar kaldırılarak listing engellenir, doğrudan URL erişimi korunur.

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Collection covers are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Post images are publicly accessible" ON storage.objects;


-- ------------------------------------------------------------------------------
-- 3. PG_GRAPHQL EXPOSURE ÇÖZÜMÜ
-- ------------------------------------------------------------------------------
-- Odyssey Journal istemcisi Supabase REST API (PostgREST) kullanmaktadır.
-- GraphQL şemasının anonim ve oturum açmış kullanıcılara tüm tabloları
-- expose etmesini kapatmak için şema yorumu eklenir.

COMMENT ON SCHEMA public IS e'@graphql({"exposed": false})';


-- ------------------------------------------------------------------------------
-- 4. SECURITY DEFINER FONKSİYONLARININ RPC ERİŞİMİNİ KISITLAMA
-- ------------------------------------------------------------------------------
-- PostgreSQL'de varsayılan olarak fonksiyonlar PUBLIC rolüne açıktır.
-- Tetikleyici (trigger), dahili (internal) ve admin fonksiyonların doğrudan
-- istemci tarafından RPC ile çağrılmasını engelliyoruz.

-- A) Trigger Fonksiyonları (Sadece trigger çalıştırmalıdır, doğrudan RPC çağrılamaz)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_user_block() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_on_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_follow_counts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_follower_counts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_comments_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_counts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_comment_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_follow_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_like_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_follow_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_like_notification() FROM PUBLIC, anon, authenticated;

-- Rate Limit & Ban Kontrol Trigger Fonksiyonları
REVOKE EXECUTE ON FUNCTION public.check_comment_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_post_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_user_not_banned() FROM PUBLIC, anon, authenticated;

-- B) Admin Fonksiyonları (Anonim ve normal oturum açmış kullanıcılar çağıramaz, sadece service_role)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_ban_user') THEN
        REVOKE EXECUTE ON FUNCTION public.admin_ban_user(uuid) FROM PUBLIC, anon, authenticated;
        GRANT EXECUTE ON FUNCTION public.admin_ban_user(uuid) TO service_role;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_delete_post') THEN
        REVOKE EXECUTE ON FUNCTION public.admin_delete_post(uuid) FROM PUBLIC, anon, authenticated;
        GRANT EXECUTE ON FUNCTION public.admin_delete_post(uuid) TO service_role;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_unban_user') THEN
        REVOKE EXECUTE ON FUNCTION public.admin_unban_user(uuid) FROM PUBLIC, anon, authenticated;
        GRANT EXECUTE ON FUNCTION public.admin_unban_user(uuid) TO service_role;
    END IF;
END $$;

-- C) Kullanıcı Hesap & Sohbet Yardımcı Fonksiyonları (Anonim çağıramaz, sadece authenticated)
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_conversation_for_user') THEN
        REVOKE EXECUTE ON FUNCTION public.delete_conversation_for_user(uuid) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.delete_conversation_for_user(uuid) TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_blocked_users_profiles') THEN
        REVOKE EXECUTE ON FUNCTION public.get_blocked_users_profiles() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.get_blocked_users_profiles() TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_blocked_by') THEN
        REVOKE EXECUTE ON FUNCTION public.is_blocked_by(uuid, uuid) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.is_blocked_by(uuid, uuid) TO authenticated;
    END IF;
END $$;
