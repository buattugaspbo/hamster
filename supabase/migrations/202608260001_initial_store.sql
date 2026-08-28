create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  birthday date,
  gender text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  district text not null,
  regency_code text not null,
  regency_name text not null,
  province_code text not null,
  province_name text not null,
  postal_code text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  kind text not null check (kind in ('animal', 'supply')),
  name text not null,
  category text not null,
  species text,
  breed text,
  sex text,
  age text,
  code text,
  temperament text,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'Tersedia',
  health text not null default 'Sehat',
  image text not null,
  description text not null default '',
  featured boolean not null default false,
  weight_grams integer,
  dimensions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  payment_token uuid not null default gen_random_uuid() unique,
  customer_name text not null,
  phone text not null,
  email text,
  type text not null check (type in ('reservation', 'order')),
  subtotal integer not null check (subtotal >= 0),
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  total integer not null check (total >= 0),
  payment_method text not null default 'qris',
  payment_status text not null default 'Menunggu',
  fulfillment_status text not null default 'Perlu dikonfirmasi',
  pickup_at timestamptz,
  notes text not null default '',
  shipping_address text,
  regency_code text,
  shipping_distance_km integer,
  expires_at timestamptz not null default (now() + interval '2 hours'),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);
create unique index if not exists addresses_one_primary_per_user_idx on public.addresses(user_id) where is_primary;
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists products_kind_status_idx on public.products(kind, status);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
drop trigger if exists addresses_touch_updated_at on public.addresses;
create trigger addresses_touch_updated_at before update on public.addresses
for each row execute function public.touch_updated_at();
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products
for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone, birthday, gender, updated_at) on public.profiles to authenticated;

drop policy if exists "addresses_own_or_admin" on public.addresses;
create policy "addresses_own_or_admin" on public.addresses
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
for select using (true);
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_own_or_admin_read" on public.orders;
create policy "orders_own_or_admin_read" on public.orders
for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders_admin_write" on public.orders;
create policy "orders_admin_write" on public.orders
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_own_or_admin_read" on public.order_items;
create policy "order_items_own_or_admin_read" on public.order_items
for select using (
  public.is_admin() or exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
);

create or replace function public.create_store_order(
  p_order_id text,
  p_user_id uuid,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_type text,
  p_pickup_at timestamptz,
  p_notes text,
  p_shipping_address text,
  p_regency_code text,
  p_shipping_distance_km integer,
  p_shipping_cost integer,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  created_order public.orders;
  computed_subtotal integer;
begin
  if p_customer_name = '' or p_phone = '' then
    raise exception 'Nama dan nomor WhatsApp wajib diisi';
  end if;
  if p_type not in ('reservation', 'order') then
    raise exception 'Tipe pesanan tidak valid';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Pesanan tidak memiliki item';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as requested(product_id text, quantity integer)
    left join public.products product on product.id = requested.product_id
    where product.id is null or requested.quantity is null or requested.quantity < 1
  ) then
    raise exception 'Salah satu item pesanan tidak valid';
  end if;

  perform 1
  from public.products product
  join jsonb_to_recordset(p_items) as requested(product_id text, quantity integer)
    on requested.product_id = product.id
  for update;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as requested(product_id text, quantity integer)
    join public.products product on product.id = requested.product_id
    where product.stock < requested.quantity
       or product.status in ('Direservasi', 'Terjual')
  ) then
    raise exception 'Stok salah satu item sudah tidak tersedia';
  end if;
  if p_type = 'reservation' and (
    jsonb_array_length(p_items) <> 1 or exists (
      select 1
      from jsonb_to_recordset(p_items) as requested(product_id text, quantity integer)
      join public.products product on product.id = requested.product_id
      where product.kind <> 'animal' or requested.quantity <> 1
    )
  ) then
    raise exception 'Reservasi hanya boleh berisi satu hewan';
  end if;

  select sum(product.price * requested.quantity)::integer
  into computed_subtotal
  from jsonb_to_recordset(p_items) as requested(product_id text, quantity integer)
  join public.products product on product.id = requested.product_id;

  insert into public.orders (
    id, user_id, customer_name, phone, email, type, subtotal, shipping_cost,
    total, pickup_at, notes, shipping_address, regency_code,
    shipping_distance_km
  ) values (
    p_order_id, p_user_id, p_customer_name, p_phone, nullif(p_email, ''), p_type,
    computed_subtotal, greatest(coalesce(p_shipping_cost, 0), 0),
    computed_subtotal + greatest(coalesce(p_shipping_cost, 0), 0), p_pickup_at,
    coalesce(p_notes, ''), nullif(p_shipping_address, ''), nullif(p_regency_code, ''),
    p_shipping_distance_km
  ) returning * into created_order;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
  select created_order.id, product.id, product.name, product.price, requested.quantity
  from jsonb_to_recordset(p_items) as requested(product_id text, quantity integer)
  join public.products product on product.id = requested.product_id;

  update public.products product
  set stock = product.stock - requested.quantity,
      status = case
        when product.kind = 'animal' then 'Direservasi'
        when product.stock - requested.quantity <= 0 then 'Stok habis'
        when product.stock - requested.quantity <= 5 then 'Stok menipis'
        else 'Tersedia'
      end
  from (
    select product_id, sum(quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id text, quantity integer)
    group by product_id
  ) requested
  where product.id = requested.product_id;

  return created_order;
end;
$$;

revoke all on function public.create_store_order(
  text, uuid, text, text, text, text, timestamptz, text, text, text, integer, integer, jsonb
) from public, anon, authenticated;
grant execute on function public.create_store_order(
  text, uuid, text, text, text, text, timestamptz, text, text, text, integer, integer, jsonb
) to service_role;

create or replace function public.update_store_order(
  p_order_id text,
  p_payment_status text,
  p_fulfillment_status text,
  p_pickup_at timestamptz,
  p_notes text
)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  current_order public.orders;
  changed_order public.orders;
begin
  select * into current_order from public.orders where id = p_order_id for update;
  if current_order.id is null then raise exception 'Pesanan tidak ditemukan'; end if;

  if p_fulfillment_status = 'Dibatalkan'
     and current_order.fulfillment_status not in ('Dibatalkan', 'Selesai') then
    update public.products product
    set stock = product.stock + item.quantity,
        status = case
          when product.kind = 'animal' then 'Tersedia'
          when product.stock + item.quantity <= 5 then 'Stok menipis'
          else 'Tersedia'
        end
    from public.order_items item
    where item.order_id = p_order_id and item.product_id = product.id;
  end if;

  update public.orders
  set payment_status = coalesce(p_payment_status, payment_status),
      fulfillment_status = coalesce(p_fulfillment_status, fulfillment_status),
      pickup_at = coalesce(p_pickup_at, pickup_at),
      notes = coalesce(p_notes, notes),
      paid_at = case when p_payment_status = 'Dibayar' and paid_at is null then now() else paid_at end
  where id = p_order_id
  returning * into changed_order;
  return changed_order;
end;
$$;

revoke all on function public.update_store_order(text, text, text, timestamptz, text)
from public, anon, authenticated;
grant execute on function public.update_store_order(text, text, text, timestamptz, text)
to service_role;

-- Setelah membuat akun pemilik toko, promosikan satu kali melalui SQL Editor:
-- update public.profiles set role = 'admin' where id = 'UUID_USER_PEMILIK';
