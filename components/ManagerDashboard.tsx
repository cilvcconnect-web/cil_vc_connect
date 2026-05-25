
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { VC, VCStatus } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import VCDetailsModal from './VCDetailsModal';
import EditVCConductorModal from './EditVCConductorModal';
import { generateVCReport } from '../services/reportService';
import EmergencyVCListModal from './EmergencyVCListModal';
import ContactSticker from './common/ContactSticker';
import LocationSticker from './common/LocationSticker';
import ReminderSettingsModal from './ReminderSettingsModal';
import UserSticker from './common/UserSticker';
import ExportReportModal from './ExportReportModal';
import EditVCLocationsModal from './EditVCLocationsModal';
import CalendarView from './CalendarView';
import CalendarIcon from './common/CalendarIcon';
import PostponeVCModal from './PostponeVCModal';
import OldVCListModal from './OldVCListModal';
import PauseSticker from './common/PauseSticker';
import RoomUsageSection from './RoomUsageSection';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.12 5.12c-.67.21-1.3.54-1.85.98l-1.68-.78c-1.45-.67-3.03.91-2.36 2.36l.78 1.68c-.44.55-.77 1.18-.98 1.85l-1.94.39c-1.56.38-1.56 2.6 0 2.98l1.94.39c.21.67.54 1.3.98 1.85l-.78 1.68c-.67 1.45.91 3.03 2.36 2.36l1.68-.78c.55.44 1.18.77 1.85.98l.39 1.94c.38 1.56 2.6 1.56 2.98 0l.39-1.94c.67-.21 1.3-.54 1.85-.98l1.68.78c1.45.67 3.03-.91 2.36-2.36l-.78-1.68c.44-.55.77-1.18-.98-1.85l1.94-.39c-1.56-.38-1.56-2.6 0-2.98l-1.94-.39c-.21-.67-.54-1.3-.98-1.85l.78-1.68c.67-1.45-.91-3.03-2.36-2.36l-1.68.78c-.55-.44-1.18-.77-1.85-.98L11.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
    <div className="bg-white dark:bg-slate-900/40 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col items-center text-center shadow-sm">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</span>
        <span className={`text-3xl font-black ${color}`}>{value}</span>
    </div>
);

