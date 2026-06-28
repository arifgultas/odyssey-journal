-- ================================================================
-- ODYSSEY JOURNAL — Komple Veritabanı Kurulumu (Frankfurt)
-- Bu dosyayı yeni Supabase projesinin SQL Editor'üne yapıştır
-- ve çalıştır. Tüm tablolar, policy'ler, trigger'lar, fonksiyonlar
-- ve storage bucket'ları oluşturulacak.
-- ================================================================

-- ================================================================
-- BÖLÜM 1: TABLOLAR
-- ================================================================

-- 1.1 Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    bio TEXT,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    expo_push_token TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    banned_at TIMESTAMP WITH TIME ZONE,
    notification_preferences JSONB DEFAULT '{"likes": true, "comments": true, "follows": true}'::jsonb,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 1.2 Posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT,
    content TEXT,
    location JSONB,
    location_name TEXT,
    latitude FLOAT,
    longitude FLOAT,
    images TEXT[] DEFAULT '{}',
    image_captions TEXT[],
    weather_data JSONB,
    categories TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.3 Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.4 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) NOT NULL,
    type TEXT CHECK (type IN ('like', 'comment', 'follow')) NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.5 Likes
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- 1.6 Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    collection_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- 1.7 Follows
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.profiles(id) NOT NULL,
    following_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 1.8 User Blocks
CREATE TABLE IF NOT EXISTS public.user_blocks (
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id)
);

-- 1.9 Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(reporter_id, post_id)
);

-- 1.10 Collections
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    cover_image_url TEXT,
    color VARCHAR(7) DEFAULT '#D4A574',
    is_private BOOLEAN DEFAULT false,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bookmarks → collection_id FK
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookmarks' AND column_name = 'collection_id'
    ) THEN
        ALTER TABLE public.bookmarks
        ADD COLUMN collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 1.11 Search History
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    query TEXT NOT NULL,
    type TEXT CHECK (type IN ('location', 'username', 'tag')) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.12 Push Notification Queue
