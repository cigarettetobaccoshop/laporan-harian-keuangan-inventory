-- Production hardening for the standalone Laporan Harian application.
-- Run ONLY against the NEW isolated Supabase project for this application.
-- Never run this migration against the R2 NUSANTARA production database.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'operator' check (role in ('admin','operator')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
alter table public.profiles enable row level security;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid(); $$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists inventory_items_select_authenticated on public.inventory_items;
create policy inventory_items_select_authenticated on public.inventory_items
for select to authenticated using (true);

drop policy if exists inventory_items_insert_admin on public.inventory_items;
create policy inventory_items_insert_admin on public.inventory_items
for insert to authenticated with check (public.current_user_role() = 'admin');

drop policy if exists inventory_items_update_admin on public.inventory_items;
create policy inventory_items_update_admin on public.inventory_items
for update to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists inventory_items_delete_admin on public.inventory_items;
create policy inventory_items_delete_admin on public.inventory_items
for delete to authenticated using (public.current_user_role() = 'admin');

drop policy if exists opening_select_authenticated on public.inventory_opening_balances;
create policy opening_select_authenticated on public.inventory_opening_balances
for select to authenticated using (true);

drop policy if exists opening_insert_admin on public.inventory_opening_balances;
create policy opening_insert_admin on public.inventory_opening_balances
for insert to authenticated with check (public.current_user_role() = 'admin');

drop policy if exists opening_update_admin on public.inventory_opening_balances;
create policy opening_update_admin on public.inventory_opening_balances
for update to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists opening_delete_admin on public.inventory_opening_balances;
create policy opening_delete_admin on public.inventory_opening_balances
for delete to authenticated using (public.current_user_role() = 'admin');

drop policy if exists cash_select_authenticated on public.cash_transactions;
create policy cash_select_authenticated on public.cash_transactions
for select to authenticated using (true);

drop policy if exists cash_insert_authenticated on public.cash_transactions;
create policy cash_insert_authenticated on public.cash_transactions
for insert to authenticated with check (created_by = auth.uid());

drop policy if exists cash_update_own_or_admin on public.cash_transactions;
create policy cash_update_own_or_admin on public.cash_transactions
for update to authenticated
using (created_by = auth.uid() or public.current_user_role() = 'admin')
with check (created_by = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists cash_delete_admin on public.cash_transactions;
create policy cash_delete_admin on public.cash_transactions
for delete to authenticated using (public.current_user_role() = 'admin');

drop policy if exists movement_select_authenticated on public.inventory_movements;
create policy movement_select_authenticated on public.inventory_movements
for select to authenticated using (true);

drop policy if exists movement_insert_authenticated on public.inventory_movements;
create policy movement_insert_authenticated on public.inventory_movements
for insert to authenticated with check (created_by = auth.uid());

drop policy if exists movement_update_own_or_admin on public.inventory_movements;
create policy movement_update_own_or_admin on public.inventory_movements
for update to authenticated
using (created_by = auth.uid() or public.current_user_role() = 'admin')
with check (created_by = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists movement_delete_admin on public.inventory_movements;
create policy movement_delete_admin on public.inventory_movements
for delete to authenticated using (public.current_user_role() = 'admin');

-- Audit log: read-only for admins; writes are performed by SECURITY DEFINER triggers.
drop policy if exists audit_select_admin on public.audit_logs;
create policy audit_select_admin on public.audit_logs
for select to authenticated
using (public.current_user_role() = 'admin');

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  entity_id_value uuid;
  before_value jsonb;
  after_value jsonb;
begin
  if TG_OP = 'DELETE' then
    entity_id_value := OLD.id;
    before_value := to_jsonb(OLD);
  elsif TG_OP = 'UPDATE' then
    entity_id_value := NEW.id;
    before_value := to_jsonb(OLD);
    after_value := to_jsonb(NEW);
  else
    entity_id_value := NEW.id;
    after_value := to_jsonb(NEW);
  end if;

  insert into public.audit_logs(
    actor_id, action, entity, entity_id, summary, before_data, after_data
  )
  values (
    auth.uid(), lower(TG_OP), TG_TABLE_NAME, entity_id_value,
    TG_TABLE_NAME || ' ' || lower(TG_OP), before_value, after_value
  );

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists audit_inventory_items on public.inventory_items;
create trigger audit_inventory_items
after insert or update or delete on public.inventory_items
for each row execute function public.write_audit_log();

drop trigger if exists audit_inventory_opening on public.inventory_opening_balances;
create trigger audit_inventory_opening
after insert or update or delete on public.inventory_opening_balances
for each row execute function public.write_audit_log();

drop trigger if exists audit_cash_transactions on public.cash_transactions;
create trigger audit_cash_transactions
after insert or update or delete on public.cash_transactions
for each row execute function public.write_audit_log();

drop trigger if exists audit_inventory_movements on public.inventory_movements;
create trigger audit_inventory_movements
after insert or update or delete on public.inventory_movements
for each row execute function public.write_audit_log();

revoke all on public.audit_logs from authenticated;
grant select on public.audit_logs to authenticated;

-- Reject inventory movements that would make the stock negative.
create or replace function public.prevent_negative_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  opening_qty numeric := 0;
  incoming_qty numeric := 0;
  outgoing_qty numeric := 0;
begin
  select coalesce(sum(opening_qty),0)
    into opening_qty
    from public.inventory_opening_balances
   where item_id = new.item_id
     and period_start = date_trunc('month', new.movement_date)::date;

  select
    coalesce(sum(case when type = 'in' then qty else 0 end),0),
    coalesce(sum(case when type = 'out' then qty else 0 end),0)
    into incoming_qty, outgoing_qty
    from public.inventory_movements
   where item_id = new.item_id
     and movement_date <= new.movement_date
     and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if new.type = 'in' then
    incoming_qty := incoming_qty + new.qty;
  else
    outgoing_qty := outgoing_qty + new.qty;
  end if;

  if opening_qty + incoming_qty - outgoing_qty < 0 then
    raise exception 'Stok tidak mencukupi untuk transaksi ini.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_negative_stock on public.inventory_movements;
create trigger prevent_negative_stock
before insert or update on public.inventory_movements
for each row execute function public.prevent_negative_stock();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- After creating the first account, promote it explicitly:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
