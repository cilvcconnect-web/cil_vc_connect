
import React from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { VC, User } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface VCDetailsModalProps {
  vc: VC | null;
  onClose: () => void;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const DetailItem: React.FC<{ label: string; value?: string | null; user?: User | null; isUserField?: boolean }> = ({ label, value, user, isUserField }) => (
  <div className="py-2">
    <p className="text-sm text-gray-400">{label}</p>
    {user ? (
        <div className="flex items-center gap-2 mt-1">
             <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center border border-slate-600">
                {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                    <UserIcon />
                )}
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{user.name} <span className="text-gray-500 dark:text-gray-400 font-normal text-sm">({user.phoneNumber})</span></p>
        </div>
    ) : isUserField ? (
        <p className="font-semibold text-yellow-500 dark:text-yellow-400">Not Assigned</p>
    ) : (
        <p className="font-semibold text-gray-900 dark:text-white">{value || 'N/A'}</p>
    )}
  </div>
);

const VCDetailsModal: React.FC<VCDetailsModalProps> = ({ vc, onClose }) => {
  const { getUserById } = useAppContext();

  if (!vc) {
    return null;
  }

  const manager = getUserById(vc.managerId);
  const reportingAuthority = getUserById(vc.reportingAuthorityId);
  const conductor = vc.conductorId ? getUserById(vc.conductorId) : null;
  
  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  }

  return (
    <Modal isOpen={!!vc} onClose={onClose} title="VC Details">
      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        <div className="flex justify-between items-start">
             <DetailItem label="Subject" value={vc.subject} />
             {vc.isWebexMeeting && (
                 <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center shadow-sm">
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                    WEBEX
                 </span>
             )}
        </div>
        
        <DetailItem label="Status" value={vc.status} />
        {vc.webexId && <DetailItem label="Webex Meeting ID" value={vc.webexId} />}
        
        <DetailItem label="Location(s)" value={vc.locations.join(', ')} />
        <div className="grid grid-cols-2 gap-2">
            <DetailItem label="Room Name" value={vc.roomName} />
            <DetailItem label="Building" value={vc.buildingType} />
        </div>
        <DetailItem label="Room IP" value={vc.roomIp} />
        <DetailItem label="Scheduled Start Time" value={formatDate(vc.startTime)} />
        <DetailItem label="Actual Start Time" value={formatDate(vc.actualStartTime)} />
        <DetailItem label="Actual End Time" value={formatDate(vc.actualEndTime)} />
        <DetailItem label="Manager" user={manager} />
        <DetailItem label="Reporting Authority" user={reportingAuthority} />
        <DetailItem label="Conductor" user={conductor} isUserField={true} />
        <DetailItem label="Remarks" value={vc.remarks} />
        <div className="py-2">
            <p className="text-sm text-gray-400">Meeting Link</p>
            {vc.link ? <a href={vc.link} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline break-all">{vc.link}</a> : 'N/A'}
        </div>
        <div className="py-2">
            <p className="text-sm text-gray-400">Presentation Link</p>
            {vc.pptLink ? <a href={vc.pptLink} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline break-all">{vc.pptLink}</a> : 'N/A'}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default VCDetailsModal;
