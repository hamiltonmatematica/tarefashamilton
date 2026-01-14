import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Search, Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Task, Category, Urgency, DayOfWeek } from './types';
import { DEFAULT_CATEGORIES, getStartOfWeek, getWeekDates, formatDate } from './constants';
import KanbanBoard from './components/KanbanBoard';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import HistoryModal from './components/HistoryModal';
import { CalendarView } from './components/CalendarView';
import { LoginScreen } from './components/LoginScreen';
import { getTasks, saveTasks, addTask as addTaskToStorage, updateTask as updateTaskInStorage, deleteTask as deleteTaskFromStorage } from './lib/storage';

type View = 'calendar' | 'week';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<View>('calendar');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Week Management
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));

  const weekColumns = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

  // Auto-cleanup: Remove tasks older than 30 days
  useEffect(() => {
    const cleanupOldTasks = () => {
      const now = new Date();
      setTasks(prev => prev.filter(task => {
        if (!task.isCompleted || !task.completedAt) return true;
        const completedDate = new Date(task.completedAt);
        const daysPassed = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysPassed < 30; // Keep only tasks completed less than 30 days ago
      }));
    };

    // Run cleanup on mount and every hour
    cleanupOldTasks();
    const interval = setInterval(cleanupOldTasks, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, []);

  // Load tasks from localStorage
  useEffect(() => {
    const loadedTasks = getTasks();
    const savedCats = localStorage.getItem('planner-hamilton-categories');

    if (loadedTasks.length > 0) {
      // Convert storage format to app format
      const appTasks: Task[] = loadedTasks.map(t => ({
        ...t,
        // Map columnId to dayOfWeek and scheduledDate
        dayOfWeek: t.columnId === 'inbox' ? 'inbox' : (new Date(t.columnId).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek),
        scheduledDate: t.columnId === 'inbox' ? undefined : t.columnId,
        urgency: t.priority === 'high' ? Urgency.HIGH : t.priority === 'medium' ? Urgency.MEDIUM : Urgency.LOW,
        category: t.category || categories[0].id,
        notes: '',
        attachments: [],
        isCompleted: false,
      }));
      setTasks(appTasks);
    }

    if (savedCats) setCategories(JSON.parse(savedCats));
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    // Convert app format to storage format
    const storageTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.urgency === Urgency.HIGH ? 'high' : t.urgency === Urgency.MEDIUM ? 'medium' : 'low',
      columnId: t.dayOfWeek === 'inbox' ? 'inbox' : (t.scheduledDate || 'inbox'),
      position: t.position,
      category: t.category,
      createdAt: t.createdAt,
      updatedAt: new Date().toISOString(),
    }));

    saveTasks(storageTasks as any);
    localStorage.setItem('planner-hamilton-categories', JSON.stringify(categories));
  }, [tasks, categories]);

  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title || 'Nova Tarefa',
      description: taskData.description || '',
      urgency: taskData.urgency || Urgency.LOW,
      category: taskData.category || categories[0].id,
      dayOfWeek: taskData.dayOfWeek || 'inbox',
      scheduledDate: taskData.scheduledDate,
      position: tasks.filter(t => t.dayOfWeek === (taskData.dayOfWeek || 'inbox')).length,
      notes: '',
      attachments: [],
      isCompleted: false,
      createdAt: new Date().toISOString(),
      ...taskData,
    };
    setTasks(prev => [...prev, newTask]);
    setIsTaskModalOpen(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: true, completedAt: new Date().toISOString() } : t));
  };

  const restoreTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: false, completedAt: undefined } : t));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskToMove = tasks.find(t => t.id === draggableId);
    if (!taskToMove) return;

    // Create a copy of the task with updated properties
    const updatedTask = { ...taskToMove };

    // Update date logic based on droppableId
    if (destination.droppableId === 'inbox') {
      updatedTask.dayOfWeek = 'inbox';
      updatedTask.scheduledDate = undefined;
    } else {
      // Find the date associated with the droppable column
      const col = weekColumns.find(c => c.date === destination.droppableId);
      if (col) {
        updatedTask.scheduledDate = col.date;
        updatedTask.dayOfWeek = col.dayKey;
      }
    }

    // Get all tasks in the destination column (excluding the task being moved)
    const destinationTasks = tasks
      .filter(t => {
        if (t.id === draggableId) return false; // Exclude the task being moved
        if (destination.droppableId === 'inbox') {
          return t.dayOfWeek === 'inbox';
        }
        return t.scheduledDate === destination.droppableId;
      })
      .sort((a, b) => a.position - b.position);

    // Insert the moved task at the destination index
    destinationTasks.splice(destination.index, 0, updatedTask);

    // Update positions for all tasks in destination column
    destinationTasks.forEach((t, i) => {
      t.position = i;
    });

    // Create the final tasks array
    const finalTasks = tasks.map(t => {
      if (t.id === draggableId) {
        return updatedTask;
      }
      // Update position if task is in the destination column
      const destTask = destinationTasks.find(dt => dt.id === t.id);
      if (destTask) {
        return { ...t, position: destTask.position };
      }
      return t;
    });

    setTasks(finalTasks);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUrgency = !selectedUrgency || t.urgency === selectedUrgency;
      const matchesCategory = !selectedCategory || t.category === selectedCategory;
      const notCompleted = !t.isCompleted;
      return matchesSearch && matchesUrgency && matchesCategory && notCompleted;
    });
  }, [tasks, searchTerm, selectedUrgency, selectedCategory]);

  const addCategory = (name: string, color: string) => {
    const newCat = { id: crypto.randomUUID(), name, color };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (categoryId: string) => {
    // Update tasks that use this category to use default category
    const defaultCategoryId = categories[0]?.id;
    if (defaultCategoryId) {
      setTasks(prev => prev.map(task =>
        task.category === categoryId
          ? { ...task, category: defaultCategoryId }
          : task
      ));
    }
    // Remove category
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const changeWeek = (direction: number) => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(nextWeek);
  };

  const handleDayClick = (date: Date) => {
    // Set the week to the clicked date's week
    setCurrentWeekStart(getStartOfWeek(date));
    setView('week');
  };

  // Convert tasks to storage format for CalendarView
  const calendarTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: (t.urgency === Urgency.HIGH ? 'high' : t.urgency === Urgency.MEDIUM ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    columnId: t.dayOfWeek === 'inbox' ? 'inbox' : (t.scheduledDate || 'inbox'),
    position: t.position,
    createdAt: t.createdAt,
    updatedAt: new Date().toISOString(),
  }));

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  // Render Calendar View
  if (view === 'calendar') {
    return (
      <>
        <CalendarView tasks={calendarTasks as any} onDayClick={handleDayClick} />

        {isTaskModalOpen && (
          <TaskModal
            task={editingTask}
            categories={categories}
            onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
            onSave={(data) => editingTask ? updateTask(editingTask.id, data) : addTask(data)}
            onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
          />
        )}
      </>
    );
  }

  // Render Week View
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {isSidebarOpen && (
        <Sidebar
          categories={categories}
          selectedUrgency={selectedUrgency}
          setSelectedUrgency={setSelectedUrgency}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-6 flex-1">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title={isSidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Back to Calendar Button */}
            <button
              onClick={() => setView('calendar')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Calendário
            </button>

            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 rounded-lg text-sm transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Week Navigation */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <div className="px-3 flex items-center space-x-2 text-xs font-bold text-slate-600">
                <CalendarIcon className="w-3 h-3" />
                <span>Semana de {currentWeekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
              </div>
              <button onClick={() => changeWeek(1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
                className="ml-2 px-2 py-1 text-[10px] bg-white text-blue-600 rounded border shadow-sm hover:bg-blue-50"
              >
                Hoje
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-4">
            <button
              onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <KanbanBoard
              tasks={filteredTasks}
              categories={categories}
              weekColumns={weekColumns}
              onTaskClick={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
              onCompleteTask={completeTask}
            />
          </DragDropContext>
        </div>
      </main>

      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
          onSave={(data) => editingTask ? updateTask(editingTask.id, data) : addTask(data)}
          onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal
          tasks={tasks.filter(t => t.isCompleted)}
          categories={categories}
          onClose={() => setIsHistoryOpen(false)}
          onRestore={restoreTask}
          onPermanentDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
        />
      )}
    </div>
  );
};

export default App;
