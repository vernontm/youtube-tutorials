-- Tasks / activities: calls, emails, meetings, follow-ups.
-- Optionally linked to a contact and/or a deal.

create type task_type as enum ('call', 'email', 'meeting', 'follow_up', 'other');
create type task_priority as enum ('low', 'normal', 'high');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  title text not null,
  description text,
  type task_type not null default 'follow_up',
  priority task_priority not null default 'normal',
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_due_idx on public.tasks (user_id, completed_at, due_date);
create index tasks_contact_idx on public.tasks (contact_id);
create index tasks_deal_idx on public.tasks (deal_id);

alter table public.tasks enable row level security;

create policy "Tasks: owner can select"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Tasks: owner can insert"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Tasks: owner can update"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Tasks: owner can delete"
  on public.tasks for delete
  using (auth.uid() = user_id);

create trigger tasks_touch_updated_at
  before update on public.tasks
  for each row execute function public.touch_updated_at();
