
import React from 'react';
import { CheckCircle2, Circle, FileText, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { Task, Category } from '../types';
import { URGENCY_CONFIG } from '../constants';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onClick: () => void;
  onComplete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, category, onClick, onComplete }) => {
  const urgencyStyle = URGENCY_CONFIG[task.urgency];

  return (
    <div 
      className={`group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden`}
      onClick={onClick}
    >
      {/* Priority Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${urgencyStyle.color}`} />

      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            {category && (
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider truncate"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                {category.name}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${urgencyStyle.bg} ${urgencyStyle.text}`}>
              {task.urgency}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            className="text-slate-300 hover:text-green-500 transition-colors"
          >
            <Circle className="w-5 h-5" />
          </button>
        </div>

        <h4 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">
          {task.title}
        </h4>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-3 text-slate-400">
            {task.notes && (
              <div className="flex items-center">
                <FileText className="w-3 h-3 mr-1" />
              </div>
            )}
            {task.images && task.images.length > 0 && (
              <div className="flex items-center">
                <ImageIcon className="w-3 h-3 mr-1" />
                <span className="text-[10px]">{task.images.length}</span>
              </div>
            )}
          </div>
          
          <div className="text-[10px] text-slate-400 font-medium italic">
            #{task.position + 1}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
