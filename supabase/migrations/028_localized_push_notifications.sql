-- Push notifications in the recipient's language.
--
-- The trigger that queues a push notification built its text in English, in SQL:
--   actor_name || CASE NEW.type WHEN 'like' THEN ' liked your post' ... END
-- So a reader using the app in Japanese still got an English push. The recipient's language
-- was not even stored anywhere.
--
-- This migration stores the language on the profile and moves the wording into a table, one
-- row per language and notification type, so the trigger only has to look it up.

-- 1. The reader's language, kept in step by the app when they change it in Settings
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en';

DO $$
BEGIN
    ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_preferred_language_supported
        CHECK (preferred_language IN ('tr','en','es','fr','de','pt','it','ru','ja','ko','zh','ar'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.profiles.preferred_language IS
    'Language the app is set to for this user. Used to localize push notifications.';

-- 2. The wording, one row per language and type
CREATE TABLE IF NOT EXISTS public.push_notification_texts (
    lang text NOT NULL,
    -- notification type, or 'actor_fallback' for the name shown when the actor has none
    type text NOT NULL,
    -- '{{actor}}' is replaced with the acting user's name
    body_template text NOT NULL,
    PRIMARY KEY (lang, type)
);

COMMENT ON TABLE public.push_notification_texts IS
    'Push notification wording per language. {{actor}} is replaced with the acting user''s name.';

ALTER TABLE public.push_notification_texts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Push texts are readable by everyone" ON public.push_notification_texts;
CREATE POLICY "Push texts are readable by everyone"
    ON public.push_notification_texts FOR SELECT
    USING (true);

GRANT SELECT ON public.push_notification_texts TO anon, authenticated;

INSERT INTO public.push_notification_texts (lang, type, body_template) VALUES
    -- like
    ('en', 'like', '{{actor}} liked your post'),
    ('tr', 'like', '{{actor}} gönderinizi beğendi'),
    ('es', 'like', 'A {{actor}} le gustó tu publicación'),
    ('fr', 'like', '{{actor}} a aimé votre publication'),
    ('de', 'like', '{{actor}} gefällt dein Beitrag'),
    ('pt', 'like', '{{actor}} curtiu sua publicação'),
    ('it', 'like', 'A {{actor}} piace il tuo post'),
    ('ru', 'like', '{{actor}} оценил(а) вашу запись'),
    ('ja', 'like', '{{actor}}さんがあなたの投稿にいいねしました'),
    ('ko', 'like', '{{actor}}님이 회원님의 게시물을 좋아합니다'),
    ('zh', 'like', '{{actor}} 赞了你的帖子'),
    ('ar', 'like', 'أعجب {{actor}} بمنشورك'),

    -- comment
    ('en', 'comment', '{{actor}} commented on your post'),
    ('tr', 'comment', '{{actor}} gönderinize yorum yaptı'),
    ('es', 'comment', '{{actor}} comentó tu publicación'),
    ('fr', 'comment', '{{actor}} a commenté votre publication'),
    ('de', 'comment', '{{actor}} hat deinen Beitrag kommentiert'),
    ('pt', 'comment', '{{actor}} comentou sua publicação'),
    ('it', 'comment', '{{actor}} ha commentato il tuo post'),
    ('ru', 'comment', '{{actor}} оставил(а) комментарий к вашей записи'),
    ('ja', 'comment', '{{actor}}さんがあなたの投稿にコメントしました'),
    ('ko', 'comment', '{{actor}}님이 회원님의 게시물에 댓글을 남겼습니다'),
    ('zh', 'comment', '{{actor}} 评论了你的帖子'),
    ('ar', 'comment', 'علّق {{actor}} على منشورك'),

    -- follow
    ('en', 'follow', '{{actor}} started following you'),
    ('tr', 'follow', '{{actor}} sizi takip etmeye başladı'),
    ('es', 'follow', '{{actor}} empezó a seguirte'),
    ('fr', 'follow', '{{actor}} a commencé à vous suivre'),
    ('de', 'follow', '{{actor}} folgt dir jetzt'),
    ('pt', 'follow', '{{actor}} começou a seguir você'),
    ('it', 'follow', '{{actor}} ha iniziato a seguirti'),
    ('ru', 'follow', '{{actor}} подписался(ась) на вас'),
    ('ja', 'follow', '{{actor}}さんがあなたをフォローしました'),
    ('ko', 'follow', '{{actor}}님이 회원님을 팔로우하기 시작했습니다'),
    ('zh', 'follow', '{{actor}} 开始关注你'),
    ('ar', 'follow', 'بدأ {{actor}} بمتابعتك'),

    -- mention
    ('en', 'mention', '{{actor}} mentioned you'),
    ('tr', 'mention', '{{actor}} sizden bahsetti'),
    ('es', 'mention', '{{actor}} te mencionó'),
    ('fr', 'mention', '{{actor}} vous a mentionné'),
    ('de', 'mention', '{{actor}} hat dich erwähnt'),
    ('pt', 'mention', '{{actor}} mencionou você'),
    ('it', 'mention', '{{actor}} ti ha menzionato'),
    ('ru', 'mention', '{{actor}} упомянул(а) вас'),
    ('ja', 'mention', '{{actor}}さんがあなたをメンションしました'),
    ('ko', 'mention', '{{actor}}님이 회원님을 언급했습니다'),
    ('zh', 'mention', '{{actor}} 提到了你'),
    ('ar', 'mention', 'أشار إليك {{actor}}'),

    -- anything else
    ('en', 'default', '{{actor}} interacted with you'),
    ('tr', 'default', '{{actor}} sizinle etkileşime geçti'),
    ('es', 'default', '{{actor}} interactuó contigo'),
    ('fr', 'default', '{{actor}} a interagi avec vous'),
    ('de', 'default', '{{actor}} hat mit dir interagiert'),
    ('pt', 'default', '{{actor}} interagiu com você'),
    ('it', 'default', '{{actor}} ha interagito con te'),
    ('ru', 'default', '{{actor}} взаимодействовал(а) с вами'),
    ('ja', 'default', '{{actor}}さんがあなたに反応しました'),
    ('ko', 'default', '{{actor}}님이 회원님과 상호작용했습니다'),
    ('zh', 'default', '{{actor}} 与你互动了'),
    ('ar', 'default', 'تفاعل {{actor}} معك'),

    -- name shown when the acting user has neither a full name nor a username
    ('en', 'actor_fallback', 'Someone'),
    ('tr', 'actor_fallback', 'Biri'),
    ('es', 'actor_fallback', 'Alguien'),
    ('fr', 'actor_fallback', 'Quelqu''un'),
    ('de', 'actor_fallback', 'Jemand'),
    ('pt', 'actor_fallback', 'Alguém'),
    ('it', 'actor_fallback', 'Qualcuno'),
    ('ru', 'actor_fallback', 'Кто-то'),
    ('ja', 'actor_fallback', '誰か'),
    ('ko', 'actor_fallback', '누군가'),
    ('zh', 'actor_fallback', '有人'),
    ('ar', 'actor_fallback', 'شخص ما')
ON CONFLICT (lang, type) DO UPDATE SET body_template = EXCLUDED.body_template;

-- 3. The trigger now reads the recipient's language and looks the wording up
CREATE OR REPLACE FUNCTION public.notify_push_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_token TEXT;
    target_lang TEXT;
    actor_name TEXT;
    template TEXT;
BEGIN
    SELECT expo_push_token, COALESCE(preferred_language, 'en')
    INTO target_token, target_lang
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF target_token IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(full_name, username) INTO actor_name
    FROM public.profiles
    WHERE id = NEW.actor_id;

    IF actor_name IS NULL OR actor_name = '' THEN
        SELECT body_template INTO actor_name
        FROM public.push_notification_texts
        WHERE lang = target_lang AND type = 'actor_fallback';
        actor_name := COALESCE(actor_name, 'Someone');
    END IF;

    -- The reader's language, then English, then the notification's own type as a last resort
    SELECT body_template INTO template
    FROM public.push_notification_texts
    WHERE lang = target_lang AND type = NEW.type;

    IF template IS NULL THEN
        SELECT body_template INTO template
        FROM public.push_notification_texts
        WHERE lang = target_lang AND type = 'default';
    END IF;

    IF template IS NULL THEN
        SELECT body_template INTO template
        FROM public.push_notification_texts
        WHERE lang = 'en' AND type = 'default';
    END IF;

    INSERT INTO public.push_notification_queue (token, title, body, data, created_at)
    VALUES (
        target_token,
        'Odyssey Journal',
        replace(COALESCE(template, '{{actor}}'), '{{actor}}', actor_name),
        jsonb_build_object(
            'notification_id', NEW.id,
            'type', NEW.type,
            'post_id', NEW.post_id,
            'actor_id', NEW.actor_id
        ),
        NOW()
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_push_notification ON public.notifications;
CREATE TRIGGER trigger_push_notification
    AFTER INSERT ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_insert();
