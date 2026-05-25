
import React, { useState } from 'react';
import { VC, VCStatus } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import { useAppContext } from '../hooks/useAppContext';

interface PostponeVCModalProps {
  vc: VC | null;
  onClose: () => void;
}

const PostponeVCModal: React.FC<PostponeVCModalProps> = ({ vc, onClose }) => {
  const { updateVCStatus } = useAppContext();
  const [newStartTime, setNewStartTime] = useState('');
  const [remarks, setRemarks] = useState('');

  const handlePostpone = () => {
    if (vc) {
      updateVCStatus(vc.id, VCStatus.Postponed, remarks, newStartTime || undefined);
      onClose();
      // Reset form
      setNewStartTime('');
      setRemarks('');
    }
  };

  if (!vc) return null;

  return (
    <Modal isOpen={!!vc} onClose={onClose} title="Postpone VC">
      <div className="space-y-4">
        <p className="text-gray-300">
            Postponing VC: <span className="font-bold text-white">{vc.subject}</span>
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Date & Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to postpone indefinitely.</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Remarks / Reason
            </label>
            <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. Technical difficulties, Guest unavailable..."
            />
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel Action</Button>
        <Button onClick={handlePostpone} variant="primary" className="bg-purple-600 hover:bg-purple-700">
          Confirm Postponement
        </Button>
      </div>
    </Modal>
  );
};

export default PostponeVCModal;
