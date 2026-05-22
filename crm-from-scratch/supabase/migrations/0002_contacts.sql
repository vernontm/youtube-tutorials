-- Contacts: people the user is tracking (leads, customers, etc).
-- Single-tenant: every row scoped to auth.uid() via RLS.

create type contact_status as enum ('lead', 'customer', 'partner', 'other');

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text,
  email text,
  phone text,
  company text,
  job_title text,
  status contact_status not null default 'lead',
  source text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_user_id_idx on public.contacts (user_id);
create index contacts_user_created_idx on public.contacts (user_id, created_at desc);

alter table public.contacts enable row level security;

create policy "Contacts: owner can select"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "Contacts: owner can insert"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "Contacts: owner can update"
  on public.contacts for update
  using (auth.uid() = user_id);

create policy "Contacts: owner can delete"
  on public.contacts for delete
  using (auth.uid() = user_id);

create trigger contacts_touch_updated_at
  before update on public.contacts
  for each row execute function public.touch_updated_at();

-- Per-contact running notes (timeline).
create table public.contact_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index contact_notes_contact_idx on public.contact_notes (contact_id, created_at desc);

alter table public.contact_notes enable row level security;

create policy "Notes: owner can select"
  on public.contact_notes for select
  using (auth.uid() = user_id);

create policy "Notes: owner can insert"
  on public.contact_notes for insert
  with check (auth.uid() = user_id);

create policy "Notes: owner can delete"
  on public.contact_notes for delete
  using (auth.uid() = user_id);
