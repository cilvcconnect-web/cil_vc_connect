import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceChangeRequestStatus } from '../types';
import Card from './common/Card';
import Button from './common/Button';

const AttendanceChangeRequests: React.FC = () => {
  const { attendanceChangeRequests, approveAttendanceChange, rejectAttendanceChange, getUserById } = useAppContext();
  
  const pendingRequests = attendanceChangeRequests.filter(
    req => req.status === AttendanceChangeRequestStatus.Pending
  );

  if (pendingRequests.length === 0) {
    return null; // Don't render anything if there are no pending requests
  }
  
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return (
    <Card>
      <h3 className="text-xl font-semibold mb-4 text-yellow-400">Pending Attendance Change Requests</h3>
      <div className="space-y-4">
        {pendingRequests.map(req => {
          const conductor = getUserById(req.conductorId);
          return (
            <div key={req.id} className="bg-slate-700 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <p className="font-bold">{conductor?.name || 'Unknown Conductor'}</p>
                        <p className="text-sm text-gray-400">
                            Date: {new Date(req.date + 'T00:00:00').toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                            Requested Times: 
                            <span className="font-semibold text-green-400 ml-2">{formatTime(req.requestedInTime)}</span> - 
                            <span className="font-semibold text-red-400 ml-1">{formatTime(req.requestedOutTime)}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-center mt-2 md:mt-0">
                        <Button variant="success" onClick={() => approveAttendanceChange(req.id)}>Approve</Button>
                        <Button variant="danger" onClick={() => rejectAttendanceChange(req.id)}>Reject</Button>
                    </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-600">
                    <p className="text-sm text-gray-400">Reason:</p>
                    <p className="text-sm text-gray-200 italic">"{req.reason}"</p>
                </div>
            </div>
          )
        })}
      </div>
    </Card>
  );
};

export default AttendanceChangeRequests;
