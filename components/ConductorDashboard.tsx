
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { VC, VCStatus } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import VCDetailsModal from './VCDetailsModal';
import EmergencyVCModal from './EmergencyVCModal';
import Modal from './common/Modal';
import EmergencyVCListModal from './EmergencyVCListModal';
import ContactSticker from './common/ContactSticker';
import LocationSticker from './common/LocationSticker';
import ReminderSettingsModal from './ReminderSettingsModal';
import UserSticker from './common/UserSticker';
import { exportVCsToCSV } from '../utils/export';
import AttendanceTracker from './AttendanceTracker';
import EditVCLocationsModal from './EditVCLocationsModal';
import CalendarView from './CalendarView';
import CalendarIcon from './common/CalendarIcon';
import PostponeVCModal from './PostponeVCModal';
import AttendanceReportModal from './AttendanceReportModal';
import ReportIssueModal from './ReportIssueModal';
import OldVCListModal from './OldVCListModal';
import PauseSticker from './common/PauseSticker';
import RoomUsageSection from './RoomUsageSection';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.12 5.12c-.67.21-1.3.54-1.85.98l-1.68-.78c-1.45-.67-3.03.91-2.36 2.36l.78 1.68c-.44.55-.77 1.18-.98 1.85l-1.94.39c-1.56.38-1.56 2.6 0 2.98l1.94.39c.21.67.54 1.3.98 1.85l-.78 1.68c-.67 1.45.91 3.03 2.36 2.36l1.68-.78c.55.44 1.18.77 1.85.98l.39 1.94c.38 1.56 2.6 1.56 2.98 0l.39-1.94c.67-.21 1.3-.54 1.85-.98l1.68.78c1.45.67 3.03-.91 2.36-2.36l-.78-1.68c.44-.55.77-1.18-.98-1.85l1.94-.39c-1.56-.38-1.56-2.6 0-2.98l-1.94-.39c-.21-.67-.54-1.3-.98-1.85l.78-1.68c.67-1.45-.91-3.03-2.36-2.36l-1.68.78c-.55-.44-1.18-.77-1.85-.98L11.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
    </svg>
);

const VCIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
    </svg>
);

const AttendanceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ReportsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 1a1 1 0 100 2h6a1 1 0 100-2H6zM6 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const WrenchIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.12 5.12c-.67.21-1.3.54-1.85.98l-1.68-.78c-1.45-.67-3.03.91-2.36 2.36l.78 1.68c-.44.55-.77 1.18-.98 1.85l-1.94.39c-1.56.38-1.56 2.6 0 2.98l1.94.39c.21.67.54 1.3.98 1.85l-.78 1.68c-.67 1.45.91 3.03 2.36 2.36l1.68-.78c.55.44 1.18.77 1.85.98l.39 1.94c.38 1.56 2.6 1.56 2.98 0l.39-1.94c.67-.21 1.3-.54 1.85-.98l1.68.78c1.45.67 3.03-.91 2.36-2.36l-.78-1.68c.44-.55.77-1.18-.98-1.85l1.94-.39c-1.56-.38-1.56-2.6 0-2.98l-1.94-.39c-.21-.67-.54-1.3-.98-1.85l.78-1.68c.67-1.45-.91-3.03-2.36-2.36l-1.68.78c-.55-.44-1.18-.77-1.85-.98L11.49 3.17z" clipRule="evenodd" />
    </svg>
);


type ActiveView = 'vcs' | 'attendance' | 'reports';

interface OptionStickerProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const OptionSticker: React.FC<OptionStickerProps> = ({ icon, label, isActive, onClick }) => {
  const baseClasses = "flex-1 flex items-center justify-center p-4 rounded-lg font-semibold transition-all duration-300 ease-in-out cursor-pointer text-center border";
  const activeClasses = "bg-cyan-600 text-white shadow-lg scale-105 border-cyan-600";
  const inactiveClasses = "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-slate-600 dark:hover:text-white";

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};


