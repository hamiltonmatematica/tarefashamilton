import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Info } from 'lucide-react';
import { CustomStatus, STATUS_CONFIG, NATIVE_STATUS_ORDER } from '../constants';

interface StatusManagerProps {
  customStatuses: CustomStatus[];
  onSave: (list: CustomStatus[]) => void;
  onClose: () => void;
}

const StatusManager: React.FC<StatusManagerProps> = ({ customStatuses, onSave, onClose }) => {
  const [list, setList] = useState<CustomStatus[]>(customStatuses);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#8b5cf6');
  const [newDescription, setNewDescription] = useState('');

  const addStatus = () => {
    if (!newLabel.trim()) return;
    setList(prev => [...prev, {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      color: newColor,
      description: newDescription.trim() || undefined,
      order: prev.length,
    }]);
    setNewLabel('');
    setNewDescription('');
  };

  const updateItem = (id: string, updates: Partial<CustomStatus>) => {
    setList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeItem = (id: string) => {
    if (confirm('Excluir este status? As tarefas com esse status voltam para "A Fazer".')) {
      setList(prev => prev.filter(s => s.id !== id));
    }
  };

  const move = (id: string, direction: -1 | 1) => {
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= list.length) return;
    const copy = [...list];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    copy.forEach((s, i) => s.order = i);
    setList(copy);
  };

  const handleSave = () => {
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Gerenciar Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adicione status personalizados (ex: "Aguardando aprovação", "Em revisão")
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status Nativos (read-only) */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Info className="w-3 h-3" /> Status Nativos (não editáveis)
            </h3>
            <div className="space-y-2">
              {NATIVE_STATUS_ORDER.map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <div key={s} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className={`w-3 h-3 rounded-full ${cfg.color} mt-1 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800">{cfg.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cfg.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Customizados */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Seus Status Personalizados
            </h3>
            {list.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">
                Nenhum status personalizado ainda. Adicione abaixo.
              </p>
            ) : (
              <div className="space-y-2">
                {[...list].sort((a, b) => a.order - b.order).map((s, idx) => (
                  <div key={s.id} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-200 group">
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => move(s.id, -1)}
                        disabled={idx === 0}
                        className="text-slate-300 hover:text-blue-500 disabled:opacity-30"
                      >▲</button>
                      <button
                        onClick={() => move(s.id, 1)}
                        disabled={idx === list.length - 1}
                        className="text-slate-300 hover:text-blue-500 disabled:opacity-30"
                      >▼</button>
                    </div>
                    <input
                      type="color"
                      value={s.color}
                      onChange={e => updateItem(s.id, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        type="text"
                        value={s.label}
                        onChange={e => updateItem(s.id, { label: e.target.value })}
                        className="w-full font-semibold text-sm bg-transparent outline-none border-b border-transparent focus:border-slate-300"
                        placeholder="Nome do status"
                      />
                      <input
                        type="text"
                        value={s.description || ''}
                        onChange={e => updateItem(s.id, { description: e.target.value })}
                        className="w-full text-xs text-slate-500 bg-transparent outline-none border-b border-transparent focus:border-slate-300"
                        placeholder="Descrição (opcional, aparece no tooltip)"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(s.id)}
                      className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar novo */}
            <div className="mt-4 p-4 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl">
              <h4 className="text-xs font-bold text-blue-700 uppercase mb-3">+ Novo Status</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addStatus()}
                    placeholder="Nome (ex: Aguardando Aprovação)"
                    className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <input
                  type="text"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Descrição (opcional)"
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={addStatus}
                  disabled={!newLabel.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Status
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusManager;
