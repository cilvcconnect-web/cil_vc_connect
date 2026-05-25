
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-white/5 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
