-- SQL para adicionar suporte a Projetos no Hamilton Planner

-- 1. Criar tabela de projetos
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  color text not null default '#3b82f6',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Adicionar project_id às tasks para vincular etapas
alter table tasks add column if not exists project_id uuid references projects(id) on delete set null;

-- 3. Habilitar RLS (Row Level Security) para projetos
alter table projects enable row level security;

-- 4. Políticas de acesso para projetos (apenas o dono pode acessar)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own projects') then
    create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own projects') then
    create policy "Users can insert own projects" on projects for insert with check (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Users can update own projects') then
    create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Users can delete own projects') then
    create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 5. Trigger para updated_at em projetos
drop trigger if exists update_projects_updated_at on projects;
create trigger update_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at_column();

-- 6. Índices para performance
create index if not exists projects_user_id_idx on projects(user_id);
create index if not exists tasks_project_id_idx on tasks(project_id);
