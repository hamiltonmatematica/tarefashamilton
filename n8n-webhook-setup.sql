-- Executar no SQL Editor do Supabase para criar o gatilho (webhook) de nova tarefa
-- Substitua 'https://SEU-N8N.com/webhook/nova-tarefa' pelo seu Webhook URL do n8n real.

-- 1. Habilitar a extensão pg_net se ainda não estiver (comum no Supabase para requisições HTTP)
create extension if not exists pg_net;

-- 2. Criar a função que vai disparar o Webhook pro n8n
create or replace function notify_n8n_new_task()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://SEU-N8N.com/webhook/nova-tarefa', -- Mude aqui
    body := json_build_object(
      'id', new.id,
      'title', new.title,
      'description', new.description,
      'urgency', new.urgency,
      'scheduled_date', new.scheduled_date,
      'user_id', new.user_id
    )::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$ language plpgsql;

-- 3. Criar o Trigger na tabela tasks para chamar a função sempre que houver INSERT
drop trigger if exists on_new_task_notify_n8n on tasks;
create trigger on_new_task_notify_n8n
  after insert on tasks
  for each row
  execute function notify_n8n_new_task();
