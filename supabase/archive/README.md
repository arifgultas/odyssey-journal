# Arşiv — elle çalıştırılmış eski SQL dosyaları

Bu dosyalar bir zamanlar `migrations/` içindeydi ama numarasız oldukları için `supabase db push`
onları hiç uygulamadı; SQL editöründen elle çalıştırıldılar. Tarih kaydı olarak duruyorlar.

**Yeniden çalıştırmayın.** Örneğin `fix_function_search_path.sql` bildirim tetikleyicilerini
bildirim tercihlerini (023) yok sayan eski hâline döndürür; `FIX_AVATAR_UPLOAD.sql` herkesin
herkesin avatarını silebildiği politikaları geri getirir (030 bunları kapattı).

## 29 Eylül'de eklenenler

`supabase/` kökünde duran ilk şema dosyaları (`schema*.sql`, `storage-policies*.sql`,
`security-hardening-*.sql`, `indexes.sql` …) ve onları anlatan üç rehber de buraya taşındı.
Hepsi `migrations/` öncesinden kalma; canlı veritabanının bugünkü hâli `FULL_SETUP.sql` +
`migrations/` (030 ve 031 dahil). Özellikle `storage-policies*.sql`, 030'un kapattığı herkese açık
avatar/gönderi yazma izinlerini geri açar — **bunları da yeniden çalıştırmayın.**
