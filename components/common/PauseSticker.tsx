
import React from 'react';

interface PauseStickerProps {
  onClick: () => void;
  className?: string;
}

const PauseSticker: React.FC<PauseStickerProps> = ({ onClick, className = '' }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors cursor-pointer ${className}`}
        title="Pause/Postpone VC"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Pause
    </button>
);

export default PauseSticker;
