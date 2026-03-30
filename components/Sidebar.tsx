
import React, { useState } from 'react';
import { Category, Urgency, Project } from '../types';
import { URGENCY_CONFIG } from '../constants';
import { LayoutDashboard, Filter, CheckSquare, Plus, Circle, History, X, Trash2, Menu, FolderKanban } from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  projects: Project[];
  selectedUrgency: Urgency | null;
  setSelectedUrgency: (u: Urgency | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  addProject: (name: string, description: string, color: string) => void;
  deleteProject: (id: string) => void;
  onOpenProject: (id: string) => void;
  onOpenHistory: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  projects,
  selectedUrgency,
  setSelectedUrgency,
  selectedCategory,
  setSelectedCategory,
  selectedProject,
  setSelectedProject,
  addCategory,
  deleteCategory,
  addProject,
  deleteProject,
  onOpenProject,
  onOpenHistory,
  onClose
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjColor, setNewProjColor] = useState('#3b82f6');

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim(), newCatColor);
      setNewCatName('');
      setIsAddingCategory(false);
    }
  };

  const handleAddProject = () => {
    if (newProjName.trim()) {
      addProject(newProjName.trim(), '', newProjColor);
      setNewProjName('');
      setIsAddingProject(false);
    }
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col flex-shrink-0 overflow-y-auto h-full relative">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Hamilton Planner</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-slate-100 rounded text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 ml-2">Visão</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedUrgency(null); setSelectedCategory(null); setSelectedProject(null); onClose?.(); }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${!selectedUrgency && !selectedCategory && !selectedProject ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <CheckSquare className="w-4 h-4 mr-3" />
                Todas as tarefas
              </button>
              <button
                onClick={() => { onOpenHistory(); onClose?.(); }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <History className="w-4 h-4 mr-3" />
                Histórico / Lixeira
              </button>
            </div>
          </div>

          {/* Projects Filter */}
          <div>
            <div className="flex items-center justify-between mb-3 ml-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projetos</h3>
              <button onClick={() => setIsAddingProject(true)} className="p-1 hover:bg-slate-100 rounded">
                <Plus className="w-3 h-3 text-slate-500" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map((proj) => (
                <div key={proj.id} className="group relative">
                  <button
                    onClick={() => { onOpenProject(proj.id); onClose?.(); }}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
                  >
                    <FolderKanban className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: proj.color }} />
                    <span className="flex-1 text-left truncate">{proj.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir projeto "${proj.name}"? As etapas vinculadas perderão o vínculo.`)) {
                        deleteProject(proj.id);
                      }
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all z-10"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Filter */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 ml-2">Prioridade</h3>
            <div className="space-y-1">
              {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedUrgency(selectedUrgency === key ? null : key as Urgency); onClose?.(); }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${selectedUrgency === key ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${config.color} mr-3`} />
                  {config.label}
                  {selectedUrgency === key && <X className="ml-auto w-3 h-3 text-slate-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <div className="flex items-center justify-between mb-3 ml-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categorias</h3>
              <button onClick={() => setIsAddingCategory(true)} className="p-1 hover:bg-slate-100 rounded">
                <Plus className="w-3 h-3 text-slate-500" />
              </button>
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id} className="group relative">
                  <button
                    onClick={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); onClose?.(); }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Circle className="w-3 h-3 mr-3" fill={cat.color} stroke={cat.color} />
                    <span className="flex-1 text-left">{cat.name}</span>
                    {selectedCategory === cat.id && <X className="w-3 h-3 text-slate-400" />}
                  </button>
                  {selectedCategory !== cat.id && (
                    <button
                      onClick={() => {
                        if (confirm(`Excluir categoria "${cat.name}"? As tarefas serão movidas para a categoria padrão.`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all z-10"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {(isAddingCategory || isAddingProject) && (
        <div className="p-4 border-t bg-slate-50">
          {isAddingCategory ? (
            <>
              <input
                type="text"
                placeholder="Nome da categoria"
                className="w-full px-3 py-2 text-xs border rounded mb-2 outline-none"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <div className="flex space-x-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border-none p-0 bg-transparent cursor-pointer"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                />
                <button
                  onClick={handleAddCategory}
                  className="flex-1 bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setIsAddingCategory(false)}
                  className="px-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Nome do projeto"
                className="w-full px-3 py-2 text-xs border rounded mb-2 outline-none"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              />
              <div className="flex space-x-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border-none p-0 bg-transparent cursor-pointer"
                  value={newProjColor}
                  onChange={(e) => setNewProjColor(e.target.value)}
                />
                <button
                  onClick={handleAddProject}
                  className="flex-1 bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700"
                >
                  Criar Projeto
                </button>
                <button
                  onClick={() => setIsAddingProject(false)}
                  className="px-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
