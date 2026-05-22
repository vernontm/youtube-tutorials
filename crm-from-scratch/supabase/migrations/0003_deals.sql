-- Deals: opportunities moving through a sales pipeline.
-- Stages are hardcoded as an enum for the MVP; custom stages can come later.

create type deal_stage as enum (
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  description text,
  value numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  stage deal_stage not null default 'lead',
  expected_close_date date,
  -- position within the stage column for ordering in the Kanban
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_user_stage_idx on public.deals (user_id, stage, position);
create index deals_contact_idx on public.deals (contact_id);

alter table public.deals enable row level security;

create policy "Deals: owner can select"
  on public.deals for select
  using (auth.uid() = user_id);

create policy "Deals: owner can insert"
  on public.deals for insert
  with check (auth.uid() = user_id);

create policy "Deals: owner can update"
  on public.deals for update
  using (auth.uid() = user_id);

create policy "Deals: owner can delete"
  on public.deals for delete
  using (auth.uid() = user_id);

create trigger deals_touch_updated_at
  before update on public.deals
  for each row execute function public.touch_updated_at();
