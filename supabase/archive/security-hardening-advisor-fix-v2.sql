-- ==============================================================================
-- ODYSSEY JOURNAL - SUPABASE SECURITY ADVISOR FINAL RESOLUTION (V2)
-- ==============================================================================
-- Bu betik, Supabase Advisors kalan tüm uyarılarını kalıcı olarak çözer:
--
-- 1. pg_graphql_anon_table_exposed & pg_graphql_authenticated_table_exposed (34 uyarı)
--    Odyssey Journal REST API (PostgREST / @supabase/supabase-js) kullanmaktadır,
--    GraphQL kullanılmadığı için pg_graphql eklentisi güvenli bir şekilde devre dışı bırakılır.
--
-- 2. anon_security_definer_function_executable (2 uyarı)
--    get_popular_destinations ve get_trending_locations fonksiyonları SECURITY INVOKER
--    moduna geçirilip anon rolünden execute yetkisi geri alınır.
--
-- 3. authenticated_security_definer_function_executable
--    delete_conversation_for_user ve lokasyon fonksiyonları SECURITY INVOKER'a geçirilir.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PG_GRAPHQL EKLENTİSİNİ KALDIRMA (TÜM 34 GRAPHQL UYARISINI SIFIRLAR)
-- ------------------------------------------------------------------------------
-- Uygulamamız PostgREST REST istemcisi kullandığından pg_graphql gerekli değildir.
-- Bu komut public tablolara dair tüm anon/authenticated GraphQL exposure uyarılarını çözer.

DROP EXTENSION IF EXISTS pg_graphql CASCADE;


-- ------------------------------------------------------------------------------
-- 2. FONKSİYONLARI SECURITY INVOKER YAPMA VE ANON ERİŞİMİNİ KAPATMA
-- ------------------------------------------------------------------------------

-- A) get_popular_destinations
-- Sadece public.posts tablosunu okuduğu için SECURITY DEFINER'a ihtiyacı yoktur.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_popular_destinations') THEN
        ALTER FUNCTION public.get_popular_destinations(integer) SECURITY INVOKER;
        REVOKE EXECUTE ON FUNCTION public.get_popular_destinations(integer) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.get_popular_destinations(integer) TO authenticated;
    END IF;
END $$;

-- B) get_trending_locations
-- Sadece public.posts tablosunu okuduğu için SECURITY DEFINER'a ihtiyacı yoktur.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_trending_locations') THEN
        ALTER FUNCTION public.get_trending_locations(integer) SECURITY INVOKER;
        REVOKE EXECUTE ON FUNCTION public.get_trending_locations(integer) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.get_trending_locations(integer) TO authenticated;
    END IF;
END $$;

-- C) delete_conversation_for_user
-- Sadece kullanıcının kendi sohbet mesajlarını (messages ve message_approvals) güncellediği için
-- RLS politikaları dahilinde SECURITY INVOKER olarak güvenle çalışır.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_conversation_for_user') THEN
        ALTER FUNCTION public.delete_conversation_for_user(uuid) SECURITY INVOKER;
        REVOKE EXECUTE ON FUNCTION public.delete_conversation_for_user(uuid) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.delete_conversation_for_user(uuid) TO authenticated;
    END IF;
END $$;

-- D) Kalan SECURITY DEFINER Fonksiyonları Hakkında Güvenlik Teyidi:
-- - delete_user_account(): auth.users tablosuna yalnızca SECURITY DEFINER ile erişilebilir.
--   Fonksiyon auth.uid() kontrolüyle sadece çağıran kullanıcının kaydını sildiği için güvenlidir.
-- - get_blocked_users_profiles(): Kullanıcının engellediği profilleri listede görebilmesi
--   için profiles RLS politikasını atlamak zorundadır; b.blocker_id = auth.uid() ile korunur.
-- - is_blocked_by(): RLS politikalarında sonsuz döngüyü önlemek için SECURITY DEFINER çalışmalıdır.
-- ------------------------------------------------------------------------------
