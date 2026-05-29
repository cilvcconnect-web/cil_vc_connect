
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, User } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { Cloud, Loader2, Database, Download } from 'lucide-react';

interface ManageAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageAccountModal: React.FC<ManageAccountModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    updateUserProfile,
    users,
    vcs,
    attendance,
    attendanceChangeRequests,
    salaryVouchers,
    messages,
    // Add context state updates if we want to hydrate
  } = useAppContext();
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Bank and social security states
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [pfNumber, setPfNumber] = useState('');
  const [esicNumber, setEsicNumber] = useState('');
  
  // Back up sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'backup' | 'restore' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhoneNumber(currentUser.phoneNumber);
      setPassword(currentUser.password || '');
      setRole(currentUser.role);
      setProfilePhoto(currentUser.profilePhoto || null);
      setBankAccountNo(currentUser.bankAccountNo || '');
      setBankName(currentUser.bankName || '');
      setBankIfscCode(currentUser.bankIfscCode || '');
      setPfNumber(currentUser.pfNumber || '');
      setEsicNumber(currentUser.esicNumber || '');
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
        profilePhoto: profilePhoto || undefined,
        bankAccountNo: role === UserRole.Conductor ? bankAccountNo : undefined,
        bankName: role === UserRole.Conductor ? bankName : undefined,
        bankIfscCode: role === UserRole.Conductor ? bankIfscCode : undefined,
        pfNumber: role === UserRole.Conductor ? pfNumber : undefined,
        esicNumber: role === UserRole.Conductor ? esicNumber : undefined,
      });
      alert('Profile updated successfully!');
      onClose();
    } else {
        alert('Please fill in all required fields.');
    }
  };

  const handleCloudBackup = async () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to backup all your local VC details, reports, and vouchers to the Firebase Cloud Database?'
    );
    if (!isConfirmed) return;

    setIsSyncing(true);
    setSyncDirection('backup');

    try {
      // Backup Users
      for (const u of users) {
        const path = `users/${u.id}`;
        try {
          await setDoc(doc(db, 'users', u.id), u);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }

      // Backup VCs
      for (const v of vcs) {
        const path = `vcs/${v.id}`;
        try {
          await setDoc(doc(db, 'vcs', v.id), v);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }

      // Backup Attendance
      for (const a of attendance) {
        // Compose a compound string key for attendance
        const attendanceId = `${a.conductorId}_${a.date}`;
        const path = `attendance/${attendanceId}`;
        try {
          await setDoc(doc(db, 'attendance', attendanceId), a);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }

      // Backup Vouchers
      for (const s of salaryVouchers) {
        const path = `salaryVouchers/${s.id}`;
        try {
          await setDoc(doc(db, 'salaryVouchers', s.id), s);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }

      alert('Database backup completed successfully! All directories synced to Firebase Firestore.');
    } catch (error) {
      console.error('Backup aborted:', error);
      alert('Failed to sync to the Cloud database. Check network status.');
    } finally {
      setIsSyncing(false);
      setSyncDirection(null);
    }
  };

  const handleCloudRestore = async () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to restore from the Cloud? This will download directories from Firestore and update your system of record.'
    );
    if (!isConfirmed) return;

    setIsSyncing(true);
    setSyncDirection('restore');

    try {
      // Restore VCs from Firestore
      const pathVcs = 'vcs';
      let fetchedVcs: any[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'vcs'));
        querySnapshot.forEach((doc) => {
          fetchedVcs.push(doc.data());
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathVcs);
      }

      if (fetchedVcs.length > 0) {
        localStorage.setItem('app_vcs', JSON.stringify(fetchedVcs));
      }

      // Restore Vouchers
      const pathVouchers = 'salaryVouchers';
      let fetchedVouchers: any[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'salaryVouchers'));
        querySnapshot.forEach((doc) => {
          fetchedVouchers.push(doc.data());
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathVouchers);
      }

      if (fetchedVouchers.length > 0) {
        localStorage.setItem('app_salaryVouchers', JSON.stringify(fetchedVouchers));
      }

      alert('Successfully restored and synchronized directories from your cloud Firestore databases. Reloading browser context.');
      window.location.reload();
    } catch (error) {
      console.error('Restore aborted:', error);
      alert('Empty or uninitialized cloud database.');
    } finally {
      setIsSyncing(false);
      setSyncDirection(null);
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
            disabled={currentUser?.role !== UserRole.ReportingAuthority}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
             {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
          </select>
          {currentUser?.role !== UserRole.ReportingAuthority ? (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>🔒 Profile role changes are restricted to Reporting Authority.</span>
            </p>
          ) : (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Warning: Changing your role will alter your dashboard access immediately.
            </p>
          )}
        </div>

        {role === UserRole.Conductor && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
              Conductor Bank & Social Security Details
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="e.g. 123456789012"
                  className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfscCode}
                  onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">PF Number</label>
                <input
                  type="text"
                  value={pfNumber}
                  onChange={(e) => setPfNumber(e.target.value)}
                  placeholder="e.g. MH/BAN/12345/678"
                  className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">ESIC Number</label>
                <input
                  type="text"
                  value={esicNumber}
                  onChange={(e) => setEsicNumber(e.target.value)}
                  placeholder="e.g. 31000123450001201"
                  className="w-full p-2 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Firebase Cloud Sync block */}
        {false && (
        <div className="pt-4 border-t border-slate-700/60 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
             <Cloud className="w-4 h-4 text-[#4285F4]" />
             Firebase Backend Services Synchronizer
          </h4>
          <p className="text-[10px] text-gray-400 uppercase leading-[14px]">
             Upload local scheduled meetings & payroll claims to Cloud Firestore, or fetch remote configurations to maintain instant synchronization across devices.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
             <button
               type="button"
               disabled={isSyncing}
               onClick={handleCloudBackup}
               className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 font-bold text-xs uppercase hover:bg-cyan-900/30 transition-all disabled:opacity-50"
             >
                {isSyncing && syncDirection === 'backup' ? (
                   <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                   <Database className="w-3.5 h-3.5" />
                )}
                Backup
             </button>

             <button
               type="button"
               disabled={isSyncing}
               onClick={handleCloudRestore}
               className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-[#2e7d32]/20 text-[#4caf50] border border-[#2e7d32]/30 font-bold text-xs uppercase hover:bg-[#2e7d32]/30 transition-all disabled:opacity-50"
             >
                {isSyncing && syncDirection === 'restore' ? (
                   <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                   <Download className="w-3.5 h-3.5" />
                )}
                Restore
             </button>
          </div>
        </div>
        )}

      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  );
};

export default ManageAccountModal;
