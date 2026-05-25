
import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus, UserRole } from '../types';
import Card from './common/Card';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const TodayPresentConductors: React.FC = () => {
    const { users, attendance } = useAppContext();

    const todayStr = new Date().toISOString().split('T')[0];

    const presentConductors = useMemo(() => {
        const presentAttendance = attendance.filter(
            a => a.date === todayStr && a.status === AttendanceStatus.Present
        );

        const conductors = users.filter(u => u.role === UserRole.Conductor);

        return presentAttendance.map(att => {
            const conductor = conductors.find(c => c.id === att.conductorId);
            return {
                ...att,
                name: conductor?.name || 'Unknown Conductor',
                profilePhoto: conductor?.profilePhoto,
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [users, attendance, todayStr]);

    const formatTime = (isoString?: string) => {
        if (!isoString) return 'Not Marked';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ClockIcon />
                Today's Present VC Conductors
            </h3>
            {presentConductors.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {presentConductors.map(conductor => (
                        <div key={conductor.conductorId} className="bg-slate-700 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-600 flex-shrink-0 flex items-center justify-center">
                                    {conductor.profilePhoto ? (
                                        <img src={conductor.profilePhoto} alt={conductor.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon />
                                    )}
                                </div>
                                <p className="font-semibold text-white">{conductor.name}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2 pl-11 text-sm text-gray-300">
                                <span>In Time: <span className="font-medium text-green-400">{formatTime(conductor.inTime)}</span></span>
                                <span>Out Time: <span className="font-medium text-red-400">{formatTime(conductor.outTime)}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No VC conductors have marked their attendance as "Present" today.</p>
            )}
        </Card>
    );
};

export default TodayPresentConductors;
