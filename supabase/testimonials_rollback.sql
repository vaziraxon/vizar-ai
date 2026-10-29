-- =============================================================================
-- Rollback for supabase/testimonials.sql
-- =============================================================================
-- Deletes every testimonial and consent record. Empty the "testimonials"
-- bucket first (Dashboard → Storage), otherwise deleting the bucket fails.
-- =============================================================================

drop policy if exists "testimonials_media_select" on storage.objects;
drop policy if exists "testimonials_media_insert" on storage.objects;
drop policy if exists "testimonials_media_update" on storage.objects;
drop policy if exists "testimonials_media_delete" on storage.objects;
delete from storage.buckets where id = 'testimonials';

drop table if exists public.testimonial_consents;
drop table if exists public.testimonials;
drop function if exists public.is_site_editor();
drop table if exists public.site_editors;