CREATE TABLE IF NOT EXISTS public.push_notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ================================================================
-- BÖLÜM 2: ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_queue ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- BÖLÜM 3: YARDIMCI FONKSİYONLAR (Policy'lerden önce)
-- ================================================================

-- is_blocked_by: Karşılıklı engelleme kontrolü (RLS'te kullanılacak)
CREATE OR REPLACE FUNCTION public.is_blocked_by(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_blocks
        WHERE (blocker_id = user_a AND blocked_id = user_b)
           OR (blocker_id = user_b AND blocked_id = user_a)
    );
$$;

-- ================================================================
-- BÖLÜM 4: POLİCY'LER
-- ================================================================

-- === PROFILES ===
CREATE POLICY "Public profiles are viewable by unblocked users."
    ON public.profiles FOR SELECT
    USING (NOT public.is_blocked_by(auth.uid(), id));

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- === POSTS ===
CREATE POLICY "Posts are viewable by unblocked unbanned users"
    ON public.posts FOR SELECT
    USING (
        NOT public.is_blocked_by(auth.uid(), user_id)
        AND NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = posts.user_id AND is_banned = true
        )
    );

CREATE POLICY "Users can create posts."
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

-- === COMMENTS ===
CREATE POLICY "Comments are viewable by unblocked users"
    ON public.comments FOR SELECT
    USING (NOT public.is_blocked_by(auth.uid(), user_id));

CREATE POLICY "Users can create comments."
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- === NOTIFICATIONS ===
CREATE POLICY "Users can view their own notifications."
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- === LIKES ===
CREATE POLICY "Users can view all likes"
    ON public.likes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own likes"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- === BOOKMARKS ===
CREATE POLICY "Users can view their own bookmarks"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
    ON public.bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
    ON public.bookmarks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON public.bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- === FOLLOWS ===
CREATE POLICY "Follows are viewable by everyone."
    ON public.follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow others."
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow."
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- === USER BLOCKS ===
CREATE POLICY "Users can view their own blocks"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

CREATE POLICY "Users can block others"
    ON public.user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
    ON public.user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- === REPORTS ===
CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
    ON public.reports FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update reports"
    ON public.reports FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- === COLLECTIONS ===
CREATE POLICY "Users can view own collections"
    ON public.collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own collections"
    ON public.collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
    ON public.collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
    ON public.collections FOR DELETE
    USING (auth.uid() = user_id);

-- === SEARCH HISTORY ===
CREATE POLICY "Users can view their own search history"
    ON public.search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
    ON public.search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search history"
    ON public.search_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
    ON public.search_history FOR DELETE
    USING (auth.uid() = user_id);

-- === PUSH NOTIFICATION QUEUE ===
CREATE POLICY "Service role can manage push queue"
    ON public.push_notification_queue FOR ALL
    USING (auth.role() = 'service_role');


-- ================================================================
-- BÖLÜM 5: TRIGGER FONKSİYONLARI
-- ================================================================

-- 5.1 Yeni kullanıcı → profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5.2 Takipçi sayılarını güncelle
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
        UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- 5.3 Beğeni sayılarını güncelle
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.likes;
CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- 5.4 Yorum sayılarını güncelle
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.comments;
CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- 5.5 Beğeni bildirimi oluştur
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id uuid;
    likes_enabled boolean := true;
BEGIN
    target_user_id := (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
    
    -- Check if notifications are enabled for likes in target user's preferences
    SELECT COALESCE((notification_preferences->>'likes')::boolean, true) 
    INTO likes_enabled 
    FROM public.profiles 
    WHERE id = target_user_id;

    -- Don't create notification if user likes their own post or has disabled like notifications
    IF target_user_id != NEW.user_id AND likes_enabled THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (target_user_id, NEW.user_id, 'like', NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_like_notification ON public.likes;
CREATE TRIGGER trigger_like_notification
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

-- 5.6 Yorum bildirimi oluştur
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id uuid;
    comments_enabled boolean := true;
BEGIN
    target_user_id := (SELECT user_id FROM public.posts WHERE id = NEW.post_id);

    -- Check if notifications are enabled for comments in target user's preferences
    SELECT COALESCE((notification_preferences->>'comments')::boolean, true) 
    INTO comments_enabled 
    FROM public.profiles 
    WHERE id = target_user_id;

    -- Don't create notification if user comments on their own post or has disabled comment notifications
    IF target_user_id != NEW.user_id AND comments_enabled THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (target_user_id, NEW.user_id, 'comment', NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_comment_notification ON public.comments;
CREATE TRIGGER trigger_comment_notification
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification();

-- 5.7 Takip bildirimi oluştur
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
    follows_enabled boolean := true;
BEGIN
    -- Check if notifications are enabled for follows in target user's preferences
    SELECT COALESCE((notification_preferences->>'follows')::boolean, true) 
    INTO follows_enabled 
    FROM public.profiles 
    WHERE id = NEW.following_id;

    IF follows_enabled THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (NEW.following_id, NEW.follower_id, 'follow', NULL);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_follow_notification ON public.follows;
CREATE TRIGGER trigger_follow_notification
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.create_follow_notification();

-- 5.8 Beğeni geri alınca bildirimi sil
CREATE OR REPLACE FUNCTION public.delete_like_notification()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.notifications WHERE type = 'like' AND post_id = OLD.post_id AND actor_id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_unlike_notification ON public.likes;
CREATE TRIGGER trigger_unlike_notification
    AFTER DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.delete_like_notification();

-- 5.9 Takipten çıkınca bildirimi sil
CREATE OR REPLACE FUNCTION public.delete_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.notifications WHERE type = 'follow' AND user_id = OLD.following_id AND actor_id = OLD.follower_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_unfollow_notification ON public.follows;
CREATE TRIGGER trigger_unfollow_notification
    AFTER DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.delete_follow_notification();

-- 5.10 Engelleme → takip ilişkisini kaldır
CREATE OR REPLACE FUNCTION public.handle_user_block()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.follows
    WHERE (follower_id = NEW.blocker_id AND following_id = NEW.blocked_id)
       OR (follower_id = NEW.blocked_id AND following_id = NEW.blocker_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_block
    AFTER INSERT ON public.user_blocks
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_block();

-- 5.11 Koleksiyon post sayısı güncelle
CREATE OR REPLACE FUNCTION public.update_collection_post_count()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.collection_id IS NOT NULL THEN
            UPDATE public.collections SET post_count = post_count + 1, updated_at = now() WHERE id = NEW.collection_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.collection_id IS NOT NULL AND OLD.collection_id != NEW.collection_id THEN
            UPDATE public.collections SET post_count = GREATEST(post_count - 1, 0), updated_at = now() WHERE id = OLD.collection_id;
        END IF;
        IF NEW.collection_id IS NOT NULL AND (OLD.collection_id IS NULL OR OLD.collection_id != NEW.collection_id) THEN
            UPDATE public.collections SET post_count = post_count + 1, updated_at = now() WHERE id = NEW.collection_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.collection_id IS NOT NULL THEN
            UPDATE public.collections SET post_count = GREATEST(post_count - 1, 0), updated_at = now() WHERE id = OLD.collection_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_collection_post_count_trigger ON public.bookmarks;
CREATE TRIGGER update_collection_post_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.bookmarks
    FOR EACH ROW EXECUTE FUNCTION public.update_collection_post_count();

-- 5.12 Koleksiyon updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION public.update_collection_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_collection_updated_at ON public.collections;
CREATE TRIGGER set_collection_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.update_collection_updated_at();

-- 5.13 Rapor updated_at güncelle
CREATE OR REPLACE FUNCTION public.update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reports_timestamp ON public.reports;
CREATE TRIGGER trigger_update_reports_timestamp
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.update_reports_updated_at();

-- 5.14 Push bildirim sırası
CREATE OR REPLACE FUNCTION public.notify_push_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_token TEXT;
    actor_name TEXT;
BEGIN
    SELECT expo_push_token INTO target_token FROM public.profiles WHERE id = NEW.user_id;
    SELECT COALESCE(full_name, username, 'Someone') INTO actor_name FROM public.profiles WHERE id = NEW.actor_id;

    IF target_token IS NOT NULL THEN
        INSERT INTO public.push_notification_queue (token, title, body, data, created_at)
        VALUES (
            target_token,
            'Odyssey Journal',
            actor_name || CASE NEW.type
                WHEN 'like' THEN ' liked your post'
                WHEN 'comment' THEN ' commented on your post'
                WHEN 'follow' THEN ' started following you'
                ELSE ' interacted with you'
            END,
            jsonb_build_object('notification_id', NEW.id, 'type', NEW.type, 'post_id', NEW.post_id, 'actor_id', NEW.actor_id),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_push_notification ON public.notifications;
CREATE TRIGGER trigger_push_notification
    AFTER INSERT ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_insert();

-- 5.15 Rate limiting — posts
CREATE OR REPLACE FUNCTION public.check_post_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    post_count INT;
    max_posts_per_hour INT := 10;
    user_created_at TIMESTAMPTZ;
BEGIN
    SELECT created_at INTO user_created_at FROM public.profiles WHERE id = NEW.user_id;
    IF user_created_at >= NOW() - INTERVAL '24 hours' THEN
        max_posts_per_hour := 3;
    END IF;
    SELECT COUNT(*) INTO post_count FROM public.posts WHERE user_id = NEW.user_id AND created_at >= NOW() - INTERVAL '1 hour';
    IF post_count >= max_posts_per_hour THEN
        RAISE EXCEPTION 'Rate limit exceeded: You can only create % posts per hour.', max_posts_per_hour;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_post_rate_limit ON public.posts;
CREATE TRIGGER enforce_post_rate_limit
    BEFORE INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.check_post_rate_limit();

-- 5.16 Rate limiting — comments
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    comment_count INT;
    max_comments_per_hour INT := 30;
    user_created_at TIMESTAMPTZ;
BEGIN
    SELECT created_at INTO user_created_at FROM public.profiles WHERE id = NEW.user_id;
    IF user_created_at >= NOW() - INTERVAL '24 hours' THEN
        max_comments_per_hour := 10;
    END IF;
    SELECT COUNT(*) INTO comment_count FROM public.comments WHERE user_id = NEW.user_id AND created_at >= NOW() - INTERVAL '1 hour';
    IF comment_count >= max_comments_per_hour THEN
        RAISE EXCEPTION 'Rate limit exceeded: You can only post % comments per hour.', max_comments_per_hour;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_comment_rate_limit ON public.comments;
CREATE TRIGGER enforce_comment_rate_limit
    BEFORE INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.check_comment_rate_limit();

-- 5.17 Ban kontrolü
CREATE OR REPLACE FUNCTION public.check_user_not_banned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id AND is_banned = true) THEN
        RAISE EXCEPTION 'Your account has been suspended. You cannot perform this action.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_ban_on_posts ON public.posts;
CREATE TRIGGER enforce_ban_on_posts
    BEFORE INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.check_user_not_banned();

DROP TRIGGER IF EXISTS enforce_ban_on_comments ON public.comments;
CREATE TRIGGER enforce_ban_on_comments
    BEFORE INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.check_user_not_banned();


-- ================================================================
-- BÖLÜM 6: ADMIN FONKSİYONLARI
-- ================================================================

CREATE OR REPLACE FUNCTION public.admin_delete_post(target_post_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    DELETE FROM public.posts WHERE id = target_post_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_delete_post(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_ban_user(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    IF target_user_id = auth.uid() THEN RAISE EXCEPTION 'Cannot ban yourself'; END IF;
    UPDATE public.profiles SET is_banned = true, banned_at = NOW() WHERE id = target_user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_ban_user(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_unban_user(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    UPDATE public.profiles SET is_banned = false, banned_at = NULL WHERE id = target_user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_unban_user(UUID) TO authenticated;

-- Hesap silme fonksiyonu
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE _user_id uuid;
BEGIN
    _user_id := auth.uid();
    IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    DELETE FROM public.notifications WHERE user_id = _user_id OR actor_id = _user_id;
    DELETE FROM public.reports WHERE reporter_id = _user_id;
    DELETE FROM public.comments WHERE user_id = _user_id;
    DELETE FROM public.likes WHERE user_id = _user_id;
    DELETE FROM public.bookmarks WHERE user_id = _user_id;
    DELETE FROM public.collections WHERE user_id = _user_id;
    DELETE FROM public.follows WHERE follower_id = _user_id OR following_id = _user_id;
    DELETE FROM public.likes WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.comments WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.bookmarks WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.posts WHERE user_id = _user_id;
    DELETE FROM public.profiles WHERE id = _user_id;
    DELETE FROM auth.users WHERE id = _user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;


-- ================================================================
-- BÖLÜM 7: VIEW'LAR
-- ================================================================

-- Follow suggestions view
CREATE VIEW public.follow_suggestions
WITH (security_invoker = true)
AS
SELECT p.id, p.username, p.full_name, p.avatar_url, p.bio, p.followers_count, p.following_count, p.updated_at
FROM public.profiles p
WHERE p.id != auth.uid()
AND p.id NOT IN (SELECT following_id FROM public.follows WHERE follower_id = auth.uid())
ORDER BY p.followers_count DESC, p.updated_at DESC
LIMIT 20;

GRANT SELECT ON public.follow_suggestions TO authenticated;

-- Notifications with actors view
CREATE VIEW public.notifications_with_actors
WITH (security_invoker = true)
AS
SELECT n.id, n.user_id, n.actor_id, n.type, n.post_id, n.read, n.created_at,
    p.username as actor_username, p.full_name as actor_full_name, p.avatar_url as actor_avatar_url,
    posts.title as post_title, posts.images as post_images
FROM public.notifications n
LEFT JOIN public.profiles p ON n.actor_id = p.id
LEFT JOIN public.posts ON n.post_id = posts.id
ORDER BY n.created_at DESC;

GRANT SELECT ON public.notifications_with_actors TO authenticated;

-- Comments with users view
CREATE VIEW public.comments_with_users
WITH (security_invoker = true)
AS
SELECT c.id, c.post_id, c.user_id, c.content, c.created_at,
    p.username, p.full_name, p.avatar_url
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC;

GRANT SELECT ON public.comments_with_users TO authenticated;


-- ================================================================
-- BÖLÜM 8: İNDEKSLER
-- ================================================================

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_location_name ON public.posts(location_name);
CREATE INDEX IF NOT EXISTS idx_posts_likes_created ON public.posts(likes_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON public.posts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON public.posts USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_posts_location ON public.posts USING gin(location);
CREATE INDEX IF NOT EXISTS posts_categories_idx ON public.posts USING GIN (categories);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON public.comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id_created_at ON public.comments(user_id, created_at DESC);

-- Likes
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_post ON public.bookmarks(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_collection_id ON public.bookmarks(collection_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON public.follows(follower_id, following_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_post_id ON public.reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Collections
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at DESC);

-- Search History
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON public.search_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON public.search_history(query);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token ON public.profiles(expo_push_token) WHERE expo_push_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_fullname_search ON public.profiles USING gin(to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS idx_profiles_search ON public.profiles USING gin(to_tsvector('english', coalesce(username, '') || ' ' || coalesce(full_name, '')));

-- Push Queue
CREATE INDEX IF NOT EXISTS idx_push_queue_unsent ON public.push_notification_queue(sent, created_at) WHERE sent = false;


-- ================================================================
-- BÖLÜM 9: STORAGE BUCKET'LAR
-- ================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('collection-covers', 'collection-covers', true) ON CONFLICT (id) DO NOTHING;

-- Avatars storage policies (Simpler, working version from FIX_AVATAR_UPLOAD.sql)
CREATE POLICY "Public Avatar Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- Posts storage policies
CREATE POLICY "Post images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Users can upload post images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own post images" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Collection covers storage policies
CREATE POLICY "Collection covers are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'collection-covers');
CREATE POLICY "Users can upload collection covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'collection-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update collection covers" ON storage.objects FOR UPDATE USING (bucket_id = 'collection-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete collection covers" ON storage.objects FOR DELETE USING (bucket_id = 'collection-covers' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ================================================================
-- BÖLÜM 10: PERFORMANCE IMPROVEMENTS FUNCTIONS
-- ================================================================

-- 1. Popular Destinations
CREATE OR REPLACE FUNCTION public.get_popular_destinations(p_limit int DEFAULT 10)
RETURNS TABLE (
    location_name text,
    latitude double precision,
    longitude double precision,
    post_count bigint,
    image_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_posts AS (
        SELECT 
            p.location_name,
            p.latitude,
            p.longitude,
            p.images[1] as first_image,
            ROW_NUMBER() OVER (PARTITION BY p.location_name ORDER BY p.created_at DESC) as rn
        FROM public.posts p
        WHERE p.location_name IS NOT NULL
    )
    SELECT 
        p.location_name,
        MIN(p.latitude) as latitude,
        MIN(p.longitude) as longitude,
        COUNT(*) as post_count,
        (SELECT rp.first_image FROM ranked_posts rp WHERE rp.location_name = p.location_name AND rp.rn = 1) as image_url
    FROM public.posts p
    WHERE p.location_name IS NOT NULL
    GROUP BY p.location_name
    ORDER BY post_count DESC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_popular_destinations(int) TO authenticated;

-- 2. Trending Locations (Son 7 gün içinde trend skoruna göre)
CREATE OR REPLACE FUNCTION public.get_trending_locations(p_limit int DEFAULT 10)
RETURNS TABLE (
    location_name text,
    latitude double precision,
    longitude double precision,
    post_count bigint,
    recent_post_count bigint,
    trend_score bigint,
    image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH post_scores AS (
        SELECT 
            p.location_name,
            p.latitude,
            p.longitude,
            p.created_at,
            p.images[1] as first_image,
            GREATEST(7 - EXTRACT(DAY FROM (now() - p.created_at)), 1)::bigint as score
        FROM public.posts p
        WHERE p.location_name IS NOT NULL
          AND p.created_at >= now() - INTERVAL '7 days'
    ),
    ranked_posts AS (
        SELECT 
            ps.location_name,
            ps.first_image,
            ROW_NUMBER() OVER (PARTITION BY ps.location_name ORDER BY ps.created_at DESC) as rn
        FROM post_scores ps
    )
    SELECT 
        ps.location_name,
        MIN(ps.latitude) as latitude,
        MIN(ps.longitude) as longitude,
        (SELECT COUNT(*) FROM public.posts p2 WHERE p2.location_name = ps.location_name)::bigint as post_count,
        COUNT(*)::bigint as recent_post_count,
        SUM(ps.score)::bigint as trend_score,
        (SELECT rp.first_image FROM ranked_posts rp WHERE rp.location_name = ps.location_name AND rp.rn = 1) as image_url
    FROM post_scores ps
    GROUP BY ps.location_name
    ORDER BY trend_score DESC
    LIMIT p_limit;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_trending_locations(int) TO authenticated;


-- ================================================================
-- BÖLÜM 13: DIRECT MESSAGING SYSTEM
-- ================================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own sent and received messages" ON public.messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages as themselves" ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received" ON public.messages
    FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_flow 
ON public.messages (sender_id, receiver_id, created_at DESC);

-- Enable Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- Enable Realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Enable Realtime for posts table
ALTER TABLE public.posts REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
END $$;


-- ================================================================
-- KURULUM TAMAMLANDI!
-- ================================================================
