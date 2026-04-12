-- 001_admin_control.sql
-- Admin access table + helper for RLS.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "admin_users: read own row"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- Helper for RLS (SECURITY DEFINER so policies can rely on it)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

