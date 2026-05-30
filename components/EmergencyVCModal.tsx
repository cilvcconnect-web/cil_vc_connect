import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, VCStatus } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import WebexImportModal from './WebexImportModal';
import { WebexParsedDetails } from '../services/webexService';

interface EmergencyVCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WebexIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
);

const EmergencyVCModal: React.FC<EmergencyVCModalProps> = ({ isOpen, onClose }) => {
  const { getUsersByRole, scheduleEmergencyVC, vcs } = useAppContext();

  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState(new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)); // Default to 5 mins from now
  const [managerId, setManagerId] = useState('');
  const [reportingAuthorityId, setReportingAuthorityId] = useState('');
  const [conductorId, setConductorId] = useState('');
  
  // Webex specific state
  const [isWebexMeeting, setIsWebexMeeting] = useState(false);
  const [webexId, setWebexId] = useState('');
  const [link, setLink] = useState('');
  const [isWebexModalOpen, setIsWebexModalOpen] = useState(false);

  const managers = getUsersByRole(UserRole.Manager);
  const reportingAuthorities = getUsersByRole(UserRole.ReportingAuthority);
  
  const busyConductorIds = useMemo(() =>
    new Set(
      vcs
        .filter(vc => vc.status === VCStatus.InProgress)
        .map(vc => vc.conductorId)
    ),
  [vcs]);

  const allConductors = useMemo(() => getUsersByRole(UserRole.Conductor), [getUsersByRole]);

  const handleWebexImport = (details: WebexParsedDetails) => {
    setSubject(details.subject);
    setLink(details.link || '');
    setWebexId(details.webexId || '');
    setIsWebexMeeting(true);
    
    if (details.startTime) {
      try {
        const dt = new Date(details.startTime);
        setStartTime(dt.toISOString().slice(0, 16));
      } catch (err) {
        console.error("Failed to parse start time from Webex invite:", err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductorId) {
        alert('Please select an available Conductor.');
        return;
    }

    scheduleEmergencyVC({
      subject: subject || 'Emergency Meeting', // Use provided subject or default
      startTime: new Date(startTime).toISOString(),
      managerId,
      reportingAuthorityId,
      conductorId,
      isWebexMeeting,
      webexId: webexId || undefined,
      link: link || undefined,
    });
    
    alert('Emergency VC has been scheduled.');
    onClose();
    // Reset form for next time
    setSubject('');
    setStartTime(new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16));
    setManagerId('');
    setReportingAuthorityId('');
    setConductorId('');
    setIsWebexMeeting(false);
    setWebexId('');
    setLink('');
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Schedule Emergency VC">
        <div className="flex justify-end mb-4">
          <Button 
            type="button"
            onClick={() => setIsWebexModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 flex items-center shadow-sm"
          >
            <WebexIcon />
            Quick Import Webex
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="emergency-subject" className="block text-sm font-medium text-gray-300 mb-2">
              Subject (Optional)
            </label>
            <input
              id="emergency-subject"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g., Urgent System Update"
            />
          </div>

          <div>
            <label htmlFor="emergency-startTime" className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
            <input
              id="emergency-startTime"
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Webex dynamic link display */}
          {isWebexMeeting && (
            <div className="p-3 bg-slate-800 border border-blue-500/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 flex items-center">
                  <WebexIcon />
                  Webex Linked
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsWebexMeeting(false);
                    setWebexId('');
                    setLink('');
                  }} 
                  className="text-xs text-red-400 hover:underline"
                >
                  Unlink
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Meeting ID</span>
                  <input 
                    type="text" 
                    value={webexId} 
                    onChange={e => setWebexId(e.target.value)}
                    className="w-full p-1.5 bg-slate-700 text-white rounded border border-slate-600 mt-1"
                  />
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Join URL</span>
                  <input 
                    type="text" 
                    value={link} 
                    onChange={e => setLink(e.target.value)}
                    className="w-full p-1.5 bg-slate-700 text-white rounded border border-slate-600 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="emergency-manager" className="block text-sm font-medium text-gray-300 mb-2">Manager (Optional)</label>
            <select
              id="emergency-manager"
              value={managerId}
              onChange={e => setManagerId(e.target.value)}
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">-- Select Manager --</option>
              {managers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="emergency-authority" className="block text-sm font-medium text-gray-300 mb-2">Reporting Authority (Optional)</label>
            <select
              id="emergency-authority"
              value={reportingAuthorityId}
              onChange={e => setReportingAuthorityId(e.target.value)}
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">-- Select Authority --</option>
              {reportingAuthorities.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="emergency-conductor" className="block text-sm font-medium text-gray-300 mb-2">Conductor</label>
            <select
              id="emergency-conductor"
              value={conductorId}
              onChange={e => setConductorId(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="" disabled>-- Select Conductor --</option>
              {allConductors.map(c => {
                const isBusy = busyConductorIds.has(c.id);
                const style = isBusy ? { color: '#F87171' } : {}; // Red-400
                return (
                  <option key={c.id} value={c.id} disabled={isBusy} style={style}>
                    {c.name} {isBusy ? '(In a meeting)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="danger">Schedule Now</Button>
          </div>
        </form>
      </Modal>

      <WebexImportModal 
        isOpen={isWebexModalOpen} 
        onClose={() => setIsWebexModalOpen(false)} 
        onImport={handleWebexImport}
      />
    </>
  );
};

export default EmergencyVCModal;
