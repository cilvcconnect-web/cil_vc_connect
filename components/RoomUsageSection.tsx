
import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VCStatus, UserRole } from '../types';
import { PREDEFINED_ROOMS } from '../constants';
import Card from './common/Card';
import ContactSticker from './common/ContactSticker';

const LivePulse = () => (
    <span className="relative flex h-2 w-2 mr-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
);

interface RoomUsageSectionProps {
    onRoomClick?: (roomIp: string) => void;
}

const RoomUsageSection: React.FC<RoomUsageSectionProps> = ({ onRoomClick }) => {
    const { vcs } = useAppContext();

    const activeRooms = useMemo(() => {
        return vcs.filter(vc => vc.status === VCStatus.InProgress && (vc.roomIp || vc.roomName));
    }, [vcs]);

    const roomsStatus = useMemo(() => {
        return PREDEFINED_ROOMS.map(preRoom => {
            const activeVC = activeRooms.find(vc => vc.roomIp === preRoom.ip || vc.roomName === preRoom.name);
            return {
                ...preRoom,
                isActive: !!activeVC,
                isTechnicalIssue: activeVC?.technicalIssue || false,
                issueDescription: activeVC?.technicalIssueDescription,
                vc: activeVC
            };
        });
    }, [activeRooms]);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3 animate-pulse"></div>
                    Satellite Terminals
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mr-2"></span> Standby
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span> Active
                    </div>
                </div>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar px-1">
                {roomsStatus.map((room) => (
                    <div 
                        key={room.ip} 
                        onClick={() => onRoomClick?.(room.ip)}
                        className={`flex-shrink-0 w-60 p-5 rounded-[2rem] border transition-all duration-500 relative group ${
                            onRoomClick ? 'cursor-pointer' : ''
                        } ${
                            room.isTechnicalIssue
                            ? 'bg-red-100/50 dark:bg-red-900/20 border-red-500'
                            : room.isActive 
                            ? 'bg-white dark:bg-slate-900 border-red-500/30 shadow-lg shadow-red-500/5 scale-105 z-10' 
                            : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-white/5 opacity-80 hover:opacity-100'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase truncate pr-2 tracking-tighter">{room.name}</h4>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600">{room.ip}</span>
                            </div>
                            {room.isActive ? <LivePulse /> : <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 mr-2"></div>}
                        </div>

                        {room.isActive && room.vc ? (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
                                    "{room.vc.subject}"
                                </p>
                                
                                {room.isTechnicalIssue && (
                                    <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20 text-[9px] font-bold text-red-600 dark:text-red-400 animate-pulse">
                                        SYSTEM ALERT: {room.issueDescription?.substring(0, 20)}...
                                    </div>
                                )}

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <ContactSticker label="VC" userId={room.vc.conductorId} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">
                                READY_TO_LINK
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RoomUsageSection;
