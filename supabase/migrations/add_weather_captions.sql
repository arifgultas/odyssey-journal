-- Post Detail Enhancements Migration
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- 1. Weather data sütunu ekleme (hava durumu verisi için)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS weather_data jsonb;

-- 2. Image captions sütunu ekleme (resim alt yazıları için)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_captions text[];

-- Yorum: weather_data JSON formatı
-- {
--   "temperature": 14,
--   "weatherCode": 0,
--   "condition": "Clear",
--   "icon": "sunny"
-- }

-- Yorum: image_captions array formatı
-- ["İlk resim açıklaması", "İkinci resim açıklaması", ...]
