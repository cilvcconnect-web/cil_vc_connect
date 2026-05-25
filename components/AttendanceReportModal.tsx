
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import { exportAttendanceToCSV } from '../utils/export';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({ isOpen, onClose }) => {
  const { users, attendance, currentUser } = useAppContext();
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedConductorId, setSelectedConductorId] = useState('all');

  const conductors = useMemo(() => users.filter(u => u.role === UserRole.Conductor), [users]);

  // Determine which records to show based on user role and filters
  const filteredData = useMemo(() => {
    if (!currentUser) return [];

    let data = attendance.filter(record => {
        return record.date >= startDate && record.date <= endDate;
    });

    if (currentUser.role === UserRole.Conductor) {
        // Conductor sees only their own data
        data = data.filter(record => record.conductorId === currentUser.id);
    } else if (currentUser.role === UserRole.ReportingAuthority || currentUser.role === UserRole.Manager) {
        // RA/Manager can filter
        if (selectedConductorId !== 'all') {
            data = data.filter(record => record.conductorId === selectedConductorId);
        }
    }

    // Sort by date descending
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, startDate, endDate, selectedConductorId, currentUser]);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';
  
  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleExportCSV = () => {
      const filename = `Attendance_Report_${startDate}_to_${endDate}.csv`;
      exportAttendanceToCSV(filteredData, users, filename);
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('attendance-report-table');
    if (input) {
      try {
          const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.setFontSize(18);
          pdf.text("Attendance Report", 14, 20);
          pdf.setFontSize(10);
          pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
          pdf.text(`Period: ${startDate} to ${endDate}`, 14, 34);

          // Add image below text
          pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, pdfHeight);
          pdf.save(`Attendance_Report_${startDate}_to_${endDate}.pdf`);
      } catch (err) {
          console.error("PDF Export failed", err);
          alert("Failed to generate PDF");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attendance Report">
      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 dark:bg-slate-700 p-4 rounded-lg">
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">From Date</label>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="w-full p-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">To Date</label>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="w-full p-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
            </div>
            {(currentUser?.role === UserRole.ReportingAuthority || currentUser?.role === UserRole.Manager) && (
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Filter by Conductor</label>
                    <select
                        value={selectedConductorId}
                        onChange={e => setSelectedConductorId(e.target.value)}
                        className="w-full p-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Conductors</option>
                        {conductors.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
             <Button onClick={handleExportCSV} variant="success" className="flex-1" disabled={filteredData.length === 0}>
                Export Excel (CSV)
             </Button>
             <Button onClick={handleExportPDF} variant="primary" className="flex-1" disabled={filteredData.length === 0}>
                Export PDF
             </Button>
        </div>

        {/* Preview Table */}
        <div className="mt-4 border rounded-lg overflow-hidden border-gray-200 dark:border-slate-600">
            <div className="max-h-[40vh] overflow-y-auto">
                <div id="attendance-report-table" className="bg-white dark:bg-slate-800 p-2 min-w-full">
                    {/* Header for PDF capture specifically to ensure it looks okay on white background */}
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold uppercase text-xs sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Conductor</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">In Time</th>
                                <th className="px-4 py-3">Out Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredData.length > 0 ? filteredData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-2 text-gray-900 dark:text-white">{row.date}</td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{getUserName(row.conductorId)}</td>
                                    <td className={`px-4 py-2 font-bold ${
                                        row.status === 'Present' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>{row.status}</td>
                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 font-mono">{formatTime(row.inTime)}</td>
                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 font-mono">{formatTime(row.outTime)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        No records found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default AttendanceReportModal;
