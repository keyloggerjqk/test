-- Run once in Supabase SQL Editor.
-- Creates the public image bucket and lets active managers create menu items.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "manager can upload menu images" on storage.objects;
create policy "manager can upload menu images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'menu-images'
    and public.is_active_staff(array['manager'])
  );

drop policy if exists "manager can delete menu images" on storage.objects;
create policy "manager can delete menu images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'menu-images'
    and public.is_active_staff(array['manager'])
  );

drop policy if exists "manager can create menu items" on public."menuItems";
create policy "manager can create menu items"
  on public."menuItems" for insert to authenticated
  with check (public.is_active_staff(array['manager']));
