# Arşiv — elle çalıştırılmış eski SQL dosyaları

Bu dosyalar bir zamanlar `migrations/` içindeydi ama numarasız oldukları için `supabase db push`
onları hiç uygulamadı; SQL editöründen elle çalıştırıldılar. Tarih kaydı olarak duruyorlar.

**Yeniden çalıştırmayın.** Örneğin `fix_function_search_path.sql` bildirim tetikleyicilerini
bildirim tercihlerini (023) yok sayan eski hâline döndürür; `FIX_AVATAR_UPLOAD.sql` herkesin
herkesin avatarını silebildiği politikaları geri getirir (030 bunları kapattı).
