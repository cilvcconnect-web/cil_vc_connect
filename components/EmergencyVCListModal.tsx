
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VC, VCStatus } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import VCDetailsModal from './VCDetailsModal';
import LocationSticker from './common/LocationSticker';

interface EmergencyVCListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmergencyVCListModal: React.FC<EmergencyVCListModalProps> = ({ isOpen, onClose }) => {
  const { vcs } = useAppContext();
  const [selectedVc, setSelectedVc] = useState<VC | null>(null);

  const emergencyVCs = useMemo(() => {
    return vcs
      .filter(vc => vc.subject.startsWith('[EMERGENCY]'))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [vcs]);

  const getStatusColor = (status: VCStatus) => {
    switch (status) {
      case VCStatus.Scheduled: return 'text-blue-400';
      case VCStatus.InProgress: return 'text-yellow-400';
      case VCStatus.Completed: return 'text-green-400';
      case VCStatus.Cancelled: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Emergency VC List">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {emergencyVCs.length > 0 ? emergencyVCs.map(vc => (
            <div key={vc.id} className="bg-slate-700 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <p className="font-bold text-lg text-red-400">{vc.subject}</p>
                <p className="text-sm text-gray-400">
                  Scheduled: {new Date(vc.startTime).toLocaleString()}
                </p>
                <LocationSticker locations={vc.locations} className="mt-2" />
                <p className={`text-sm font-semibold ${getStatusColor(vc.status)}`}>{vc.status}</p>
              </div>
              <Button variant="secondary" onClick={() => setSelectedVc(vc)}>Details</Button>
            </div>
          )) : <p>There are no emergency VCs scheduled.</p>}
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </Modal>

      <VCDetailsModal vc={selectedVc} onClose={() => setSelectedVc(null)} />
    </>
  );
};

export default EmergencyVCListModal;
