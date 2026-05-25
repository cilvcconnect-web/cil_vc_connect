
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ManageAccountModal from '../ManageAccountModal';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const Header: React.FC = () => {
  const { currentUser, logout, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
        <header className="sticky top-0 z-50 transition-all duration-500">
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 shadow-sm"></div>
          <div className="container mx-auto relative px-4 md:px-6 h-20 flex justify-between items-center max-w-7xl">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
                <Logo className="w-9 h-9" />
              </div>
              <div className="flex flex-col -space-y-1">
                 <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">CIL VC CONNECT</h1>
                 <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase">Digital Core</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
               {currentUser && (
                   <button
                    onClick={() => navigate('/chat')}
                    className="p-2.5 rounded-xl bg-white/50 hover:bg-green-50 dark:bg-slate-800/50 dark:hover:bg-green-900/20 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-all border border-white/20 dark:border-slate-700/50 shadow-sm"
                    title="Communication Bridge"
                   >
                       <ChatIcon />
                   </button>
               )}
               <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-xl bg-white/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/50 shadow-sm text-slate-600 dark:text-slate-400"
                title="Shift Interface"
               >
                 {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
               </button>

              {currentUser && (
                <div className="flex items-center gap-3 ml-2 md:ml-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer p-1.5 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors group"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <div className="hidden sm:flex flex-col text-right">
                        <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{currentUser.name}</p>
                        <p className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-wider">{currentUser.role}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-md group-hover:border-cyan-500 transition-all">
                        {currentUser.profilePhoto ? (
                             <img src={currentUser.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                             <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <UserIcon />
                             </div>
                        )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-black/5"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {currentUser && (
            <ManageAccountModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        )}
    </>
  );
};

export default Header;
