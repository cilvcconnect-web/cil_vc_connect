import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { useAppContext } from '../hooks/useAppContext';
import { Attendance } from '../types';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceRecord: Attendance | null;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ isOpen, onClose, attendanceRecord }) => {
  const { updateAttendanceRecord, getUserById } = useAppContext();
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');

  const formatISOToTime = (isoString?: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  const formatTimeToISO = (dateStr: string, timeStr: string): string | undefined => {
      if (!dateStr || !timeStr) return undefined;
      const [hours, minutes] = timeStr.split(':');
      const dateObj = new Date(dateStr + 'T00:00:00');
      dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return dateObj.toISOString();
  }

  useEffect(() => {
    if (attendanceRecord) {
      setInTime(formatISOToTime(attendanceRecord.inTime));
      setOutTime(formatISOToTime(attendanceRecord.outTime));
    }
  }, [attendanceRecord]);

  const handleSave = () => {
    if (!attendanceRecord) return;
    
    const newInTimeISO = formatTimeToISO(attendanceRecord.date, inTime);
    const newOutTimeISO = formatTimeToISO(attendanceRecord.date, outTime);
    
    updateAttendanceRecord(attendanceRecord.conductorId, attendanceRecord.date, newInTimeISO, newOutTimeISO);
    onClose();
  };

  if (!attendanceRecord) return null;
  const conductor = getUserById(attendanceRecord.conductorId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Attendance for ${conductor?.name || ''}`}>
      <div className="space-y-4">
        <p className="font-semibold">Date: {new Date(attendanceRecord.date + 'T00:00:00').toLocaleDateString()}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-in-time" className="block text-sm font-medium text-gray-300 mb-2">In-Time</label>
              <input
                id="edit-in-time" type="time" value={inTime} onChange={e => setInTime(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="edit-out-time" className="block text-sm font-medium text-gray-300 mb-2">Out-Time</label>
              <input
                id="edit-out-time" type="time" value={outTime} onChange={e => setOutTime(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  );
};
export default EditAttendanceModal;
