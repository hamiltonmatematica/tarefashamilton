import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'right';
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const Tooltip: React.FC<TooltipProps> = ({ content, title, position = 'bottom', children, width = 'md' }) => {
  const [visible, setVisible] = useState(false);

  const widthClass = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
  }[width];

  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className={`absolute z-50 ${positionClass} ${widthClass} bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none animate-fade-in`}
        >
          {title && (
            <span className="block font-bold mb-1 text-white">{title}</span>
          )}
          <span className="block text-slate-200 leading-snug">{content}</span>
        </span>
      )}
    </span>
  );
};

export default Tooltip;
