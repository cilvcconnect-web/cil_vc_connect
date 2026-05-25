import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, Attendance, User } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import EditAttendanceModal from './EditAttendanceModal';

const ConductorAttendanceReport: React.FC = () => {
    const { users, attendance } = useAppContext();
    const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
    const [selectedConductorId, setSelectedConductorId] = useState<string>('all');
    
    const conductors = useMemo(() => users.filter(u => u.role === UserRole.Conductor), [users]);

    const filteredAttendance = useMemo(() => {
        return attendance
            .filter(a => selectedConductorId === 'all' || a.conductorId === selectedConductorId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, selectedConductorId]);

    const formatTime = (isoString?: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

    return (
        <Card>
            <h3 className="text-2xl font-bold mb-4">Conductor Attendance Report</h3>
            <div className="mb-4">
                <label htmlFor="conductor-filter" className="block text-sm font-medium text-gray-300 mb-2">Filter by Conductor</label>
                <select
                    id="conductor-filter"
                    value={selectedConductorId}
                    onChange={e => setSelectedConductorId(e.target.value)}
                    className="w-full md:w-1/3 p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="all">All Conductors</option>
                    {conductors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {filteredAttendance.length > 0 ? filteredAttendance.map(record => (
                    <div key={`${record.conductorId}-${record.date}`} className="bg-slate-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <p className="font-bold text-lg">{getUserName(record.conductorId)}</p>
                            <p className="text-sm text-gray-400">{new Date(record.date + 'T00:00:00').toLocaleDateString()}</p>
                            {record.status === 'Present' ? (
                                <p className="text-sm text-gray-300 mt-1">
                                    <span className="font-semibold text-green-400">{formatTime(record.inTime)}</span> - 
                                    <span className="font-semibold text-red-400 ml-1">{formatTime(record.outTime)}</span>
                                </p>
                            ) : (
                                <p className="font-semibold text-yellow-400 mt-1">{record.status}</p>
                            )}
                        </div>
                        <Button variant="secondary" onClick={() => setSelectedRecord(record)}>Edit</Button>
                    </div>
                )) : <p className="text-gray-400">No attendance records found for the selected filter.</p>}
            </div>

            <EditAttendanceModal 
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                attendanceRecord={selectedRecord}
            />
        </Card>
    );
};

export default ConductorAttendanceReport;
