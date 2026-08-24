-- Add this SQL function to your Supabase database for atomic stock decrement
-- This prevents race conditions when multiple users buy the same combo simultaneously

create or replace function public.decrement_combo_stock(combo_id uuid, quantity integer)
returns void as $$
begin
  update combos 
  set stock = stock - quantity 
  where id = combo_id 
  and stock >= quantity;
  
  if not found then
    raise exception 'Insufficient stock or combo not found';
  end if;
end;
$$ language plpgsql security definer;
