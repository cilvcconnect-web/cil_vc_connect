
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VCStatus, UserRole } from '../types';
import { PREDEFINED_ROOMS } from '../constants';
import Card from './common/Card';
import ContactSticker from './common/ContactSticker';
import GlowingIP from './common/GlowingIP';
import Modal from './common/Modal';

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
    const { vcs, users } = useAppContext();
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

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
                        onClick={() => {
                            setSelectedRoom(room);
                            onRoomClick?.(room.ip);
                        }}
                        className={`flex-shrink-0 w-60 p-5 rounded-[2rem] border transition-all duration-500 relative group cursor-pointer ${
                            room.isTechnicalIssue
                            ? 'bg-red-100/50 dark:bg-red-900/20 border-red-500'
                            : room.isActive 
                            ? 'bg-white dark:bg-slate-900 border-red-500/30 shadow-lg shadow-red-500/5 scale-105 z-10' 
                            : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-white/5 opacity-80 hover:opacity-100'
                        }`}
                        id={`satellite-card-${room.ip.replace(/\./g, '-')}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase truncate pr-2 tracking-tighter">{room.name}</h4>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600 mt-1">
                                    <GlowingIP ip={room.ip} />
                                </span>
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

            {/* Custom Satellite Room popup Modal */}
            {selectedRoom && (
                <Modal 
                    isOpen={!!selectedRoom} 
                    onClose={() => setSelectedRoom(null)} 
                    title="Satellite Terminal Room Detail"
                >
                    <div className="space-y-5" id="satellite-room-modal-content">
                        {/* Header: Room Name & IP */}
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Terminal Name</h3>
                                <h4 className="font-black text-gray-900 dark:text-white text-base tracking-tight">{selectedRoom.name}</h4>
                            </div>
                            <div className="text-right">
                                <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 text-right">System IP</h3>
                                <div className="mt-1">
                                    <GlowingIP ip={selectedRoom.ip} />
                                </div>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="space-y-4">
                            {selectedRoom.isActive && selectedRoom.vc ? (
                                <div className="space-y-4">
                                    {/* Active Alert Flag */}
                                    <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-red-500 font-black text-xs uppercase tracking-widest">
                                            <span className="flex h-2.5 w-2.5 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                            Ongoing Meeting Session
                                        </div>
                                        <span className="bg-red-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                                            CONNECTED
                                        </span>
                                    </div>

                                    {/* Technical Issue Banner */}
                                    {selectedRoom.isTechnicalIssue && (
                                        <div className="bg-rose-500/10 border-2 border-rose-500 text-rose-700 dark:text-rose-400 p-4 rounded-2xl space-y-1.5 animate-pulse">
                                            <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-rose-600 dark:text-rose-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                                </svg>
                                                Technical Issue Reported
                                            </div>
                                            <p className="text-xs font-bold leading-relaxed italic bg-black/5 dark:bg-black/25 p-3 rounded-lg">
                                                {`"${selectedRoom.issueDescription || 'No diagnostic comments left by conductor'}"`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Meeting Details Card */}
                                    <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-white dark:bg-slate-900/50 space-y-3 shadow-sm">
                                        <div>
                                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Subject / Agenda</span>
                                            <h5 className="font-extrabold text-sm text-gray-950 dark:text-white mt-0.5">
                                                {selectedRoom.vc.subject}
                                            </h5>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                            <div>
                                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Scheduled Time</span>
                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                                                    {new Date(selectedRoom.vc.startTime).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Building Type</span>
                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                                                    {selectedRoom.vc.buildingType || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-1">Geofenced Locations</span>
                                            {selectedRoom.vc.locations && selectedRoom.vc.locations.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedRoom.vc.locations.map((loc: string, idx: number) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase rounded">
                                                            {loc}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs font-semibold italic text-slate-400">None Linked</span>
                                            )}
                                        </div>

                                        {/* Conductor Contact Sticker style */}
                                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-1.5">Conductor Assigned</span>
                                            <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                                <ContactSticker label="VC Conductor" userId={selectedRoom.vc.conductorId} />
                                                {(() => {
                                                    const cUser = users?.find((u: any) => u.id === selectedRoom.vc.conductorId);
                                                    if (cUser) {
                                                        return (
                                                            <div className="mt-1.5 pl-9 text-[11px] font-medium text-slate-400">
                                                                Contact Phone: <span className="text-slate-700 dark:text-slate-300 font-bold">{cUser.phoneNumber}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>

                                        {/* Joint Links */}
                                        {(selectedRoom.vc.link || selectedRoom.vc.pptLink) && (
                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                {selectedRoom.vc.link && (
                                                    <a 
                                                        href={selectedRoom.vc.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="bg-cyan-650 hover:bg-cyan-600 bg-cyan-600 text-white font-black uppercase text-center py-2.5 rounded-xl transition-all tracking-wider"
                                                    >
                                                        Join Webex ↗
                                                    </a>
                                                )}
                                                {selectedRoom.vc.pptLink && (
                                                    <a 
                                                        href={selectedRoom.vc.pptLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="bg-purple-650 hover:bg-purple-600 bg-purple-600 text-white font-black uppercase text-center py-2.5 rounded-xl transition-all tracking-wider"
                                                    >
                                                        Docs/Slides ↗
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl text-center space-y-3">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="font-black text-sm uppercase tracking-wide text-gray-900 dark:text-white">Active Standby Mode</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                            Terminal is available and online. No active meeting sessions scheduled or running in this room at this moment.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="flex justify-end pt-2">
                            <button 
                                type="button"
                                onClick={() => setSelectedRoom(null)}
                                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </section>
    );
};

export default RoomUsageSection;
