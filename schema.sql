-- Create custom types
create type user_role as enum ('pyme', 'consumer', 'admin');
create type order_status as enum ('received', 'preparing', 'ready', 'delivered', 'cancelled');

-- Create profiles table (public profile info)
create table profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  name text,
  role user_role default 'consumer',
  avatar_url text,
  -- Pyme business profile fields
  company_name text,
  company_logo_url text,
  address text,
  city text,
  phone text,
  mercadopago_access_token text,
  profile_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'consumer'), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create combos table
create table combos (
  id uuid default gen_random_uuid() primary key,
  pyme_id uuid references profiles(id) not null,
  title text not null,
  description text,
  price decimal(10,2) not null,
  stock integer default 0,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table combos enable row level security;

-- Combos policies
create policy "Combos are viewable by everyone."
  on combos for select
  using ( true );

create policy "Pymes can insert their own combos."
  on combos for insert
  with check ( auth.uid() = pyme_id ); -- Need to verify role? Ideally yes, but kept simple for now

create policy "Pymes can update their own combos."
  on combos for update
  using ( auth.uid() = pyme_id );

create policy "Pymes can delete their own combos."
  on combos for delete
  using ( auth.uid() = pyme_id );

-- Create orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  consumer_id uuid references profiles(id) not null,
  combo_id uuid references combos(id) not null,
  status order_status default 'received',
  total decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table orders enable row level security;

-- Orders policies
create policy "Consumers can view their own orders."
  on orders for select
  using ( auth.uid() = consumer_id );

create policy "Pymes can view orders for their combos."
  on orders for select
  using ( 
    exists (
      select 1 from combos 
      where combos.id = orders.combo_id 
      and combos.pyme_id = auth.uid()
    ) 
  );

create policy "Consumers can insert (place) orders."
  on orders for insert
  with check ( auth.uid() = consumer_id );

create policy "Pymes can update status of their orders."
  on orders for update
  using (
    exists (
      select 1 from combos 
      where combos.id = orders.combo_id 
      and combos.pyme_id = auth.uid()
    )
  );
