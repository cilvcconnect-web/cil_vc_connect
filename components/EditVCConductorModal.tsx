import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VC, UserRole, VCStatus } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';

interface EditVCConductorModalProps {
  vc: VC | null;
  onClose: () => void;
}

const EditVCConductorModal: React.FC<EditVCConductorModalProps> = ({ vc, onClose }) => {
  const { getUsersByRole, updateVCConductor, vcs } = useAppContext();
  const [selectedConductorId, setSelectedConductorId] = useState('');

  const allConductors = getUsersByRole(UserRole.Conductor);

  const busyConductorIds = useMemo(() =>
    new Set(
      vcs
        .filter(v => v.status === VCStatus.InProgress)
        .map(v => v.conductorId)
    ),
  [vcs]);

  useEffect(() => {
    if (vc) {
      setSelectedConductorId(vc.conductorId);
    }
  }, [vc]);

  const handleSave = () => {
    if (vc && selectedConductorId) {
      updateVCConductor(vc.id, selectedConductorId);
      onClose();
    }
  };

  if (!vc) {
    return null;
  }

  return (
    <Modal isOpen={!!vc} onClose={onClose} title="Edit Conductor">
      <div className="space-y-4">
        <p>
          You are changing the conductor for the VC: <span className="font-bold text-cyan-400">{vc.subject}</span>
        </p>
        <div>
          <label htmlFor="conductor-edit" className="block text-sm font-medium text-gray-300 mb-2">
            Select New Conductor
          </label>
          <select
            id="conductor-edit"
            value={selectedConductorId}
            onChange={(e) => setSelectedConductorId(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            {allConductors.map(c => {
              const isBusy = busyConductorIds.has(c.id);
              const optionStyle = isBusy ? { color: '#F87171' } : {}; // Tailwind red-400
              const optionText = `${c.name} ${isBusy ? '(In a meeting)' : ''}`;

              return (
                <option key={c.id} value={c.id} disabled={isBusy} style={optionStyle}>
                  {optionText}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!selectedConductorId || selectedConductorId === vc.conductorId}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default EditVCConductorModal;