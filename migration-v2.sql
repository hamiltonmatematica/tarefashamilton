-- Migração V2: Adiciona status, checklist, dueDate e recorrência
-- Execute este SQL no Supabase SQL Editor

-- 1. Status (Kanban tipo Trello: backlog/todo/doing/blocked/done)
alter table tasks add column if not exists status text default 'todo';

-- 2. Data de prazo (separada da data agendada de execução)
alter table tasks add column if not exists due_date text;

-- 3. Checklist (subtarefas) como JSON
alter table tasks add column if not exists checklist jsonb default '[]'::jsonb;

-- 4. Recorrência
alter table tasks add column if not exists recurrence text default 'none';

-- 5. Migra tasks existentes: as concluídas viram 'done', as outras 'todo'
update tasks set status = case
  when is_completed = true then 'done'
  else 'todo'
end
where status is null or status = 'todo';

-- 6. Índices
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_due_date_idx on tasks(due_date);
