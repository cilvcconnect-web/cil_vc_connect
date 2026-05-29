
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, UserStatus } from '../types';
import Logo from './common/Logo';

const ProgressDots = ({ step }: { step: number }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
            <div 
                key={s}
                className={`h-1 rounded-full transition-all duration-500 ease-out ${
                    s === step 
                    ? 'w-12 bg-cyan-500' 
                    : s < step 
                        ? 'w-4 bg-cyan-800' 
                        : 'w-4 bg-slate-200 dark:bg-slate-700'
                }`}
            />
        ))}
    </div>
);

const ModernAssistantMascot = () => (
    <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-float">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" />
            <rect x="70" y="80" width="60" height="40" rx="10" fill="currentColor" opacity="0.2" />
            <circle cx="85" cy="95" r="4" fill="currentColor" />
            <circle cx="115" cy="95" r="4" fill="currentColor" />
            <path d="M90 110 Q100 115 110 110" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </div>
);

const LoginScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [password, setPassword] = useState('');
  const { users, login } = useAppContext();
  const navigate = useNavigate();

  const currentStep = useMemo(() => {
    if (!selectedRole) return 1;
    if (!selectedUser) return 2;
    return 3;
  }, [selectedRole, selectedUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && password) {
      const success = login(selectedUser, password);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  const usersInRole = useMemo(() => {
    if (!selectedRole) return [];
    return users.filter(user => user.role === selectedRole);
  }, [selectedRole, users]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0f1a] relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Dynamic Aura Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        
        {/* Top Branding */}
        <div className="flex flex-col items-center mb-10">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl mb-4">
                <Logo className="w-16 h-16" />
            </div>
            <h1 className="text-sm font-black tracking-[0.4em] text-cyan-500 uppercase">
                CIL VC CONNECT
            </h1>
        </div>

        {/* Main Card */}
        <div className="group relative bg-white/5 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20">
          
          <ModernAssistantMascot />
          <ProgressDots step={currentStep} />

          <form onSubmit={handleLogin} className="space-y-8">
            
            {/* STEP 1: ROLE */}
            {currentStep === 1 && (
                <div className="animate-slide-up">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Select Role</h2>
                        <p className="text-slate-400 text-sm">Choose your primary operational capacity.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {Object.values(UserRole).map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setSelectedRole(role)}
                                className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300 text-left"
                            >
                                 <span className="font-semibold text-slate-200 group-hover:text-white">{role}</span>
                                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: IDENTITY */}
            {currentStep === 2 && (
                <div className="animate-slide-up">
                    <button 
                        type="button" 
                        onClick={() => setSelectedRole('')} 
                        className="text-cyan-500 text-xs font-bold mb-4 flex items-center gap-1 hover:text-cyan-400"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                        CHANGE ROLE
                    </button>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Identify Yourself</h2>
                        <p className="text-slate-400 text-sm">Select your registered profile from the directory.</p>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedUser}
                            onChange={e => setSelectedUser(e.target.value)}
                            className="w-full p-4 bg-slate-800/50 text-white border border-white/10 rounded-2xl focus:border-cyan-500 outline-none appearance-none font-medium cursor-pointer shadow-inner"
                        >
                            <option value="" disabled className="bg-slate-900">Select Profile...</option>
                            {usersInRole.map(user => (
                                <option key={user.id} value={user.id} className="bg-slate-900">
                                    {user.name} {user.status !== UserStatus.Approved ? `(${user.status})` : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: SECURITY */}
            {currentStep === 3 && (
                <div className="animate-slide-up">
                     <button 
                        type="button" 
                        onClick={() => setSelectedUser('')} 
                        className="text-cyan-500 text-xs font-bold mb-4 flex items-center gap-1 hover:text-cyan-400"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                        BACK TO IDENTITY
                    </button>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Security Access</h2>
                        <p className="text-slate-400 text-sm">Enter your private protocol passphrase.</p>
                    </div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Passphrase"
                        className="w-full p-4 bg-slate-800/50 text-white border border-white/10 rounded-2xl focus:border-cyan-500 outline-none font-mono text-xl tracking-widest placeholder:text-slate-600 shadow-inner"
                        required
                        autoFocus
                    />
                </div>
            )}

            <button 
                type="submit" 
                disabled={currentStep < 3 || !password}
                className="relative overflow-hidden w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group"
            >
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                    Authenticate <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity shimmer-effect"></div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
             <p className="text-slate-500 text-sm font-medium">
                Unregistered Protocol?{' '}
                <Link to="/signup" className="text-cyan-500 font-bold hover:text-white transition-colors underline decoration-cyan-500/30 underline-offset-4">
                  Request New Badge
                </Link>
             </p>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="mt-8 flex justify-center items-center gap-4 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Node: Stable
            </div>
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            <div>SSL v3.0 Enforced</div>
        </div>

        {/* Copyright Watermark */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center flex flex-col items-center justify-center gap-1 select-none">
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            © 2026 CIL VC Connect.
          </p>
          <p className="text-[10px] font-semibold tracking-wider text-slate-500/80 uppercase">
            This Application Made By <span className="text-cyan-500 font-extrabold font-mono">Pritam Das</span> | Contact: <span className="font-mono text-cyan-500 font-extrabold">6296361642</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulseSlow 10s ease-in-out infinite;
        }
        .shimmer-effect {
          background: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.2) 50%,
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
