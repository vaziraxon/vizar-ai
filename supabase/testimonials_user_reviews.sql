-- =============================================================================
-- VIZAR AI — customers write their own reviews (free, signed-in)
-- =============================================================================
-- Run after supabase/testimonials.sql. Safe to re-run.
--
-- Any signed-in user with a confirmed email can publish ONE review and later
-- edit or delete it. It goes live at once; editors can unpublish or delete it
-- in /admin/testimonials, and a review an editor unpublished stays hidden when
-- its author edits it. Writing goes through submit_my_testimonial(), which
-- validates the input and records consent — users get no direct insert or
-- update rights on the table. Links and @handles are refused (spam).
-- =============================================================================

alter table public.testimonials
  add column if not exists user_id uuid references auth.users (id) on delete cascade;
create unique index if not exists testimonials_one_per_user
  on public.testimonials (user_id) where user_id is not null;

comment on column public.testimonials.user_id is
  'Author, when the customer wrote the review themselves on the site. Null for reviews entered by editors.';

-- Authors can see and delete their own review, published or not
drop policy if exists "testimonials_member_read" on public.testimonials;
create policy "testimonials_member_read" on public.testimonials for select to authenticated
  using ((published and consent_given) or user_id = auth.uid() or public.is_site_editor());
drop policy if exists "testimonials_delete" on public.testimonials;
create policy "testimonials_delete" on public.testimonials for delete to authenticated
  using (public.is_site_editor() or user_id = auth.uid());

create or replace function public.submit_my_testimonial(
  p_name text,
  p_destination text,
  p_tool text,
  p_rating integer,
  p_quote text,
  p_locale text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_quote text := btrim(regexp_replace(coalesce(p_quote, ''), '\s+', ' ', 'g'));
  v_spam text := '(https?://|www\.|t\.me/|@[a-z0-9_]{4,}|[a-z0-9-]+\.(com|uz|ru|net|org|io|me)(/|\s|$))';
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if not exists (select 1 from auth.users where id = v_uid and email_confirmed_at is not null) then
    raise exception 'email_not_confirmed' using errcode = '28000';
  end if;
  if char_length(v_name) not between 2 and 40
     or char_length(v_quote) not between 10 and 600
     or p_rating is null or p_rating not between 1 and 5 then
    raise exception 'invalid_review' using errcode = '22023';
  end if;
  if v_quote ~* v_spam or v_name ~* v_spam then
    raise exception 'links_not_allowed' using errcode = '22023';
  end if;

  -- destination, tool and locale are checked by the table's CHECK constraints
  insert into public.testimonials as t
    (user_id, name, destination, tool, rating, quote, locale, consent_given, consent_at, published)
  values
    (v_uid, v_name, p_destination, p_tool, p_rating, v_quote, nullif(p_locale, ''), true, now(), true)
  on conflict (user_id) where user_id is not null do update set
    name = excluded.name,
    destination = excluded.destination,
    tool = excluded.tool,
    rating = excluded.rating,
    quote = excluded.quote,
    locale = excluded.locale
  returning t.id into v_id;

  insert into public.testimonial_consents (testimonial_id, note, recorded_by)
  values (v_id, 'Mijoz sharhni saytdagi formada o‘zi yozdi va ismi bilan e’lon qilinishiga rozilik berdi.', v_uid)
  on conflict (testimonial_id) do update set recorded_at = now();

  return v_id;
end;
$$;
revoke all on function public.submit_my_testimonial(text, text, text, integer, text, text) from public, anon;
grant execute on function public.submit_my_testimonial(text, text, text, integer, text, text) to authenticated;
