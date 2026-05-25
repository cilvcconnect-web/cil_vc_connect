
import React from 'react';
import { User } from '../../types';

interface UserStickerProps {
  user: User | null;
  className?: string;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);


const UserSticker: React.FC<UserStickerProps> = ({ user, className = '' }) => {
  if (!user) {
    return null;
  }

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-700 text-gray-200 shadow ${className}`}>
        <div className="mr-3 h-8 w-8 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center flex-shrink-0">
             {user.profilePhoto ? (
                 <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
             ) : (
                 <UserIcon />
             )}
        </div>
      <div>
        <p className="font-semibold leading-tight text-white">{user.name}</p>
        <p className="text-xs text-gray-400 leading-tight">{user.role}</p>
      </div>
    </div>
  );
};

export default UserSticker;
