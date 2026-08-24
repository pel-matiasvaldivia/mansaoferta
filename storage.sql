-- Create a storage bucket for combo images
insert into storage.buckets (id, name, public)
values ('combos', 'combos', true)
on conflict (id) do nothing;

-- Policies for the 'combos' bucket
create policy "Combos images are viewable by everyone"
  on storage.objects for select
  using ( bucket_id = 'combos' );

create policy "Pymes can upload combo images"
  on storage.objects for insert
  with check (
    bucket_id = 'combos' 
    and auth.role() = 'authenticated'
  );

create policy "Pymes can update their own combo images"
  on storage.objects for update
  using (
    bucket_id = 'combos' 
    and auth.uid() = owner
  );

create policy "Pymes can delete their own combo images"
  on storage.objects for delete
  using (
     bucket_id = 'combos' 
     and auth.uid() = owner
  );
