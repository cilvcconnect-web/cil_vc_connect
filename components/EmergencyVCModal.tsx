import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, VCStatus } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';

interface EmergencyVCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmergencyVCModal: React.FC<EmergencyVCModalProps> = ({ isOpen, onClose }) => {
  const { getUsersByRole, scheduleEmergencyVC, vcs } = useAppContext();

  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState(new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)); // Default to 5 mins from now
  const [managerId, setManagerId] = useState('');
  const [reportingAuthorityId, setReportingAuthorityId] = useState('');
  const [conductorId, setConductorId] = useState('');

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
    });
    
    alert('Emergency VC has been scheduled.');
    onClose();
    // Reset form for next time
    setSubject('');
    setStartTime(new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16));
    setManagerId('');
    setReportingAuthorityId('');
    setConductorId('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Emergency VC">
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
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
  );
};

export default EmergencyVCModal;