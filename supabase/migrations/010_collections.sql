-- =============================================================================
-- Collections Feature - Database Migration
-- Supabase SQL Editor'de çalıştırın
-- =============================================================================

-- 1. Collections tablosunu oluştur
CREATE TABLE IF NOT EXISTS collections (
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

-- 2. Collections tablosu için index oluştur
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);

-- 3. Bookmarks tablosuna collection_id ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookmarks' AND column_name = 'collection_id'
    ) THEN
        ALTER TABLE bookmarks ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Bookmarks için collection index
CREATE INDEX IF NOT EXISTS idx_bookmarks_collection_id ON bookmarks(collection_id);

-- 5. RLS (Row Level Security) Policies for collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi koleksiyonlarını görebilir
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
CREATE POLICY "Users can view own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

-- Kullanıcılar kendi koleksiyonlarını oluşturabilir
DROP POLICY IF EXISTS "Users can create own collections" ON collections;
CREATE POLICY "Users can create own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi koleksiyonlarını güncelleyebilir
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
CREATE POLICY "Users can update own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

-- Kullanıcılar kendi koleksiyonlarını silebilir
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;
CREATE POLICY "Users can delete own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Koleksiyon post sayısını güncelleyen trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_collection_post_count()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.collection_id IS NOT NULL THEN
            UPDATE public.collections
            SET post_count = post_count + 1,
                updated_at = now()
            WHERE id = NEW.collection_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Eski koleksiyondan çıkar
        IF OLD.collection_id IS NOT NULL AND OLD.collection_id != NEW.collection_id THEN
            UPDATE public.collections
            SET post_count = GREATEST(post_count - 1, 0),
                updated_at = now()
            WHERE id = OLD.collection_id;
        END IF;
        -- Yeni koleksiyona ekle
        IF NEW.collection_id IS NOT NULL AND OLD.collection_id != NEW.collection_id THEN
            UPDATE public.collections
            SET post_count = post_count + 1,
                updated_at = now()
            WHERE id = NEW.collection_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.collection_id IS NOT NULL THEN
            UPDATE public.collections
            SET post_count = GREATEST(post_count - 1, 0),
                updated_at = now()
            WHERE id = OLD.collection_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger oluştur
DROP TRIGGER IF EXISTS update_collection_post_count_trigger ON bookmarks;
CREATE TRIGGER update_collection_post_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_post_count();

-- 8. updated_at kolonunu otomatik güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_collection_updated_at()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. updated_at trigger'ı
DROP TRIGGER IF EXISTS set_collection_updated_at ON collections;
CREATE TRIGGER set_collection_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_updated_at();

-- 10. Koleksiyon kapak resimleri için storage bucket (opsiyonel)
INSERT INTO storage.buckets (id, name, public)
VALUES ('collection-covers', 'collection-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for collection covers
DROP POLICY IF EXISTS "Collection covers are publicly accessible" ON storage.objects;
CREATE POLICY "Collection covers are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'collection-covers');

DROP POLICY IF EXISTS "Users can upload collection covers" ON storage.objects;
CREATE POLICY "Users can upload collection covers"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'collection-covers' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update collection covers" ON storage.objects;
CREATE POLICY "Users can update collection covers"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'collection-covers' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete collection covers" ON storage.objects;
CREATE POLICY "Users can delete collection covers"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'collection-covers' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =============================================================================
-- Migration Complete!
-- =============================================================================
