-- Create storage bucket for company logos
-- Run this in Supabase SQL Editor or Storage UI

-- Create the bucket
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true);

-- Set up RLS policies for logos bucket
create policy "Anyone can view logos"
on storage.objects for select
using ( bucket_id = 'logos' );

create policy "Pyme users can upload their own logo"
on storage.objects for insert
with check (
  bucket_id = 'logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Pyme users can update their own logo"
on storage.objects for update
using (
  bucket_id = 'logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Pyme users can delete their own logo"
on storage.objects for delete
using (
  bucket_id = 'logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);
