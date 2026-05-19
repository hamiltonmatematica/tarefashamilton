import React, { useMemo, useState } from 'react';
import { X, Search, Inbox } from 'lucide-react';
import { Task, Category, Project, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskListModalProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  groupByProject?: boolean;
  onClose: () => void;
  onTaskClick: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onChangeStatus?: (id: string, status: TaskStatus) => void;
}

const TaskListModal: React.FC<TaskListModalProps> = ({
  title, subtitle, accentColor = '#3b82f6',
  tasks, categories, projects, groupByProject,
  onClose, onTaskClick, onCompleteTask, onChangeStatus,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const grouped = useMemo(() => {
    if (!groupByProject) return null;
    const map = new Map<string | 'none', Task[]>();
    filtered.forEach(t => {
      const key = t.projectId || 'none';
      const list = map.get(key) || [];
      list.push(t);
      map.set(key, list);
    });
    return map;
  }, [filtered, groupByProject]);

  const renderTask = (task: Task) => (
    <TaskCard
      key={task.id}
      task={task}
      category={categories.find(c => c.id === task.category)}
      project={task.projectId ? projects.find(p => p.id === task.projectId) : undefined}
      onClick={() => onTaskClick(task)}
      onComplete={() => onCompleteTask(task.id)}
      onChangeStatus={onChangeStatus ? (s) => onChangeStatus(task.id, s) : undefined}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div
          className="p-5 border-b flex items-center justify-between gap-4 flex-shrink-0"
          style={{ borderTop: `4px solid ${accentColor}` }}
        >
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle || `${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {tasks.length > 5 && (
          <div className="p-4 border-b bg-slate-50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar nesta lista..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Inbox className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">
                {tasks.length === 0 ? 'Nenhuma tarefa nesta condição' : 'Nenhum resultado para a busca'}
              </p>
            </div>
          ) : groupByProject && grouped ? (
            <div className="space-y-6">
              {Array.from(grouped.entries()).map(([projId, list]) => {
                const proj = projId === 'none' ? null : projects.find(p => p.id === projId);
                const groupName = proj ? proj.name : 'Sem projeto';
                const groupColor = proj?.color || '#94a3b8';
                return (
                  <div key={projId}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: groupColor }} />
                      <h3 className="text-sm font-bold text-slate-700">{groupName}</h3>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full">
                        {list.length}
                      </span>
                    </div>
                    <div className="space-y-2">{list.map(renderTask)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(renderTask)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskListModal;
