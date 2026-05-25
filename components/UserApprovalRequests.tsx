
import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserStatus } from '../types';
import Card from './common/Card';
import Button from './common/Button';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const UserApprovalRequests: React.FC = () => {
  const { users, approveUser, rejectUser } = useAppContext();

  const pendingUsers = useMemo(() => users.filter(u => u.status === UserStatus.Pending), [users]);

  if (pendingUsers.length === 0) return null;

  return (
    <Card className="mb-6 border-l-4 border-yellow-500">
      <h3 className="text-xl font-semibold mb-4 text-yellow-600 dark:text-yellow-400">Pending User Approvals</h3>
      <div className="space-y-3">
        {pendingUsers.map(user => (
          <div key={user.id} className="bg-white border border-gray-200 dark:border-transparent dark:bg-slate-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 flex items-center justify-center">
                    {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <UserIcon />
                    )}
                </div>
                <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{user.role} • {user.phoneNumber}</p>
                </div>
             </div>
             <div className="flex gap-2">
                <Button variant="success" onClick={() => approveUser(user.id)}>Approve</Button>
                <Button variant="danger" onClick={() => rejectUser(user.id)}>Reject</Button>
             </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UserApprovalRequests;
