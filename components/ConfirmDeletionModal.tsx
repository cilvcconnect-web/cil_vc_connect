
import React from 'react';
import Modal from './common/Modal';
import Button from './common/Button';

interface ConfirmDeletionModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

const ConfirmDeletionModal: React.FC<ConfirmDeletionModalProps> = ({ isOpen, onConfirm, onReject }) => {
  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} // Disallow closing by clicking outside to ensure a decision is made
      title="Account Deletion Request"
    >
      <div className="space-y-4">
        <p className="text-gray-800 dark:text-gray-200">
          The Reporting Authority has requested to delete your account. 
          <br />
          <span className="font-bold">This action is permanent and cannot be undone.</span>
        </p>
        <div className="text-sm text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Warning: All your data associated with this account will be removed immediately.
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onReject}>
          Reject Request
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Accept & Delete Account
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeletionModal;
