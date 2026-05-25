
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, User } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';

interface ManageAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageAccountModal: React.FC<ManageAccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAppContext();
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhoneNumber(currentUser.phoneNumber);
      setPassword(currentUser.password || '');
      setRole(currentUser.role);
      setProfilePhoto(currentUser.profilePhoto || null);
    }
  }, [currentUser, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (currentUser && name && phoneNumber && role) {
      updateUserProfile(currentUser.id, {
        name,
        phoneNumber,
        password,
        role,
        profilePhoto: profilePhoto || undefined
      });
      alert('Profile updated successfully!');
      onClose();
    } else {
        alert('Please fill in all required fields.');
    }
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  if (!currentUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage My Account">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-slate-600 bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                    {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                </div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
            <p className="text-xs text-gray-500 mt-2">Click to update profile photo</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a new password"
            className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Role (Type)</label>
          <select
            value={role || ''}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
             {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
          </select>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            Warning: Changing your role will alter your dashboard access immediately.
          </p>
        </div>

      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  );
};

export default ManageAccountModal;
