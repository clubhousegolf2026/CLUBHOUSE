insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('paquetes', 'paquetes', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "staff sube fotos de paquetes" on storage.objects;
drop policy if exists "staff edita fotos de paquetes" on storage.objects;
drop policy if exists "staff borra fotos de paquetes" on storage.objects;

create policy "staff sube fotos de paquetes" on storage.objects
  for insert to authenticated with check (bucket_id = 'paquetes' and public.es_staff());
create policy "staff edita fotos de paquetes" on storage.objects
  for update to authenticated using (bucket_id = 'paquetes' and public.es_staff());
create policy "staff borra fotos de paquetes" on storage.objects
  for delete to authenticated using (bucket_id = 'paquetes' and public.es_staff());
