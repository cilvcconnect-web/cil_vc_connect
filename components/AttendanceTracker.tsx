import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus, Attendance } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import RequestAttendanceChangeModal from './RequestAttendanceChangeModal';

interface AttendanceTrackerProps {
  conductorId: string;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ conductorId }) => {
  const { attendance, markInTime, markOutTime, markOnLeave } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const todaysAttendance = useMemo(() => {
    return attendance.find(a => a.conductorId === conductorId && a.date === todayStr);
  }, [attendance, conductorId, todayStr]);

  const conductorAttendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendance
      .filter(a => a.conductorId === conductorId)
      .forEach(a => {
        map.set(a.date, a);
      });
    return map;
  }, [attendance, conductorId]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.Present:
        return 'text-green-400';
      case AttendanceStatus.OnLeave:
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };
  
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    return (
      <div className="mt-6">
        <h4 className="font-semibold mb-3 text-lg">Attendance History</h4>
        <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={goToPreviousMonth} variant="secondary" className="px-3 py-1 text-sm">&lt;</Button>
                <h5 className="font-bold text-lg text-white">{monthName} {year}</h5>
                <Button onClick={goToNextMonth} variant="secondary" className="px-3 py-1 text-sm">&gt;</Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 font-semibold">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={`${day}-${i}`}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const record = conductorAttendanceMap.get(dateStr);
                    const isToday = isCurrentMonth && day === today.getDate();

                    let dayClasses = "h-10 w-10 flex items-center justify-center rounded-full text-sm transition-colors";
                    if (isToday) dayClasses += " border-2 border-cyan-500";
                    
                    if (record) {
                        dayClasses += " cursor-pointer hover:ring-2 hover:ring-cyan-400";
                    }

                    if (record?.status === AttendanceStatus.Present) {
                        dayClasses += " bg-green-500/30 text-green-100";
                    } else if (record?.status === AttendanceStatus.OnLeave) {
                        dayClasses += " bg-yellow-500/30 text-yellow-100";
                    } else {
                        dayClasses += " text-gray-200"
                    }

                    return (
                        <div key={day} className={dayClasses} title={record?.status} onClick={() => record && setSelectedRecord(record)}>
                            {day}
                        </div>
                    );
                })}
            </div>
             <div className="flex justify-center items-center gap-4 mt-4 pt-2 border-t border-slate-600 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500/30"></span>
                    <span className="text-gray-300">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500/30"></span>
                    <span className="text-gray-300">On Leave</span>
                </div>
            </div>
        </div>
      </div>
    );
  };


  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daily Attendance</h3>
        <Button variant="secondary" onClick={() => setIsChangeRequestModalOpen(true)}>
            Request Time Change
        </Button>
      </div>
      <div className="bg-slate-700 p-4 rounded-lg">
        <p className="font-semibold text-lg mb-2">
          Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {todaysAttendance ? (
          <div>
            <p className="text-gray-300">
              Today's Status:{' '}
              <span className={`font-bold ${getStatusColor(todaysAttendance.status)}`}>
                {todaysAttendance.status}
              </span>
            </p>
            {todaysAttendance.status === AttendanceStatus.Present && (
              <div className="mt-2 space-y-2">
                {todaysAttendance.inTime && <p className="text-gray-300">In Time: <span className="font-semibold text-white">{formatTime(todaysAttendance.inTime)}</span></p>}
                {todaysAttendance.outTime ? (
                  <p className="text-gray-300">Out Time: <span className="font-semibold text-white">{formatTime(todaysAttendance.outTime)}</span></p>
                ) : (
                  <Button onClick={() => markOutTime(conductorId)} className="mt-2">
                    Mark Out Time
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-3">You have not marked your attendance for today.</p>
            <div className="flex gap-4">
              <Button variant="success" onClick={() => markInTime(conductorId)}>
                Mark In Time
              </Button>
              <Button variant="secondary" onClick={() => markOnLeave(conductorId)}>
                Mark On Leave
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {renderCalendar()}

      {selectedRecord && (
        <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Attendance Details">
            <div className="space-y-3">
                <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-semibold text-lg">{new Date(selectedRecord.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className={`font-bold ${getStatusColor(selectedRecord.status)}`}>{selectedRecord.status}</p>
                </div>

                {selectedRecord.status === AttendanceStatus.Present && (
                    <>
                        <div>
                            <p className="text-sm text-gray-400">In Time</p>
                            <p className="font-semibold">{formatTime(selectedRecord.inTime)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Out Time</p>
                            <p className="font-semibold">{selectedRecord.outTime ? formatTime(selectedRecord.outTime) : 'Not Marked Yet'}</p>
                        </div>
                    </>
                )}
            </div>
            <div className="flex justify-end mt-6">
                <Button variant="secondary" onClick={() => setSelectedRecord(null)}>Close</Button>
            </div>
        </Modal>
      )}

      <RequestAttendanceChangeModal
        isOpen={isChangeRequestModalOpen}
        onClose={() => setIsChangeRequestModalOpen(false)}
        conductorId={conductorId}
       />

    </Card>
  );
};

export default AttendanceTracker;