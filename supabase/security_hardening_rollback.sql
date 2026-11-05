-- Rollback for security_hardening.sql: restores the previous privileges and
-- the default search_path of set_updated_at.
grant execute on function public.handle_new_user() to public, anon, authenticated;
grant execute on function public.set_updated_at() to public, anon, authenticated;
alter function public.set_updated_at() reset search_path;

grant execute on function public.kb_library_outline(text) to anon, authenticated;
grant execute on function public.kb_section_preview(text, text, text) to anon, authenticated;
grant execute on function public.kb_country_outline(text, text) to anon, authenticated;
grant execute on function public.kb_library_countries(text) to anon, authenticated;
grant execute on function public.kb_i18n_stats() to anon, authenticated;
