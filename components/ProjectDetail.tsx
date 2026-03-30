import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, FolderKanban, CheckCircle2, Circle } from 'lucide-react';
import { Project, Task, Urgency } from '../types';

interface ProjectDetailProps {
  project: Project;
  tasks: Task[]; // All tasks, to filter by project
  onClose: () => void;
  onAddStep: (data: { title: string; scheduledDate: string; notes: string }) => void;
  onDeleteStep: (taskId: string) => void;
  onCompleteStep: (taskId: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  tasks,
  onClose,
  onAddStep,
  onDeleteStep,
  onCompleteStep,
}) => {
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDate, setNewStepDate] = useState('');
  const [newStepNotes, setNewStepNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const projectSteps = tasks
    .filter(t => t.projectId === project.id)
    .sort((a, b) => {
      if (!a.scheduledDate && !b.scheduledDate) return a.position - b.position;
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return a.scheduledDate.localeCompare(b.scheduledDate);
    });

  const completedSteps = projectSteps.filter(t => t.isCompleted);
  const pendingSteps = projectSteps.filter(t => !t.isCompleted);

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    onAddStep({
      title: newStepTitle.trim(),
      scheduledDate: newStepDate,
      notes: newStepNotes.trim(),
    });
    setNewStepTitle('');
    setNewStepDate('');
    setNewStepNotes('');
    setIsAdding(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sem data';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr < new Date().toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg h-[calc(100vh-32px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b" style={{ borderLeftColor: project.color, borderLeftWidth: 4 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${project.color}20` }}>
                <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{project.name}</h2>
                <p className="text-xs text-slate-500">
                  {pendingSteps.length} etapa{pendingSteps.length !== 1 ? 's' : ''} pendente{pendingSteps.length !== 1 ? 's' : ''}
                  {completedSteps.length > 0 && ` · ${completedSteps.length} concluída${completedSteps.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {pendingSteps.length === 0 && completedSteps.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhuma etapa ainda</p>
              <p className="text-xs">Adicione a primeira etapa do projeto abaixo</p>
            </div>
          )}

          {/* Pending Steps */}
          {pendingSteps.map(step => (
            <div
              key={step.id}
              className="group flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <button
                onClick={() => onCompleteStep(step.id)}
                className="mt-0.5 flex-shrink-0 text-slate-300 hover:text-green-500 transition-colors"
              >
                <Circle className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm">{step.title}</p>
                {step.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{step.notes}</p>}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className={`text-[11px] font-semibold ${isOverdue(step.scheduledDate) ? 'text-red-500' : 'text-slate-400'}`}>
                    {formatDate(step.scheduledDate)}
                    {isOverdue(step.scheduledDate) && ' · Atrasada'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Excluir etapa "${step.title}"?`)) onDeleteStep(step.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Completed Steps */}
          {completedSteps.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Concluídas</p>
              {completedSteps.map(step => (
                <div
                  key={step.id}
                  className="group flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl mb-2 opacity-70"
                >
                  <div className="mt-0.5 flex-shrink-0 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-500 text-sm line-through">{step.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span className="text-[11px] text-slate-400">{formatDate(step.scheduledDate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir etapa "${step.title}"?`)) onDeleteStep(step.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Step Form */}
        <div className="border-t p-6 bg-slate-50">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Adicionar Etapa
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome da etapa..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                autoFocus
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                    value={newStepDate}
                    onChange={(e) => setNewStepDate(e.target.value)}
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Descrição (opcional)..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                value={newStepNotes}
                onChange={(e) => setNewStepNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddStep}
                  disabled={!newStepTitle.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => { setIsAdding(false); setNewStepTitle(''); setNewStepDate(''); setNewStepNotes(''); }}
                  className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-sm rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
