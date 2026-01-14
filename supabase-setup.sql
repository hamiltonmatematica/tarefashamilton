# Configuração SQL do Supabase

Execute este SQL no Supabase SQL Editor:

```sql
-- Tabela de tarefas
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  title text not null,
  description text default '',
  urgency text not null,
  category text,
  day_of_week text default 'inbox',
  scheduled_date text,
  position integer default 0,
  notes text default '',
  is_completed boolean default false,
  completed_at timestamptz,
  deleted_at timestamptz,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de categorias
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  color text not null,
  created_at timestamptz default now()
);

-- Índices para performance
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_scheduled_date_idx on tasks(scheduled_date);
create index if not exists tasks_is_completed_idx on tasks(is_completed);
create index if not exists categories_user_id_idx on categories(user_id);

-- Habilitar RLS (Row Level Security)
alter table tasks enable row level security;
alter table categories enable row level security;

-- Políticas para tasks
drop policy if exists "Users can view own tasks" on tasks;
create policy "Users can view own tasks"
  on tasks for select
  using (true); -- Simplificado: permite acesso público, filtraremos no código

drop policy if exists "Users can insert own tasks" on tasks;
create policy "Users can insert own tasks"
  on tasks for insert
  with check (true);

drop policy if exists "Users can update own tasks" on tasks;
create policy "Users can update own tasks"
  on tasks for update
  using (true);

drop policy if exists "Users can delete own tasks" on tasks;
create policy "Users can delete own tasks"
  on tasks for delete
  using (true);

-- Políticas para categories
drop policy if exists "Users can view own categories" on categories;
create policy "Users can view own categories"
  on categories for select
  using (true);

drop policy if exists "Users can insert own categories" on categories;
create policy "Users can insert own categories"
  on categories for insert
  with check (true);

drop policy if exists "Users can update own categories" on categories;
create policy "Users can update own categories"
  on categories for update
  using (true);

drop policy if exists "Users can delete own categories" on categories;
create policy "Users can delete own categories"
  on categories for delete
  using (true);

-- Função para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at em tasks
drop trigger if exists update_tasks_updated_at on tasks;
create trigger update_tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at_column();
```

## Após executar o SQL:

1. Copie a URL do projeto (Settings > API > Project URL)
2. Copie a `anon` key (Settings > API > Project API keys > anon public)
3. Cole no arquivo `.env.local`
