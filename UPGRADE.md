# Upgrade V2 — Centro de Comando

Esta versão remodela o planner em um sistema completo de gestão de demandas (estilo Trello + Asana).

## O que mudou

### Novas Visões
- **Hoje** (padrão ao abrir): centro de comando com atrasadas, foco do dia, em andamento, vitórias e visão lateral por negócio
- **Painel Geral**: dashboard com KPIs, carga dos próximos 7 dias, produtividade semanal, progresso por projeto
- **Semana**: kanban semanal melhorado (hoje destacado, quick add por dia)
- **Calendário**: visão mensal (mantida)
- **Board do Projeto** (ao clicar em projeto): Kanban Trello-style com colunas Backlog → A Fazer → Em Andamento → Bloqueada → Concluída

### Novos Campos em Tarefa
- `status`: backlog / todo / doing / blocked / done (separado de "concluída")
- `dueDate`: prazo de entrega (separado de "vou fazer em")
- `checklist`: subtarefas com progresso visual
- `recurrence`: diária, dias úteis, semanal, mensal

### Novos Recursos
- **Quick Add** (Cmd/Ctrl+K ou botão FAB): criação ultrarrápida
  - Atalhos no texto: `!p0` urgência, `/hoje` data, `/amanha` data
- **Atrasadas em destaque** vermelho em tudo
- **Indicador de subtarefas** com barra de progresso nos cards
- **Tarefas recorrentes**: ao concluir uma, a próxima é criada automaticamente
- **Contadores por projeto** na sidebar (pendentes + atrasadas!)
- **Cycle de status** no card (clique no círculo: todo → doing → done)

## Como aplicar a migração no Supabase

Execute o SQL em `migration-v2.sql` no Supabase SQL Editor:

```sql
alter table tasks add column if not exists status text default 'todo';
alter table tasks add column if not exists due_date text;
alter table tasks add column if not exists checklist jsonb default '[]'::jsonb;
alter table tasks add column if not exists recurrence text default 'none';
-- (ver arquivo completo)
```

**Importante**: a aplicação tem fallback gracioso. Se você não rodar a migração, as colunas novas serão ignoradas e tudo continua funcionando — mas as novas funcionalidades só persistem após a migração.

## Fluxo recomendado

1. **Crie um Projeto para cada negócio** (Áurea, Tráfego Pago, Consultoria IA…) usando o + na sidebar
2. **Use o Quick Add (Cmd+K)** para jogar tarefas no sistema rapidamente. O modal pesado fica para detalhes.
3. **Comece o dia em "Hoje"** — é o seu painel de comando
4. **Use o Board do Projeto** (clique no projeto) para gerenciar fluxo Trello: arraste cards entre colunas
5. **Para demandas grandes**: abra a tarefa e quebre em subtarefas (checklist)
6. **Para demandas recorrentes**: marque recorrência → ao concluir, uma nova é criada

## Atalhos
- `Cmd/Ctrl + K`: Quick Add
- `Esc`: Fecha modais
- `Enter`: Confirma em formulários rápidos
