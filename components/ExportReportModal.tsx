import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { VC, User } from '../types';
import { exportVCsToCSV } from '../utils/export';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vcs: VC[];
  users: User[];
  managerName: string;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose, vcs, users, managerName }) => {
  const getISODateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(getISODateString(firstDayOfMonth));
  const [endDate, setEndDate] = useState(getISODateString(today));

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert('Please select both a start and end date.');
      return;
    }
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    if (end < start) {
      alert('End date cannot be before the start date.');
      return;
    }

    const filteredVCs = vcs.filter(vc => {
      const vcStartTime = new Date(vc.startTime);
      return vcStartTime >= start && vcStartTime <= end;
    });

    if (filteredVCs.length === 0) {
      alert('No VCs found in the selected date range.');
      return;
    }
    
    // Sort VCs by start time chronologically for the report
    const sortedVCs = filteredVCs.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const filename = `CIL_VC_Report_${managerName.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;
    exportVCsToCSV(sortedVCs, users, filename);
    onClose();
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export VC Report">
      <div className="space-y-4">
        <p className="text-gray-300">Select a date range to export the VC report.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport}>
          Download Report
        </Button>
      </div>
    </Modal>
  );
};

export default ExportReportModal;