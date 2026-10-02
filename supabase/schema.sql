create extension if not exists pgcrypto;

-- Master barang. Stok production dihitung dari saldo awal + movement, bukan diedit sembarang.
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  unit text not null default 'pcs',
  min_stock numeric(18,3) not null default 0 check(min_stock >= 0),
  cost numeric(18,2) not null default 0 check(cost >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Saldo awal per periode, sesuai kolom "Barang Sisa Bulan ..." pada buku referensi.
create table if not exists public.inventory_opening_balances (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  opening_qty numeric(18,3) not null default 0 check(opening_qty >= 0),
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique(period_start, item_id)
);

-- Buku kas: satu tanggal dapat memiliki banyak baris seperti "Masuk/Pemasukan" dan "Keluar/Pengeluaran".
create table if not exists public.cash_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_date date not null,
  type text not null check(type in ('in','out')),
  category text not null,
  description text not null,
  amount numeric(18,2) not null check(amount >= 0),
  party text,
  payment_method text,
  reference_no text,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Pergerakan barang: masuk dari gudang/supplier atau keluar ke toko/pelanggan.
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  movement_date date not null,
  item_id uuid not null references public.inventory_items(id),
  type text not null check(type in ('in','out')),
  qty numeric(18,3) not null check(qty > 0),
  unit_cost numeric(18,2) check(unit_cost is null or unit_cost >= 0),
  party text,
  destination text,
  reference_no text,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  summary text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists inventory_opening_period_idx on public.inventory_opening_balances(period_start desc);
create index if not exists cash_transactions_date_idx on public.cash_transactions(transaction_date desc);
create index if not exists inventory_movements_date_idx on public.inventory_movements(movement_date desc);
create index if not exists inventory_movements_item_idx on public.inventory_movements(item_id);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

alter table public.inventory_items enable row level security;
alter table public.inventory_opening_balances enable row level security;
alter table public.cash_transactions enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.audit_logs enable row level security;

-- Jangan membuat policy publik. Policy production harus mengikuti role admin/operator setelah Auth diaktifkan.
-- Rumus aplikasi/report:
-- saldo kas = SUM(type=in) - SUM(type=out)
-- stok akhir = saldo awal + SUM(movement=in) - SUM(movement=out)
-- nilai persediaan = stok akhir x harga modal
