
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VC, VCStatus } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import VCDetailsModal from './VCDetailsModal';
import EmergencyVCListModal from './EmergencyVCListModal';
import ContactSticker from './common/ContactSticker';
import LocationSticker from './common/LocationSticker';
import ReminderSettingsModal from './ReminderSettingsModal';
import UserSticker from './common/UserSticker';
import CalendarView from './CalendarView';
import CalendarIcon from './common/CalendarIcon';
import EditRoomDetailsModal from './EditRoomDetailsModal';
import { useNavigate } from 'react-router-dom';
import RoomUsageSection from './RoomUsageSection';
import { PREDEFINED_ROOMS } from '../constants';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.12 5.12c-.67.21-1.3.54-1.85.98l-1.68-.78c-1.45-.67-3.03.91-2.36 2.36l.78 1.68c-.44.55-.77 1.18-.98 1.85l-1.94.39c-1.56.38-1.56 2.6 0 2.98l1.94.39c.21.67.54 1.3.98 1.85l-.78 1.68c-.67 1.45.91 3.03 2.36 2.36l1.68-.78c.55.44 1.18.77 1.85.98l.39 1.94c.38 1.56 2.6 1.56 2.98 0l.39-1.94c.67-.21 1.3-.54 1.85-.98l1.68.78c1.45.67 3.03-.91 2.36-2.36l-.78-1.68c.44-.55.77-1.18-.98-1.85l1.94-.39c-1.56-.38-1.56-2.6 0-2.98l-1.94-.39c-.21-.67-.54-1.3-.98-1.85l.78-1.68c.67-1.45-.91-3.03-2.36-2.36l-1.68.78c-.55-.44-1.18-.77-1.85-.98L11.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const RoomIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 1a1 1 0 100 2h6a1 1 0 100-2H6zM6 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

