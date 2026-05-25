
import React, { useState } from 'react';
import { VC, VCStatus } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import VCDetailsModal from './VCDetailsModal';
import LocationSticker from './common/LocationSticker';

interface OldVCListModalProps {
  isOpen: boolean;
  onClose: () => void;
  vcs: VC[]; // Passed in VCs should already be filtered if necessary, or we filter inside
}

const OldVCListModal: React.FC<OldVCListModalProps> = ({ isOpen, onClose, vcs }) => {
  const [selectedVc, setSelectedVc] = useState<VC | null>(null);

  // Filter for Old VCs (Completed or Cancelled)
  const oldVCs = vcs.filter(
    vc => vc.status === VCStatus.Completed || vc.status === VCStatus.Cancelled
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const getStatusColor = (status: VCStatus) => {
    switch (status) {
      case VCStatus.Completed: return 'text-green-500';
      case VCStatus.Cancelled: return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Old VC History">
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Showing completed and cancelled VCs.
          </p>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {oldVCs.length > 0 ? (
              oldVCs.map(vc => (
                <div 
                    key={vc.id} 
                    className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-gray-200 dark:border-transparent"
                >
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{vc.subject}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date: {new Date(vc.startTime).toLocaleDateString()} at {new Date(vc.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <LocationSticker locations={vc.locations} className="mt-2" />
                    <p className={`text-sm font-bold uppercase mt-2 ${getStatusColor(vc.status)}`}>
                        {vc.status}
                    </p>
                    {vc.remarks && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                            Remarks: {vc.remarks}
                        </p>
                    )}
                  </div>
                  <Button variant="secondary" onClick={() => setSelectedVc(vc)} className="shrink-0">
                    View Details
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No history available.
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </Modal>

      <VCDetailsModal vc={selectedVc} onClose={() => setSelectedVc(null)} />
    </>
  );
};

export default OldVCListModal;
