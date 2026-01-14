
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, DayOfWeek, Category } from '../types';
import { DAY_LABELS } from '../constants';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  categories: Category[];
  weekColumns: { date: string, label: string, dayKey: DayOfWeek }[];
  onTaskClick: (task: Task) => void;
  onCompleteTask: (id: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, categories, weekColumns, onTaskClick, onCompleteTask }) => {
  // Inbox is special
  const columns = [
    { id: 'inbox', label: DAY_LABELS['inbox'], isInbox: true },
    ...weekColumns.map(c => ({ id: c.date, label: c.label, isInbox: false }))
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks
          .filter((t) => col.isInbox ? t.dayOfWeek === 'inbox' : t.scheduledDate === col.id)
          .sort((a, b) => a.position - b.position);

        return (
          <div key={col.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex flex-col">
                <h3 className={`font-bold text-sm tracking-wide uppercase ${col.isInbox ? 'text-blue-600' : 'text-slate-700'}`}>
                  {col.label}
                </h3>
                {!col.isInbox && (
                  <span className="text-[10px] text-slate-400 font-medium">Programado</span>
                )}
              </div>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`min-h-[200px] rounded-xl transition-colors duration-200 p-1 ${snapshot.isDraggingOver ? 'bg-blue-50/50 outline outline-2 outline-dashed outline-blue-200' : 'bg-slate-100/30'
                    }`}
                >
                  <div className="space-y-3">
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-all ${snapshot.isDragging ? 'scale-[1.02] rotate-1 z-50 shadow-xl' : ''}`}
                            style={provided.draggableProps.style}
                          >
                            <TaskCard
                              task={task}
                              category={categories.find(c => c.id === task.category)}
                              onClick={() => onTaskClick(task)}
                              onComplete={() => onCompleteTask(task.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
