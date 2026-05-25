
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'font-black uppercase tracking-widest py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center text-xs active:scale-95';
  
  const variantClasses = {
    primary: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-black/10 dark:shadow-white/5 hover:opacity-90',
    secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20',
    success: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20',
    ghost: 'bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
