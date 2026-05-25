
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-11/12 md:w-1/2 lg:w-1/3 p-6 text-gray-900 dark:text-gray-200 transition-colors duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-600 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;