const ConductorDashboard: React.FC = () => {
  const { currentUser, vcs, users, updateVCStatus, cancelVC } = useAppContext();
  const navigate = useNavigate();
  
  const [activeView, setActiveView] = useState<ActiveView>('vcs');
  const [vcViewMode, setVcViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedVc, setSelectedVc] = useState<VC | null>(null);
  const [vcToComplete, setVcToComplete] = useState<VC | null>(null);
  const [vcToEditLocations, setVcToEditLocations] = useState<VC | null>(null);
  const [vcToPostpone, setVcToPostpone] = useState<VC | null>(null);
  const [vcToReport, setVcToReport] = useState<VC | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isEmergencyListOpen, setIsEmergencyListOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAttendanceReportModalOpen, setIsAttendanceReportModalOpen] = useState(false);
  const [isOldVCListOpen, setIsOldVCListOpen] = useState(false);

  const conductorVCs = useMemo(() => {
    if (!currentUser) return [];
    return vcs.filter(vc => vc.conductorId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, vcs]);
  
  const activeConductorVCs = useMemo(() => {
    return conductorVCs.filter(vc => vc.status !== VCStatus.Completed && vc.status !== VCStatus.Cancelled);
  }, [conductorVCs]);
  
  const handleExport = () => {
    const filename = `CIL_VC_Export_Conductor_${currentUser?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    exportVCsToCSV(conductorVCs, users, filename);
  };

  const handleStartVC = (vcId: string) => {
    updateVCStatus(vcId, VCStatus.InProgress);
  };
  
  const handleCompleteVC = () => {
    if (vcToComplete) {
      updateVCStatus(vcToComplete.id, VCStatus.Completed, remarks);
      setVcToComplete(null);
      setRemarks('');
    }
  };

  const handleCancelVC = (vcId: string) => {
      if (window.confirm("Are you sure you want to cancel this meeting?")) {
          cancelVC(vcId);
      }
  }

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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Conductor Dashboard</h2>
          <UserSticker user={currentUser} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => navigate('/salary')} variant="success">
               Salary Portal
            </Button>
            <Button onClick={() => setIsOldVCListOpen(true)} variant="secondary">
                <HistoryIcon />
                Old VCs
            </Button>
            <Button onClick={() => setIsEmergencyListOpen(true)} variant="secondary">
                View Emergency VCs
            </Button>
            <Button variant="danger" onClick={() => setIsEmergencyModalOpen(true)}>
                Schedule Emergency VC
            </Button>
            <Button onClick={() => setIsSettingsModalOpen(true)} variant="secondary" className="px-3" title="Reminder Settings">
                <SettingsIcon />
            </Button>
        </div>
      </div>

      <RoomUsageSection />

      <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-6">
        <OptionSticker
          icon={<VCIcon />}
          label="Allocated VCs"
          isActive={activeView === 'vcs'}
          onClick={() => setActiveView('vcs')}
        />
        <OptionSticker
          icon={<AttendanceIcon />}
          label="Attendance"
          isActive={activeView === 'attendance'}
          onClick={() => setActiveView('attendance')}
        />
        <OptionSticker
          icon={<ReportsIcon />}
          label="Reports"
          isActive={activeView === 'reports'}
          onClick={() => setActiveView('reports')}
        />
      </div>
      
      {activeView === 'vcs' && (
         <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Your Assigned VCs</h3>
                <Button onClick={() => setVcViewMode(vcViewMode === 'list' ? 'calendar' : 'list')} variant="secondary">
                  {vcViewMode === 'list' ? <CalendarIcon /> : <ListIcon />}
                  {vcViewMode === 'list' ? 'Calendar View' : 'List View'}
                </Button>
            </div>
            {vcViewMode === 'list' ? (
                <div className="space-y-4">
                {activeConductorVCs.length > 0 ? activeConductorVCs.map(vc => (
                    <div key={vc.id} className="bg-white border border-gray-200 dark:border-transparent dark:bg-slate-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300">
                    <div>
                        <div className="flex items-center gap-2">
                             <p className="font-bold text-lg text-gray-900 dark:text-white">{vc.subject}</p>
                             {vc.technicalIssue && (
                                 <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                                     TECHNICAL ISSUE
                                 </span>
                             )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                        Scheduled: {new Date(vc.startTime).toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <ContactSticker label="Manager" userId={vc.managerId} />
                            <ContactSticker label="Authority" userId={vc.reportingAuthorityId} />
                            {(vc.status === VCStatus.Scheduled || vc.status === VCStatus.InProgress) && (
                                <PauseSticker onClick={() => setVcToPostpone(vc)} />
                            )}
                        </div>
                        <LocationSticker locations={vc.locations} className="mt-2" />
                        <p className={`text-sm font-semibold mt-2 ${getStatusColor(vc.status)}`}>{vc.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 self-start md:self-center">
                        <Button variant="secondary" onClick={() => setSelectedVc(vc)}>Details</Button>
                        
                        {(vc.status === VCStatus.Scheduled || vc.status === VCStatus.InProgress) && (
                            <>
                                <Button variant="secondary" onClick={() => setVcToEditLocations(vc)}>Edit Locations</Button>
                                {/* Technical Help Sticker/Button */}
                                <button
                                    onClick={() => setVcToReport(vc)}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-sm transition-colors ${
                                        vc.technicalIssue 
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg ring-2 ring-green-400' 
                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                    }`}
                                >
                                    {vc.technicalIssue ? (
                                        <>
                                            <WrenchIcon /> Resolve Issue
                                        </>
                                    ) : (
                                        <>
                                            <AlertIcon /> Technical Help
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        
                        {vc.status === VCStatus.Scheduled && (
                            <>
                                <Button variant="success" onClick={() => handleStartVC(vc.id)}>Start VC</Button>
                                <Button variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setVcToPostpone(vc)}>Postpone</Button>
                                <Button variant="danger" onClick={() => handleCancelVC(vc.id)}>Cancel</Button>
                            </>
                        )}
                        {vc.status === VCStatus.InProgress && (
                        <Button variant="primary" onClick={() => setVcToComplete(vc)}>Complete VC</Button>
                        )}
                    </div>
                    </div>
                )) : <p className="text-gray-500 dark:text-gray-400">You have no upcoming VCs.</p>}
                </div>
            ) : (
                <CalendarView vcs={activeConductorVCs} />
            )}
          </Card>
      )}

      {activeView === 'attendance' && currentUser && <AttendanceTracker conductorId={currentUser.id} />}

      {activeView === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
            <h3 className="text-xl font-semibold mb-2">My VC Report</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Export a list of all VCs assigned to you.</p>
            <Button onClick={handleExport} variant="secondary">
                <ExportIcon />
                Export VCs (CSV)
            </Button>
            </Card>

            <Card>
                <h3 className="text-xl font-semibold mb-2">My Attendance Report</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Generate and export your attendance history.</p>
                <Button onClick={() => setIsAttendanceReportModalOpen(true)} variant="secondary">
                    <ExportIcon />
                    Generate Report (PDF/Excel)
                </Button>
            </Card>
        </div>
      )}
     
      <VCDetailsModal vc={selectedVc} onClose={() => setSelectedVc(null)} />
      <EditVCLocationsModal vc={vcToEditLocations} onClose={() => setVcToEditLocations(null)} />
      <PostponeVCModal vc={vcToPostpone} onClose={() => setVcToPostpone(null)} />
      <EmergencyVCModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} />
      <EmergencyVCListModal isOpen={isEmergencyListOpen} onClose={() => setIsEmergencyListOpen(false)} />
      <ReminderSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} user={currentUser} />
      <AttendanceReportModal isOpen={isAttendanceReportModalOpen} onClose={() => setIsAttendanceReportModalOpen(false)} />
      <ReportIssueModal vc={vcToReport} onClose={() => setVcToReport(null)} />
      <OldVCListModal 
        isOpen={isOldVCListOpen} 
        onClose={() => setIsOldVCListOpen(false)} 
        vcs={conductorVCs} 
      />

      <Modal isOpen={!!vcToComplete} onClose={() => setVcToComplete(null)} title="Complete VC">
        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Remarks (Optional)
          </label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g., Meeting concluded successfully."
          />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="secondary" onClick={() => setVcToComplete(null)}>Cancel</Button>
          <Button onClick={handleCompleteVC}>Confirm Completion</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ConductorDashboard;