// Room Card Component for RailTel Monitoring
const RoomCard: React.FC<{ vc: VC, onClick: () => void, isHighlighted?: boolean }> = ({ vc, onClick, isHighlighted }) => {
    let borderColor = 'border-blue-500';
    let bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    let textColor = 'text-blue-700 dark:text-blue-300';
    let isTechnicalIssue = vc.technicalIssue;

    if (isTechnicalIssue) {
        borderColor = 'border-red-600 animate-pulse ring-2 ring-red-400';
        bgColor = 'bg-red-100 dark:bg-red-900/40';
        textColor = 'text-red-800 dark:text-red-200';
    } else if (vc.status === VCStatus.InProgress) {
        borderColor = 'border-red-500 animate-pulse';
        bgColor = 'bg-red-50 dark:bg-red-900/20';
        textColor = 'text-red-700 dark:text-red-300';
    } else if (vc.status === VCStatus.Completed) {
        borderColor = 'border-green-500';
        bgColor = 'bg-green-50 dark:bg-green-900/20';
        textColor = 'text-green-700 dark:text-green-300';
    } else if (vc.status === VCStatus.Cancelled) {
        borderColor = 'border-gray-500';
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-600 dark:text-gray-400';
    } else if (vc.status === VCStatus.Postponed) {
        borderColor = 'border-purple-500';
        bgColor = 'bg-purple-50 dark:bg-purple-900/20';
        textColor = 'text-purple-700 dark:text-purple-300';
    }

    return (
        <div 
            id={`room-card-${vc.roomIp}`}
            onClick={onClick}
            className={`border-l-4 ${borderColor} ${bgColor} p-4 rounded-r-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex justify-between items-start ${isHighlighted ? 'ring-2 ring-cyan-500 scale-[1.02]' : ''}`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                     <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-2">{vc.subject}</h4>
                     {isTechnicalIssue && (
                         <span className="flex-shrink-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse flex items-center">
                             <AlertIcon /> TECHNICAL ISSUE
                         </span>
                     )}
                </div>
                
                {isTechnicalIssue && (
                    <div className="my-2 p-2 bg-red-200 dark:bg-red-800/50 rounded text-sm text-red-800 dark:text-red-100 font-bold border border-red-300 dark:border-red-700">
                        ISSUE: {vc.technicalIssueDescription}
                    </div>
                )}

                <p className={`text-sm font-bold uppercase tracking-wide ${textColor} mb-2`}>{vc.status}</p>
                
                <div className="space-y-1">
                     {/* Show Location - RailTel users should not see "Another Location" (non-predefined) */}
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Loc:</span>
                        <LocationSticker locations={vc.locations} hideNonPredefined={true} />
                    </div>

                    {vc.roomName && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Room:</span>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{vc.roomName}</span>
                        </div>
                    )}
                    {vc.buildingType && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Block:</span>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{vc.buildingType}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">IP:</span>
                        <span className="font-mono text-sm bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">
                            {vc.roomIp || 'Not Configured'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Conductor:</span>
                    {vc.conductorId ? (
                            <ContactSticker label="C" userId={vc.conductorId} />
                    ) : (
                            <span className="text-sm text-gray-500 italic">Unassigned</span>
                    )}
                </div>
            </div>
        </div>
    );
};


const RailTelDashboard: React.FC = () => {
  const { currentUser, vcs } = useAppContext();
  const navigate = useNavigate();
  
  const [selectedVc, setSelectedVc] = useState<VC | null>(null);
  const [vcToEditRoom, setVcToEditRoom] = useState<VC | null>(null);
  const [isEmergencyListOpen, setIsEmergencyListOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'monitor' | 'rooms' | 'details'>('monitor');
  const [vcViewMode, setVcViewMode] = useState<'list' | 'calendar'>('list');
  const [highlightedRoomIp, setHighlightedRoomIp] = useState<string | null>(null);
  
  // Track previous in-progress VCs to trigger notifications
  const prevInProgressIdsRef = useRef<Set<string>>(new Set());

  // RailTel sees all VCs but should primarily monitor technical rooms
  const allVCs = useMemo(() => {
    const predefinedNames = PREDEFINED_ROOMS.map(r => r.name);
    return [...vcs]
      // Filter out VCs that don't have at least one predefined room (technical locations)
      .filter(vc => vc.locations.some(loc => predefinedNames.includes(loc)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [vcs]);
  
  // Notification Logic
  useEffect(() => {
    const currentInProgressIds = new Set(
        allVCs.filter(vc => vc.status === VCStatus.InProgress).map(vc => vc.id)
    );

    // Check for newly started meetings
    currentInProgressIds.forEach(id => {
        if (!prevInProgressIdsRef.current.has(id)) {
            // New meeting started!
            const meeting = allVCs.find(v => v.id === id);
            if (meeting) {
                // Trigger immediate notification
                setTimeout(() => {
                     alert(`⚠️ ALERT: Meeting Started!\n\nSubject: ${meeting.subject}\nRoom IP: ${meeting.roomIp || 'N/A'}`);
                }, 500);
            }
        }
    });

    prevInProgressIdsRef.current = currentInProgressIds;
  }, [allVCs]);

  const handleRoomClickFromRealtimeStatus = (roomIp: string) => {
      setActiveView('rooms');
      setHighlightedRoomIp(roomIp);
      // Scroll to cards
      setTimeout(() => {
          const el = document.getElementById(`room-card-${roomIp}`);
          if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }, 100);
      
      // Clear highlight after a few seconds
      setTimeout(() => setHighlightedRoomIp(null), 3000);
  };

  const getStatusColor = (status: VCStatus) => {
    switch (status) {
      case VCStatus.Scheduled: return 'text-blue-600 dark:text-blue-400';
      case VCStatus.InProgress: return 'text-yellow-600 dark:text-yellow-400';
      case VCStatus.Completed: return 'text-green-600 dark:text-green-400';
      case VCStatus.Cancelled: return 'text-red-600 dark:text-red-400';
      case VCStatus.Postponed: return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">RailTel Master View</h2>
          <UserSticker user={currentUser} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => setIsEmergencyListOpen(true)} variant="secondary">
                View Emergency VCs
            </Button>
             <Button onClick={() => setIsSettingsModalOpen(true)} variant="secondary" className="px-3" title="Reminder Settings">
                <SettingsIcon />
            </Button>
        </div>
      </div>

      <RoomUsageSection onRoomClick={handleRoomClickFromRealtimeStatus} />

      {/* View Toggle */}
      <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-slate-600 pb-2 overflow-x-auto">
         <button 
            className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeView === 'monitor' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveView('monitor')}
        >
            Network Monitor
        </button>
        <button 
                className={`pb-2 px-4 font-semibold flex items-center gap-2 whitespace-nowrap ${activeView === 'rooms' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setActiveView('rooms')}
        >
            <RoomIcon />
            Room Status Cards
        </button>
        <button 
                className={`pb-2 px-4 font-semibold flex items-center gap-2 whitespace-nowrap ${activeView === 'details' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setActiveView('details')}
        >
            <PencilIcon />
            Room Details
        </button>
      </div>

      {activeView === 'rooms' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {allVCs.map(vc => (
                   <RoomCard 
                        key={vc.id} 
                        vc={vc} 
                        onClick={() => setSelectedVc(vc)}
                        isHighlighted={highlightedRoomIp === vc.roomIp}
                   />
               ))}
               {allVCs.length === 0 && <p className="text-gray-500 col-span-3 text-center">No managed technical rooms/meetings active.</p>}
           </div>
      )}

      {activeView === 'monitor' && (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Network Operations Monitor (Technical Rooms)</h3>
                <Button onClick={() => setVcViewMode(vcViewMode === 'list' ? 'calendar' : 'list')} variant="secondary">
                {vcViewMode === 'list' ? <CalendarIcon /> : <ListIcon />}
                {vcViewMode === 'list' ? 'Calendar View' : 'List View'}
                </Button>
            </div>
            
            {vcViewMode === 'list' ? (
                <div className="space-y-4">
                {allVCs.length > 0 ? allVCs.map(vc => (
                    <div key={vc.id} className={`bg-white border border-gray-200 dark:border-transparent dark:bg-slate-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300 ${vc.technicalIssue ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}>
                    <div>
                        <div className="flex items-center gap-2">
                             <p className="font-bold text-lg text-gray-900 dark:text-white">{vc.subject}</p>
                             {vc.technicalIssue && (
                                 <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                                     <AlertIcon /> TECHNICAL ISSUE
                                 </span>
                             )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                        Scheduled: {new Date(vc.startTime).toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <ContactSticker label="Manager" userId={vc.managerId} />
                            <ContactSticker label="Authority" userId={vc.reportingAuthorityId} />
                            {vc.conductorId ? (
                                <ContactSticker label="Conductor" userId={vc.conductorId} />
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300">
                                    Unassigned
                                </span>
                            )}
                        </div>
                        <LocationSticker locations={vc.locations} className="mt-2" hideNonPredefined={true} />
                        
                        {vc.technicalIssue && (
                            <div className="my-2 p-2 bg-red-200 dark:bg-red-800/50 rounded text-sm text-red-800 dark:text-red-100 font-bold border border-red-300 dark:border-red-700">
                                ISSUE: {vc.technicalIssueDescription}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 mt-2 items-center">
                            <p className={`text-sm font-semibold ${getStatusColor(vc.status)}`}>{vc.status}</p>
                            {vc.roomIp && <span className="text-xs bg-gray-700 text-gray-200 px-2 py-0.5 rounded font-mono">IP: {vc.roomIp}</span>}
                            {vc.roomName && <span className="text-xs bg-gray-700 text-gray-200 px-2 py-0.5 rounded">Room: {vc.roomName}</span>}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 self-start md:self-center">
                        <Button variant="secondary" onClick={() => setSelectedVc(vc)}>Technical Details</Button>
                    </div>
                    </div>
                )) : <p className="text-gray-500 dark:text-gray-400">No managed technical VCs found in the system.</p>}
                </div>
            ) : (
                <CalendarView vcs={allVCs} />
            )}
        </Card>
      )}

      {activeView === 'details' && (
          <Card>
              <h3 className="text-xl font-semibold mb-4">Technical Room Configuration</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead>
                          <tr className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                              <th className="p-3">Meeting Subject</th>
                              <th className="p-3">Primary Room / Location</th>
                              <th className="p-3">IP Address</th>
                              <th className="p-3">Building Type</th>
                              <th className="p-3 text-center">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                          {allVCs.map(vc => (
                              <tr key={vc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                  <td className="p-3 font-medium text-gray-900 dark:text-white max-w-xs truncate" title={vc.subject}>
                                      {vc.subject}
                                  </td>
                                  <td className="p-3 text-gray-700 dark:text-gray-300">
                                      {vc.roomName || <span className="text-gray-400 italic">N/A</span>}
                                  </td>
                                  <td className="p-3 font-mono text-gray-700 dark:text-gray-300">
                                      {vc.roomIp || <span className="text-gray-400 italic">N/A</span>}
                                  </td>
                                  <td className="p-3 text-gray-700 dark:text-gray-300">
                                      {vc.buildingType || <span className="text-gray-400 italic">N/A</span>}
                                  </td>
                                  <td className="p-3 text-center">
                                      <Button 
                                        variant="secondary" 
                                        onClick={() => setVcToEditRoom(vc)} 
                                        className="px-3 py-1 text-xs"
                                      >
                                          <PencilIcon /> Edit
                                      </Button>
                                  </td>
                              </tr>
                          ))}
                          {allVCs.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="p-4 text-center text-gray-500">No technical rooms available to edit.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </Card>
      )}

      <VCDetailsModal vc={selectedVc} onClose={() => setSelectedVc(null)} />
      <EditRoomDetailsModal vc={vcToEditRoom} onClose={() => setVcToEditRoom(null)} />
      <EmergencyVCListModal isOpen={isEmergencyListOpen} onClose={() => setIsEmergencyListOpen(false)} />
      <ReminderSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} user={currentUser} />
    </div>
  );
};

export default RailTelDashboard;