const ManagerDashboard: React.FC = () => {
  const { currentUser, vcs, users, cancelVC } = useAppContext();
  const navigate = useNavigate();
  
  const [selectedVc, setSelectedVc] = useState<VC | null>(null);
  const [vcToEdit, setVcToEdit] = useState<VC | null>(null);
  const [vcToEditLocations, setVcToEditLocations] = useState<VC | null>(null);
  const [vcToPostpone, setVcToPostpone] = useState<VC | null>(null);
  const [report, setReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isEmergencyListOpen, setIsEmergencyListOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isOldVCListOpen, setIsOldVCListOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const managerVCs = useMemo(() => {
    if (!currentUser) return [];
    return vcs.filter(vc => vc.managerId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, vcs]);
  
  const activeManagerVCs = useMemo(() => {
      return managerVCs.filter(vc => vc.status !== VCStatus.Completed && vc.status !== VCStatus.Cancelled);
  }, [managerVCs]);

  const stats = useMemo(() => ({
      total: managerVCs.length,
      active: activeManagerVCs.length,
      completed: managerVCs.filter(v => v.status === VCStatus.Completed).length,
      emergency: managerVCs.filter(v => v.subject.includes('[EMERGENCY]')).length
  }), [managerVCs, activeManagerVCs]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReport('');
    const generatedReport = await generateVCReport(managerVCs, users);
    setReport(generatedReport);
    setIsGeneratingReport(false);
  };

  const handleCancelVC = (vcId: string) => {
      if (window.confirm("Are you sure you want to cancel this meeting?")) {
          cancelVC(vcId);
      }
  }
  
  const getStatusColor = (status: VCStatus) => {
    switch (status) {
      case VCStatus.Scheduled: return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case VCStatus.InProgress: return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case VCStatus.Completed: return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case VCStatus.Cancelled: return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case VCStatus.Postponed: return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="animate-fade-in-up">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Manager Central</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, <span className="font-bold text-slate-700 dark:text-slate-200">{currentUser?.name}</span>. Protocol 7.2 active.</p>
        </div>
        <div className="flex flex-wrap gap-2 animate-fade-in-up delay-100">
            <Button onClick={() => navigate('/schedule-vc')} className="!rounded-2xl px-6 py-3 shadow-xl shadow-cyan-500/10">
                + Create VC Bridge
            </Button>
             <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
                title="Protocol Settings"
             >
                <SettingsIcon />
            </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-200">
          <StatCard title="Total Meetings" value={stats.total} color="text-cyan-500" />
          <StatCard title="Active Bridges" value={stats.active} color="text-yellow-500" />
          <StatCard title="Successful" value={stats.completed} color="text-green-500" />
          <StatCard title="Emergencies" value={stats.emergency} color="text-red-500" />
      </div>

      <RoomUsageSection />

      {/* AI Panel */}
      <Card className="!p-0 overflow-hidden animate-fade-in-up delay-300">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-cyan-600/5 to-transparent">
             <div className="flex-1">
                <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">AI Operations Analysis</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Process all meeting data into a high-level executive summary through the neural bridge.</p>
                <Button onClick={handleGenerateReport} disabled={isGeneratingReport} variant="secondary" className="!rounded-xl border-slate-200 dark:border-slate-700">
                    {isGeneratingReport ? 'Synchronizing Data...' : 'Generate Neural Report'}
                </Button>
             </div>
             {report && (
                <div className="flex-1 max-h-60 overflow-y-auto p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-white/20 dark:border-slate-800/50">
                   <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono">{report}</pre>
                </div>
             )}
          </div>
      </Card>
      
      {/* VC Table/Calendar */}
      <div className="space-y-4 animate-fade-in-up delay-400">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Active VC Directory</h3>
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl border border-white/10">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                   List
                </button>
                <button 
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                   Calendar
                </button>
            </div>
        </div>

        {viewMode === 'list' ? (
            <div className="grid grid-cols-1 gap-4">
            {activeManagerVCs.length > 0 ? activeManagerVCs.map(vc => (
                <div key={vc.id} className="group bg-white dark:bg-slate-900/60 p-5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-cyan-500/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5">
                    <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex items-center gap-3">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(vc.status)}`}>
                                {vc.status}
                             </span>
                             <span className="text-slate-300 dark:text-slate-700">|</span>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                {new Date(vc.startTime).toLocaleDateString()} at {new Date(vc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate">{vc.subject}</h4>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <ContactSticker label="Authority" userId={vc.reportingAuthorityId} />
                            <ContactSticker label="Conductor" userId={vc.conductorId} />
                            <LocationSticker locations={vc.locations} />
                            {(vc.status === VCStatus.Scheduled || vc.status === VCStatus.InProgress) && (
                                <PauseSticker onClick={() => setVcToPostpone(vc)} className="!rounded-xl" />
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 lg:bg-slate-50 dark:lg:bg-slate-800/40 lg:p-2 lg:rounded-3xl border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" onClick={() => setSelectedVc(vc)} className="!rounded-2xl !text-xs font-black uppercase">Details</Button>
                        {vc.status === VCStatus.Scheduled && (
                        <>
                            <Button variant="secondary" onClick={() => setVcToEdit(vc)} className="!rounded-2xl !text-xs font-black uppercase">Assign</Button>
                            <Button variant="danger" onClick={() => handleCancelVC(vc.id)} className="!rounded-2xl !text-xs font-black uppercase">Abort</Button>
                        </>
                        )}
                    </div>
                </div>
            )) : (
                <div className="bg-slate-100/50 dark:bg-slate-800/20 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">No active bridge connections detected</p>
                </div>
            )}
            </div>
        ) : (
            <CalendarView vcs={managerVCs} />
        )}
      </div>

      {/* Quick Footer Actions */}
      <div className="flex flex-wrap justify-center gap-4 pt-8 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={() => navigate('/salary')} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 transition-colors">Salary Portal</button>
          <span className="text-slate-300 dark:text-slate-800">•</span>
          <button onClick={() => setIsOldVCListOpen(true)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 transition-colors">Bridge History</button>
          <span className="text-slate-300 dark:text-slate-800">•</span>
          <button onClick={() => setIsExportModalOpen(true)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 transition-colors">Data Export</button>
          <span className="text-slate-300 dark:text-slate-800">•</span>
          <button onClick={() => setIsEmergencyListOpen(true)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 transition-colors">Urgent Alerts</button>
      </div>

      <VCDetailsModal vc={selectedVc} onClose={() => setSelectedVc(null)} />
      <EditVCConductorModal vc={vcToEdit} onClose={() => setVcToEdit(null)} />
      <EditVCLocationsModal vc={vcToEditLocations} onClose={() => setVcToEditLocations(null)} />
      <PostponeVCModal vc={vcToPostpone} onClose={() => setVcToPostpone(null)} />
      <EmergencyVCListModal isOpen={isEmergencyListOpen} onClose={() => setIsEmergencyListOpen(false)} />
      <ReminderSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} user={currentUser} />
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        vcs={managerVCs}
        users={users}
        managerName={currentUser?.name || ''}
      />
      <OldVCListModal 
        isOpen={isOldVCListOpen} 
        onClose={() => setIsOldVCListOpen(false)} 
        vcs={managerVCs}
      />
    </div>
  );
};

export default ManagerDashboard;
