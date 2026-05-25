import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { useAppContext } from '../hooks/useAppContext';

interface RequestAttendanceChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conductorId: string;
}

const RequestAttendanceChangeModal: React.FC<RequestAttendanceChangeModalProps> = ({ isOpen, onClose, conductorId }) => {
  const { requestAttendanceChange } = useAppContext();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [reason, setReason] = useState('');
  
  const formatTimeToISO = (dateStr: string, timeStr: string): string | null => {
      if (!dateStr || !timeStr) return null;
      const [hours, minutes] = timeStr.split(':');
      const dateObj = new Date(dateStr);
      dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return dateObj.toISOString();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !inTime || !reason) {
      alert('Please fill in the date, new in-time, and a reason for the request.');
      return;
    }

    const requestedInTime = formatTimeToISO(date, inTime);
    if (!requestedInTime) {
        alert('Invalid In-Time format.');
        return;
    }

    const requestedOutTime = outTime ? formatTimeToISO(date, outTime) : null;

    requestAttendanceChange({
      conductorId,
      date,
      requestedInTime,
      requestedOutTime,
      reason,
    });
    onClose();
    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setInTime('');
    setOutTime('');
    setReason('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Attendance Time Change">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="request-date" className="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input
            id="request-date" type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="request-in-time" className="block text-sm font-medium text-gray-300 mb-2">New In-Time</label>
              <input
                id="request-in-time" type="time" value={inTime} onChange={e => setInTime(e.target.value)} required
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="request-out-time" className="block text-sm font-medium text-gray-300 mb-2">New Out-Time (Optional)</label>
              <input
                id="request-out-time" type="time" value={outTime} onChange={e => setOutTime(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">Reason for Change</label>
          <textarea
            id="reason" value={reason} onChange={e => setReason(e.target.value)} required rows={3}
            className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g., Forgot to mark my attendance this morning."
          />
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Submit Request</Button>
        </div>
      </form>
    </Modal>
  );
};
export default RequestAttendanceChangeModal;
