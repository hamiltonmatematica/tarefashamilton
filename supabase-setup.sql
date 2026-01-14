# Configuração SQL do Supabase - Atualizado com Email Auth

Execute este SQL no Supabase SQL Editor para atualizar o projeto:

```sql
-- IMPORTANTE: Primeiro configure no Dashboard do Supabase:
-- Settings > Authentication > Email Auth > DESABILITAR "Confirm email"
-- Isso permite login imediato sem verificação de email

-- Tabela de tarefas (já existe, mas garantindo estrutura)
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
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

-- Políticas para tasks - apenas o dono pode acessar
drop policy if exists "Users can view own tasks" on tasks;
create policy "Users can view own tasks"
  on tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tasks" on tasks;
create policy "Users can insert own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on tasks;
create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own tasks" on tasks;
create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Políticas para categories - apenas o dono pode acessar
drop policy if exists "Users can view own categories" on categories;
create policy "Users can view own categories"
  on categories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own categories" on categories;
create policy "Users can insert own categories"
  on categories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own categories" on categories;
create policy "Users can update own categories"
  on categories for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own categories" on categories;
create policy "Users can delete own categories"
  on categories for delete
  using (auth.uid() = user_id);

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

## ⚙️ Configuração no Dashboard Supabase

**IMPORTANTE:** Vá em **Settings → Authentication → Email** e:
1. ✅ Ative **Enable Email Provider**
2. ❌ **DESABILITE** "Confirm email" (permite login sem verificar email)
3. ❌ **DESABILITE** "Secure email change" (opcional)

Isso permite que usuários façam login imediatamente após cadastro!
