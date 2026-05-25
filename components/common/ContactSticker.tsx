
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

interface ContactStickerProps {
  userId?: string;
  label: string;
}

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.758a10.024 10.024 0 006.96 6.96l.758-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);

const ContactSticker: React.FC<ContactStickerProps> = ({ userId, label }) => {
  const { getUserById } = useAppContext();
  const user = userId ? getUserById(userId) : null;

  if (!user || !user.id) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/50 tracking-widest">
        {label}: N/A
      </span>
    );
  }

  return (
    <a
      href={`tel:${user.phoneNumber}`}
      className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/50 shadow-sm transition-all tracking-widest group"
      title={`Call ${user.name}`}
    >
      <span className="opacity-60 group-hover:opacity-100 transition-opacity">{label}:</span>
      <span className="mx-1.5 font-black text-slate-900 dark:text-white">{user.name}</span>
      <PhoneIcon />
    </a>
  );
};

export default ContactSticker;
