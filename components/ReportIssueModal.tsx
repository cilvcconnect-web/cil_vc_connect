
import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { VC } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { playTechnicalIssueTune } from '../utils/audio';

interface ReportIssueModalProps {
  vc: VC | null;
  onClose: () => void;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ vc, onClose }) => {
  const { reportTechnicalIssue, currentUser } = useAppContext();
  const [description, setDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const presets = ['Audio Not Working', 'Video Buffering/Frozen', 'Network Connection Lost', 'Power Failure', 'Equipment Malfunction'];

  const handleReport = () => {
    if (vc) {
      const finalDescription = selectedPreset ? `${selectedPreset}${description ? ': ' + description : ''}` : description;
      if (!finalDescription) {
          alert("Please describe the issue.");
          return;
      }
      reportTechnicalIssue(vc.id, finalDescription);
      
      // Play matching user's selected technical issue tune
      playTechnicalIssueTune(currentUser?.technicalIssueTune ?? 'siren');
      
      onClose();
      setDescription('');
      setSelectedPreset('');
    }
  };

  const handleResolve = () => {
      if (vc) {
          reportTechnicalIssue(vc.id, null); // Null description means resolved
          onClose();
      }
  }

  if (!vc) return null;

  return (
    <Modal isOpen={!!vc} onClose={onClose} title="Technical Support">
      <div className="space-y-4">
        {vc.technicalIssue ? (
             <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                 <p className="font-bold text-red-600 dark:text-red-400 mb-2">Current Issue Reported:</p>
                 <p className="text-gray-800 dark:text-gray-200">{vc.technicalIssueDescription}</p>
                 <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Has the issue been fixed?</p>
                     <Button onClick={handleResolve} variant="success" className="w-full">
                         Mark Issue as Resolved
                     </Button>
                 </div>
             </div>
        ) : (
            <>
                <p className="text-gray-300">
                    Report a technical problem for: <span className="font-bold text-white">{vc.subject}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {presets.map(preset => (
                        <button
                            key={preset}
                            onClick={() => setSelectedPreset(preset === selectedPreset ? '' : preset)}
                            className={`p-2 text-xs rounded-lg border transition-colors ${
                                selectedPreset === preset 
                                ? 'bg-red-600 text-white border-red-600' 
                                : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600'
                            }`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {selectedPreset ? 'Additional Details (Optional)' : 'Describe the Issue'}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="e.g. Microphone is muted and cannot unmute..."
                    />
                </div>
            </>
        )}
      </div>
      
      {!vc.technicalIssue && (
          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleReport} variant="danger" disabled={!description && !selectedPreset}>
              Report Issue
            </Button>
          </div>
      )}
    </Modal>
  );
};

export default ReportIssueModal;
