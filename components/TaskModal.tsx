
import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, FileText, File, Plus, Calendar, Save, Edit3, Eye, Paperclip, Check } from 'lucide-react';
import { Task, Category, Urgency, DayOfWeek, TaskAttachment } from '../types';
import { URGENCY_CONFIG } from '../constants';

interface TaskModalProps {
  task: Task | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

type ViewMode = 'edit' | 'work';

const TaskModal: React.FC<TaskModalProps> = ({ task, categories, onClose, onSave, onDelete }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [urgency, setUrgency] = useState<Urgency>(task?.urgency || Urgency.MEDIUM);
  const [category, setCategory] = useState(task?.category || (categories.length > 0 ? categories[0].id : ''));
  const [scheduledDate, setScheduledDate] = useState<string>(task?.scheduledDate || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [attachments, setAttachments] = useState<TaskAttachment[]>(task?.attachments || []);
  const [workNotes, setWorkNotes] = useState(''); // Notes added in work mode
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save work notes with debounce
  useEffect(() => {
    if (viewMode === 'work' && workNotes && task) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save (2 seconds after stop typing)
      autoSaveTimeoutRef.current = setTimeout(() => {
        setIsSaving(true);
        const finalNotes = notes ? `${notes}\n\n---\n${workNotes}` : workNotes;

        onSave({
          title,
          description,
          urgency,
          category,
          dayOfWeek: scheduledDate ? 'monday' : 'inbox',
          scheduledDate: scheduledDate || undefined,
          notes: finalNotes,
          attachments
        });

        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 1000);
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [workNotes, viewMode]);

  const handleSave = () => {
    if (!title.trim()) return;

    // Append work notes to main notes
    const finalNotes = workNotes ? (notes ? `${notes}\n\n---\n${workNotes}` : workNotes) : notes;

    onSave({
      title,
      description,
      urgency,
      category,
      dayOfWeek: scheduledDate ? 'monday' : 'inbox',
      scheduledDate: scheduledDate || undefined,
      notes: finalNotes,
      attachments
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newAttachment: TaskAttachment = {
        id: crypto.randomUUID(),
        url: reader.result as string,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'other',
        size: file.size
      };
      setAttachments(prev => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Render Edit Mode
  if (viewMode === 'edit') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          {/* Left: Main Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 border-b md:border-b-0 md:border-r">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('edit')}
                  className="flex items-center px-3 py-1.5 rounded-md bg-white text-slate-900 font-medium text-sm shadow-sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => setViewMode('work')}
                  className="flex items-center px-3 py-1.5 rounded-md text-slate-600 font-medium text-sm hover:text-slate-900"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Trabalhar
                </button>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Título da tarefa..."
                className="text-2xl font-bold w-full outline-none text-slate-800 placeholder:text-slate-300"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Notas Detalhadas</h4>
              <textarea
                placeholder="Escreva briefings, ideias, checklists..."
                className="w-full h-[200px] bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none text-slate-700 leading-relaxed resize-none focus:ring-2 focus:ring-blue-500/20"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Anexos</h4>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" /> Anexar Arquivo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  multiple
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                {attachments.map((att) => (
                  <div key={att.id} className="relative group">
                    {att.type === 'image' ? (
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={att.url} className="w-full h-full object-cover" alt={att.name} />
                        <button
                          onClick={() => removeAttachment(att.id)}
                          className="absolute top-1 right-1 bg-white/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border-2 border-slate-200 flex flex-col items-center justify-center p-3 bg-slate-50">
                        <FileText className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-[10px] font-medium text-slate-600 text-center line-clamp-2">{att.name}</span>
                        <button
                          onClick={() => removeAttachment(att.id)}
                          className="absolute top-1 right-1 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                >
                  <Paperclip className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Metadata */}
          <div className="w-full md:w-80 bg-slate-50 overflow-y-auto flex flex-col p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-slate-800">Detalhes</span>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Urgência</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setUrgency(key as Urgency)}
                      className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${urgency === key ? `${config.border} ${config.bg} shadow-sm` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${config.color} mr-2`} />
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agendar Data</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                {!scheduledDate && (
                  <p className="mt-1 text-[10px] text-blue-600 font-medium italic">Ficará na Caixa de Entrada se vazio.</p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição Curta</h4>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none h-20 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="O que precisa ser feito..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col space-y-3">
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Salvar Alterações
              </button>

              {task && (
                <button
                  onClick={() => { if (confirm('Excluir permanentemente?')) onDelete(task.id); onClose(); }}
                  className="w-full flex items-center justify-center py-3 text-red-500 hover:bg-red-50 font-bold text-sm rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Tarefa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Work Mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('edit')}
                className="flex items-center px-3 py-1.5 rounded-md text-slate-600 font-medium text-sm hover:text-slate-900"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => setViewMode('work')}
                className="flex items-center px-3 py-1.5 rounded-md bg-white text-slate-900 font-medium text-sm shadow-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Trabalhar
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{title || 'Sem título'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Description */}
            {description && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-slate-700">{description}</p>
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Anexos ({attachments.length})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {attachments.map((att) => (
                    <div key={att.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden group relative">
                      {att.type === 'image' ? (
                        <>
                          <img src={att.url} className="w-full aspect-video object-cover" alt={att.name} />
                          <a
                            href={att.url}
                            download={att.name}
                            className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Baixar
                          </a>
                        </>
                      ) : (
                        <div className="aspect-video flex flex-col items-center justify-center bg-slate-50 p-4">
                          <FileText className="w-12 h-12 text-red-500 mb-2" />
                          <a
                            href={att.url}
                            download={att.name}
                            className="text-xs font-medium text-blue-600 hover:underline text-center"
                          >
                            {att.name}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes (Read-only) */}
            {notes && (
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-4">Notas do Projeto</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 whitespace-pre-wrap text-sm text-slate-700">
                  {notes}
                </div>
              </div>
            )}

            {/* Work Notes (Incremental) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700">✏️ Anotações de Trabalho</h3>
                {isSaving ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : lastSaved ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="w-3 h-3" />
                    Salvo {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ) : null}
              </div>
              <textarea
                placeholder="Adicione anotações enquanto trabalha nesta tarefa..."
                className="w-full h-48 bg-white border-2 border-blue-200 rounded-lg p-4 outline-none text-slate-700 leading-relaxed resize-none focus:ring-2 focus:ring-blue-500/40"
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500 italic">
                💡 Ao salvar, essas anotações serão adicionadas às notas principais da tarefa
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Trabalho
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
