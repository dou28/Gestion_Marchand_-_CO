create type public.user_role as enum ('owner','admin','member');

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.company_sheets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sheet_name text not null,
  drive_file_id text not null,
  range text default 'A:Z',
  created_at timestamptz not null default now()
);

create table if not exists public.sheet_configs (
  sheet_id uuid primary key references public.company_sheets(id) on delete cascade,
  version int not null default 1,
  config jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.sheet_changes (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.company_sheets(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  payload jsonb not null,
  status text not null default 'pending',
  error text,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_sheets enable row level security;
alter table public.sheet_configs enable row level security;
alter table public.sheet_changes enable row level security;

create policy companies_select on public.companies
  for select using (exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = auth.uid()
));

create policy company_members_self on public.company_members
  for select using (
    user_id = auth.uid() or exists (
      select 1 from public.company_members m
      where m.company_id = company_members.company_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
));

create policy company_sheets_select on public.company_sheets
  for select using (exists (
    select 1 from public.company_members m
    where m.company_id = company_sheets.company_id and m.user_id = auth.uid()
));

create policy sheet_configs_select on public.sheet_configs
  for select using (exists (
    select 1 from public.company_sheets s
    join public.company_members m on m.company_id = s.company_id
    where s.id = sheet_configs.sheet_id and m.user_id = auth.uid()
));

create policy sheet_configs_write_admin on public.sheet_configs
  for all using (exists (
    select 1 from public.company_sheets s
    join public.company_members m on m.company_id = s.company_id
    where s.id = sheet_configs.sheet_id and m.user_id = auth.uid() and m.role in ('owner','admin')
  )) with check (exists (
    select 1 from public.company_sheets s
    join public.company_members m on m.company_id = s.company_id
    where s.id = sheet_configs.sheet_id and m.user_id = auth.uid() and m.role in ('owner','admin')
  ));

create policy sheet_changes_member_read on public.sheet_changes
  for select using (exists (
    select 1 from public.company_members m
    where m.company_id = sheet_changes.company_id and m.user_id = auth.uid()
));

create policy sheet_changes_member_insert on public.sheet_changes
  for insert with check (exists (
    select 1 from public.company_members m
    where m.company_id = sheet_changes.company_id and m.user_id = auth.uid()
));
