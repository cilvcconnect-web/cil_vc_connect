
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { VC, VCStatus, UserStatus, Roster, RosterRequestStatus, UserRole, User } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import VCDetailsModal from './VCDetailsModal';
import EmergencyVCModal from './EmergencyVCModal';
import EmergencyVCListModal from './EmergencyVCListModal';
import ContactSticker from './common/ContactSticker';
import LocationSticker from './common/LocationSticker';
import ReminderSettingsModal from './ReminderSettingsModal';
import UserSticker from './common/UserSticker';
import { exportVCsToCSV, exportUsersToCSV } from '../utils/export';
import TodayPresentConductors from './TodayPresentConductors';
import EditVCConductorModal from './EditVCConductorModal';
import AttendanceChangeRequests from './AttendanceChangeRequests';
import ConductorAttendanceReport from './ConductorAttendanceReport';
import EditVCLocationsModal from './EditVCLocationsModal';
import CalendarView from './CalendarView';
import CalendarIcon from './common/CalendarIcon';
import UserApprovalRequests from './UserApprovalRequests';
import PostponeVCModal from './PostponeVCModal';
import AttendanceReportModal from './AttendanceReportModal';
import ExportReportModal from './ExportReportModal';
import OldVCListModal from './OldVCListModal';
import PauseSticker from './common/PauseSticker';
import RoomUsageSection from './RoomUsageSection';
import GlowingIP from './common/GlowingIP';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.12 5.12c-.67.21-1.3.54-1.85.98l-1.68-.78c-1.45-.67-3.03.91-2.36 2.36l.78 1.68c-.44.55-.77 1.18-.98 1.85l-1.94.39c-1.56.38-1.56 2.6 0 2.98l1.94.39c.21.67.54 1.3.98 1.85l-.78 1.68c-.67 1.45.91 3.03 2.36 2.36l1.68-.78c.55.44 1.18.77 1.85.98l.39 1.94c.38 1.56 2.6 1.56 2.98 0l.39-1.94c.67-.21 1.3-.54 1.85-.98l1.68.78c1.45.67 3.03-.91 2.36-2.36l-.78-1.68c.44-.55.77-1.18-.98-1.85l1.94-.39c-1.56-.38-1.56-2.6 0-2.98l-1.94-.39c-.21-.67-.54-1.3-.98-1.85l.78-1.68c.67-1.45-.91-3.03-2.36-2.36l-1.68.78c-.55-.44-1.18-.77-1.85-.98L11.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const ReportingAuthorityDashboard: React.FC = () => {
  const { currentUser, vcs, users, approveUser, rejectUser, requestDeletion, cancelVC, isAutopilotEnabled, setAutopilotEnabled, rosters, createRoster, approveRosterChange, rejectRosterChange } = useAppContext();
  const navigate = useNavigate();
  const [selectedVc, setSelectedVc] = useState<VC | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isEmergencyListOpen, setIsEmergencyListOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAttendanceReportModalOpen, setIsAttendanceReportModalOpen] = useState(false);
  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState(false);
  const [isOldVCListOpen, setIsOldVCListOpen] = useState(false);
  const [vcToEdit, setVcToEdit] = useState<VC | null>(null);
  const [vcToEditLocations, setVcToEditLocations] = useState<VC | null>(null);
  const [vcToPostpone, setVcToPostpone] = useState<VC | null>(null);
  const [activeView, setActiveView] = useState<'vcs' | 'attendance' | 'users' | 'reports' | 'roster'>('vcs');
  const [vcViewMode, setVcViewMode] = useState<'list' | 'calendar'>('list');
  const [closedIssueIds, setClosedIssueIds] = useState<string[]>([]);

  // Roster scheduling form state
  const [rosterConductorId, setRosterConductorId] = useState<string>('all');
  const [rosterDate, setRosterDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [rosterStartTime, setRosterStartTime] = useState<string>('09:00');
  const [rosterEndTime, setRosterEndTime] = useState<string>('17:00');

  // Use all VCs (Common view for all Reporting Authorities)
  const authorityVCs = useMemo(() => {
    if (!currentUser) return [];
    return [...vcs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, vcs]);
  
  const activeAuthorityVCs = useMemo(() => {
      return authorityVCs.filter(vc => vc.status !== VCStatus.Completed && vc.status !== VCStatus.Cancelled);
  }, [authorityVCs]);

  const { unassignedVCs, assignedVCs } = useMemo(() => {
    const unassigned = activeAuthorityVCs.filter(vc => !vc.conductorId);
    const assigned = activeAuthorityVCs.filter(vc => !!vc.conductorId);
    return { unassignedVCs: unassigned, assignedVCs: assigned };
  }, [activeAuthorityVCs]);

  // Find any active/scheduled/in-progress VCs with active technical issue that have not been dismissed
  const activeIssuesToShow = useMemo(() => {
    return authorityVCs.filter(vc => 
      vc.technicalIssue && 
      vc.status !== VCStatus.Completed && 
      vc.status !== VCStatus.Cancelled && 
      !closedIssueIds.includes(vc.id)
    );
  }, [authorityVCs, closedIssueIds]);
  
  const pendingUsersCount = useMemo(() => {
    return users.filter(u => u.status === UserStatus.Pending).length;
  }, [users]);

  const pendingRosterChangesCount = useMemo(() => {
    return rosters.filter(r => r.changeRequested && r.changeRequestStatus === RosterRequestStatus.Pending).length;
  }, [rosters]);
  
  const handleUserExport = () => {
    const filename = `CIL_User_Directory_${new Date().toISOString().split('T')[0]}.csv`;
    exportUsersToCSV(users, filename);
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

  const getUserStatusColor = (status: UserStatus) => {
      switch (status) {
          case UserStatus.Approved: return 'text-green-600 dark:text-green-400';
          case UserStatus.Pending: return 'text-yellow-600 dark:text-yellow-400';
          case UserStatus.Rejected: return 'text-red-600 dark:text-red-400';
          default: return 'text-gray-500';
      }
  };

  const renderRosterPanel = () => {
    // Get all approved conductors
    const conductors = users.filter(u => u.role === UserRole.Conductor && u.status === UserStatus.Approved);

    const handleCreateRosterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (rosterConductorId === 'all') {
        if (conductors.length === 0) {
          alert('No approved conductors found to assign rosters to.');
          return;
        }
        conductors.forEach(cond => {
          createRoster(cond.id, rosterDate, rosterStartTime, rosterEndTime);
        });
        alert(`Successfully scheduled roster work hours for all (${conductors.length}) conductors on ${rosterDate}.`);
      } else {
        createRoster(rosterConductorId, rosterDate, rosterStartTime, rosterEndTime);
        const condName = conductors.find(c => c.id === rosterConductorId)?.name || 'Conductor';
        alert(`Successfully scheduled roster work hours for ${condName} on ${rosterDate}.`);
      }
    };

    // Filter roster changes
    const rosterChangeRequests = rosters.filter(r => r.changeRequested && r.changeRequestStatus === RosterRequestStatus.Pending);

    return (
      <div className="space-y-6">
        {/* Change Requests Section */}
        {rosterChangeRequests.length > 0 && (
          <Card className="border-2 border-amber-500/40 bg-amber-50/5 dark:bg-amber-950/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2.5 w-2.5 bg-amber-500 rounded-full animate-pulse"></span>
              <h3 className="text-lg font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                Pending Roster Change Requests ({rosterChangeRequests.length})
              </h3>
            </div>
            <div className="space-y-4">
              {rosterChangeRequests.map(req => {
                const conductor = users.find(u => u.id === req.conductorId);
                return (
                  <div key={req.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-900 dark:text-white text-base">
                          {conductor?.name || 'Unknown Conductor'}
                        </p>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 font-mono text-slate-500 dark:text-slate-400 px-2 rounded-lg">
                          {conductor?.phoneNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        <strong className="text-slate-600 dark:text-slate-300">Original Slot:</strong> {req.date} ({req.startTime} - {req.endTime})
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-black">
                        <strong>Requested New Slot:</strong> {req.requestedDate} ({req.requestedStartTime} - {req.requestedEndTime})
                      </p>
                      {req.changeReason && (
                        <div className="text-xs bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 italic text-slate-600 dark:text-slate-300 mt-1">
                          " {req.changeReason} "
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button onClick={() => approveRosterChange(req.id)} className="w-full md:w-auto text-xs uppercase" variant="success">
                        Approve
                      </Button>
                      <Button onClick={() => rejectRosterChange(req.id)} className="w-full md:w-auto text-xs uppercase" variant="danger">
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create/Modify Roster Entry Form */}
          <Card className="lg:col-span-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
              Put Duty Roster
            </h3>
            <form onSubmit={handleCreateRosterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Select Conductor
                </label>
                <select
                  value={rosterConductorId}
                  onChange={(e) => setRosterConductorId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none text-sm p-3 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">★ All Approved Conductors</option>
                  {conductors.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phoneNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Roster Date
                </label>
                <input
                  type="date"
                  value={rosterDate}
                  onChange={(e) => setRosterDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none text-sm p-3 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={rosterStartTime}
                    onChange={(e) => setRosterStartTime(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none text-sm p-3 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={rosterEndTime}
                    onChange={(e) => setRosterEndTime(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none text-sm p-3 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-3 text-sm font-bold uppercase mt-4" variant="primary">
                Publish Duty Slot
              </Button>
            </form>
          </Card>

          {/* Active Duty Roster Overview List */}
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Conductor Roster Directory</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-bold">
                {rosters.length} entries matches
              </span>
            </h3>

            {rosters.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                <p className="text-slate-400 text-sm font-bold">No conductor duty roster scheduled yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase border-b border-slate-100 dark:border-white/5">
                      <th className="p-3">Conductor</th>
                      <th className="p-3">Scheduled Date</th>
                      <th className="p-3">Duty Hours</th>
                      <th className="p-3">Request Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...rosters]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(rost => {
                        const cond = users.find(u => u.id === rost.conductorId);
                        return (
                          <tr key={rost.id} className="border-b border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                              {cond?.name || 'Unknown Conductor'}
                              <div className="text-xs font-normal text-slate-400">ID: {rost.conductorId}</div>
                            </td>
                            <td className="p-3 font-medium">
                              {new Date(rost.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="p-3 font-mono text-xs">
                              <span className="bg-cyan-100/50 dark:bg-cyan-900/10 text-cyan-700 dark:text-cyan-400 px-2 py-1 rounded-lg">
                                {rost.startTime} - {rost.endTime}
                              </span>
                            </td>
                            <td className="p-3 text-xs">
                              {rost.changeRequested ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse">
                                  ● Change Pending
                                </span>
                              ) : rost.changeRequestStatus === RosterRequestStatus.Approved ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  ✓ Changed
                                </span>
                              ) : rost.changeRequestStatus === RosterRequestStatus.Rejected ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  ✗ Change Refused
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                  Active
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  const renderUsersList = () => {
      return (
          <Card>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Manage Users</h3>
                  <Button variant="secondary" onClick={handleUserExport}>
                      <ExportIcon />
                      <span className="ml-2">Export User List</span>
                  </Button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                              <th className="p-3 border-b dark:border-slate-600">Name</th>
                              <th className="p-3 border-b dark:border-slate-600">Role</th>
                              <th className="p-3 border-b dark:border-slate-600">Phone</th>
                              <th className="p-3 border-b dark:border-slate-600">Status</th>
                              <th className="p-3 border-b dark:border-slate-600">Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {users.map(user => (
                              <tr key={user.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                  <td className="p-3 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                     <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 flex items-center justify-center">
                                         {user.profilePhoto ? (
                                             <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
                                         ) : (
                                             <UserIcon />
                                         )}
                                     </div>
                                     {user.name}
                                  </td>
                                  <td className="p-3 text-gray-700 dark:text-gray-300">{user.role}</td>
                                  <td className="p-3 text-gray-700 dark:text-gray-300">{user.phoneNumber}</td>
                                  <td className={`p-3 font-semibold ${getUserStatusColor(user.status)}`}>{user.status}</td>
                                  <td className="p-3">
                                      <div className="flex gap-2 items-center">
                                          {user.status === UserStatus.Pending && (
                                              <>
                                                  <Button variant="success" className="px-3 py-1 text-xs" onClick={() => approveUser(user.id)}>Approve</Button>
                                                  <Button variant="danger" className="px-3 py-1 text-xs" onClick={() => rejectUser(user.id)}>Reject</Button>
                                              </>
                                          )}
                                          {user.id !== currentUser?.id && (
                                              user.deletionRequested ? (
                                                  <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800">
                                                      Deletion Pending
                                                  </span>
                                              ) : (
                                                  <Button variant="danger" className="px-3 py-1 text-xs bg-red-800 hover:bg-red-900" onClick={() => {
                                                      if (window.confirm(`Request deletion for user ${user.name}? They will need to confirm this action.`)) {
                                                          requestDeletion(user.id);
                                                      }
                                                  }}>Request Deletion</Button>
                                              )
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Card>
      );
  };

  const renderReportsPanel = () => {
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                          <ExportIcon />
                      </div>
                      <h3 className="text-xl font-bold">VC Reports</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                      Generate and export comprehensive reports of all Scheduled, Completed, and Cancelled Video Conferences within a date range.
                  </p>
                  <Button onClick={() => setIsExportReportModalOpen(true)} className="w-full mt-auto">
                      Export VC Data (CSV)
                  </Button>
              </Card>

              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                          <ReportIcon />
                      </div>
                      <h3 className="text-xl font-bold">Attendance Reports</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                      View and export detailed attendance records for Conductors. Available in both PDF and Excel formats.
                  </p>
                  <Button onClick={() => setIsAttendanceReportModalOpen(true)} className="w-full mt-auto" variant="success">
                      Attendance Reports
                  </Button>
              </Card>

              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                          <UserIcon />
                      </div>
                      <h3 className="text-xl font-bold">User Directory</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                      Export the complete list of users, including Managers, Conductors, and other Reporting Authorities with their statuses.
                  </p>
                  <Button onClick={handleUserExport} className="w-full mt-auto" variant="secondary">
                      Export User List (CSV)
                  </Button>
              </Card>
          </div>
      )
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reporting Authority Dashboard</h2>
          <UserSticker user={currentUser} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
             <Button onClick={() => navigate('/salary')} variant="success">
               Salary Portal
            </Button>
            <Button
                onClick={() => setActiveView('users')}
                variant={activeView === 'users' ? 'primary' : 'secondary'}
                className="relative"
            >
                Manage Users
                {pendingUsersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-md border border-white dark:border-slate-800 min-w-[20px] text-center">
                        {pendingUsersCount}
                    </span>
                )}
            </Button>
            <Button 
                onClick={() => setActiveView(activeView === 'attendance' ? 'vcs' : 'attendance')} 
                variant={activeView === 'attendance' ? 'primary' : 'secondary'}
            >
                {activeView === 'attendance' ? 'View VCs' : 'Manage Attendance'}
            </Button>
            <Button 
                onClick={() => setActiveView(activeView === 'roster' ? 'vcs' : 'roster')} 
                variant={activeView === 'roster' ? 'primary' : 'secondary'}
                className="relative"
            >
                Conductor Roster
                {pendingRosterChangesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-md border border-white dark:border-slate-800 min-w-[18px] text-center">
                        {pendingRosterChangesCount}
                    </span>
                )}
            </Button>
            <Button 
                onClick={() => setActiveView('reports')} 
                variant={activeView === 'reports' ? 'primary' : 'secondary'}
            >
                <ReportIcon />
                Reports Panel
            </Button>
            <Button onClick={() => setIsOldVCListOpen(true)} variant="secondary">
                <HistoryIcon />
                Old VCs
            </Button>
            <Button onClick={() => setIsEmergencyListOpen(true)} variant="secondary">
                View Emergency VCs
            </Button>
            <Button onClick={() => navigate('/schedule-vc')}>
                + Schedule New VC
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
      
      {activeView === 'vcs' && (
        <div className="space-y-6">
          <UserApprovalRequests />
          <AttendanceChangeRequests />
          <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Scheduled / Active VCs</h3>
                <Button onClick={() => setVcViewMode(vcViewMode === 'list' ? 'calendar' : 'list')} variant="secondary">
                    {vcViewMode === 'list' ? <CalendarIcon /> : <ListIcon />}
                    {vcViewMode === 'list' ? 'Calendar View' : 'List View'}
                </Button>
            </div>

            {vcViewMode === 'list' ? (
                <div className="space-y-6">
                  {/* Unassigned VCs */}
                  {unassignedVCs.length > 0 && (
                     <div className="space-y-3">
                       <div className="flex items-center gap-2 px-2">
                         <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                         <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                           Unassigned Conferences ({unassignedVCs.length}) - Needs Conductor Allocation
                         </h4>
                       </div>
                       <div className="space-y-4">
                         {unassignedVCs.map(vc => (
                           <div key={vc.id} className={`bg-amber-50/20 dark:bg-amber-950/10 border border-amber-500/30 dark:border-amber-500/20 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300 hover:border-amber-500`}>
                             <div>
                               <div className="flex items-center gap-2">
                                 <p className="font-bold text-lg text-gray-900 dark:text-white">{vc.subject}</p>
                               </div>
                               <p className="text-sm text-gray-500 dark:text-gray-400">
                                 Scheduled: {new Date(vc.startTime).toLocaleString()}
                               </p>
                               <div className="flex flex-wrap gap-2 mt-2">
                                 <ContactSticker label="Manager" userId={vc.managerId} />
                                 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200/20">
                                   Conductor: Unassigned
                                 </span>
                                 {(vc.status === VCStatus.Scheduled || vc.status === VCStatus.InProgress) && (
                                   <PauseSticker onClick={() => setVcToPostpone(vc)} />
                                 )}
                                 {vc.technicalIssue && (
                                   <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm animate-pulse border border-red-400" title={vc.technicalIssueDescription}>
                                     <AlertIcon />
                                     <span>Tech Issue</span>
                                   </div>
                                 )}
                               </div>
                               <LocationSticker locations={vc.locations} className="mt-2" />
                               
                               {vc.technicalIssue && vc.technicalIssueDescription && (
                                 <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 flex items-start">
                                   <span className="flex-shrink-0 mr-1 mt-0.5"><AlertIcon /></span>
                                   <span><span className="font-bold">Issue Details:</span> {vc.technicalIssueDescription}</span>
                                 </div>
                               )}
                               <p className="text-sm font-semibold mt-2 text-amber-600 dark:text-amber-400">Needs Assignment ({vc.status})</p>
                             </div>
                             <div className="flex flex-wrap gap-2">
                               <Button variant="secondary" onClick={() => setSelectedVc(vc)}>View Details</Button>
                               {(vc.status === VCStatus.Scheduled || vc.status === VCStatus.InProgress) && (
                                 <Button variant="secondary" onClick={() => setVcToEditLocations(vc)}>Edit Locations</Button>
                               )}
                               {vc.status === VCStatus.Scheduled && (
                                 <>
                                   <Button variant="secondary" onClick={() => setVcToEdit(vc)} className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/25">
                                     Assign Conductor
                                   </Button>
                                   <Button variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white animate-pulse" onClick={() => setVcToPostpone(vc)}>Postpone</Button>
                                   <Button variant="danger" onClick={() => handleCancelVC(vc.id)}>Cancel</Button>
                                 </>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}

                  {/* Assigned Conferences */}
                  <div className="space-y-3">
                    {unassignedVCs.length > 0 && assignedVCs.length > 0 && (
                       <div className="flex items-center gap-2 px-2 pt-2">
                         <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                           Assigned Conferences ({assignedVCs.length})
                         </h4>
                       </div>
                    )}
                    <div className="space-y-4">
                      {assignedVCs.length > 0 ? assignedVCs.map(vc => (
                        <div key={vc.id} className={`bg-white border border-gray-200 dark:border-transparent dark:bg-slate-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300 ${vc.technicalIssue ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg text-gray-900 dark:text-white">{vc.subject}</p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Scheduled: {new Date(vc.startTime).toLocaleString()}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <ContactSticker label="Manager" userId={vc.managerId} />
                              <ContactSticker label="Conductor" userId={vc.conductorId} />
                              {(vc.status === VCStatus.Scheduled || vc.status === VCStatus.InProgress) && (
                                <PauseSticker onClick={() => setVcToPostpone(vc)} />
                              )}
                              {vc.technicalIssue && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm animate-pulse border border-red-400" title={vc.technicalIssueDescription}>
                                  <AlertIcon />
                                  <span>Tech Issue</span>
                                </div>
                              )}
                            </div>
                            <LocationSticker locations={vc.locations} className="mt-2" />
                            
                            {vc.technicalIssue && vc.technicalIssueDescription && (
                              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 flex items-start">
                                <span className="flex-shrink-0 mr-1 mt-0.5"><AlertIcon /></span>
                                <span><span className="font-bold">Issue Details:</span> {vc.technicalIssueDescription}</span>
                              </div>
                            )}
                            <p className={`text-sm font-semibold mt-2 ${getStatusColor(vc.status)}`}>{vc.status}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => setSelectedVc(vc)}>View Details</Button>
                            {(vc.status === VCStatus.Scheduled || vc.status === VCStatus.InProgress) && (
                              <Button variant="secondary" onClick={() => setVcToEditLocations(vc)}>Edit Locations</Button>
                            )}
                            {vc.status === VCStatus.Scheduled && (
                              <>
                                <Button variant="secondary" onClick={() => setVcToEdit(vc)}>
                                  Change Conductor
                                </Button>
                                <Button variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setVcToPostpone(vc)}>Postpone</Button>
                                <Button variant="danger" onClick={() => handleCancelVC(vc.id)}>Cancel</Button>
                              </>
                            )}
                          </div>
                        </div>
                      )) : unassignedVCs.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No scheduled or active VCs found.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
            ) : (
                <CalendarView vcs={authorityVCs} />
            )}
          </Card>
          <TodayPresentConductors />
        </div>
      )}

      {activeView === 'attendance' && (
         <div className="space-y-6">
             <Card>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Attendance Overview</h3>
                    <Button onClick={() => setIsAttendanceReportModalOpen(true)} variant="secondary">
                        Generate Attendance Report
                    </Button>
                </div>
             </Card>
             
             {/* System-Wide Autopilot Control Panel */}
             <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-cyan-500/25 relative overflow-hidden rounded-[2rem] shadow-xl p-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div className="flex items-start gap-4">
                         <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-pulse">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-10.44 0M10.5 15.75v3m0 0h-3m3 0h3m-3-6h.008v.008H10.5v-.008Zm0-6h.008v.008H10.5V3.75Zm0 0a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
                             </svg>
                         </div>
                         <div>
                             <h4 className="font-black text-white tracking-tight uppercase text-sm">System-Wide Autopilot Attendance Control</h4>
                             <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                                 Turn ON to activate automatic geofencing attendance for all Conductors. Manual input options will be deactivated and grayed out.
                             </p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3 bg-slate-950/40 px-4 py-2.5 rounded-xl border border-white/5">
                         <span className="text-xs font-black text-slate-300 tracking-widest uppercase">
                             {isAutopilotEnabled ? 'Active (Auto-Log ON)' : 'Inactive (Manual ON)'}
                         </span>
                         <button
                             onClick={() => setAutopilotEnabled(!isAutopilotEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                 isAutopilotEnabled ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-slate-700'
                             }`}
                             title="Toggle System-Wide Autopilot Attendance"
                         >
                             <span
                                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                     isAutopilotEnabled ? 'translate-x-6' : 'translate-x-1'
                                 }`}
                             />
                         </button>
                     </div>
                 </div>
             </Card>
             
            <ConductorAttendanceReport />
        </div>
      )}

      {activeView === 'users' && renderUsersList()}

      {activeView === 'reports' && renderReportsPanel()}

      {activeView === 'roster' && renderRosterPanel()}


      <VCDetailsModal vc={selectedVc} onClose={() => setSelectedVc(null)} />
      <EditVCConductorModal vc={vcToEdit} onClose={() => setVcToEdit(null)} />
      <EditVCLocationsModal vc={vcToEditLocations} onClose={() => setVcToEditLocations(null)} />
      <PostponeVCModal vc={vcToPostpone} onClose={() => setVcToPostpone(null)} />
      <EmergencyVCModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} />
      <EmergencyVCListModal isOpen={isEmergencyListOpen} onClose={() => setIsEmergencyListOpen(false)} />
      <ReminderSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} user={currentUser} />
      <AttendanceReportModal isOpen={isAttendanceReportModalOpen} onClose={() => setIsAttendanceReportModalOpen(false)} />
      <ExportReportModal
        isOpen={isExportReportModalOpen}
        onClose={() => setIsExportReportModalOpen(false)}
        vcs={authorityVCs}
        users={users}
        managerName={currentUser?.name || 'Authority_Export'}
      />
      <OldVCListModal 
        isOpen={isOldVCListOpen} 
        onClose={() => setIsOldVCListOpen(false)} 
        vcs={authorityVCs} 
      />

      {/* TECHNICAL ISSUE ACTIVE RED POPUP OVERLAY */}
      {activeIssuesToShow.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="tech-issue-popup-overlay">
          <div className="w-full max-w-2xl bg-gradient-to-b from-red-950 via-rose-950 to-slate-950 border-2 border-red-600 rounded-[2rem] shadow-[0_0_50px_rgba(239,68,68,0.5)] overflow-hidden text-white relative animate-scale-up" id="tech-issue-popup">
            
            {/* Pulsing Alert Top Border Decoration */}
            <div className="bg-red-600 px-6 py-3 flex items-center justify-between gap-2 border-b border-red-800">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">
                  CRITICAL FAULT REPORTED
                </span>
              </div>
              {activeIssuesToShow.length > 1 && (
                <span className="bg-black/50 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {activeIssuesToShow.length} Active Issues
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Alert Header */}
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/30 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] font-bold text-red-400 tracking-widest uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    Active VC Technical Bug
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mt-1">
                    {activeIssuesToShow[0].subject}
                  </h3>
                </div>
              </div>

              {/* Location and Connections Block */}
              <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block mb-1.5">
                    VC GEOFENCED LOCATIONS
                  </span>
                  {activeIssuesToShow[0].locations && activeIssuesToShow[0].locations.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activeIssuesToShow[0].locations.map((loc, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-bold text-purple-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                          {loc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No location assets linked</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-widest uppercase block leading-none mb-1">
                      ROOM NAME / SUITE
                    </span>
                    <p className="text-xs font-semibold text-slate-200">
                      {activeIssuesToShow[0].roomName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-widest uppercase block leading-none mb-1">
                      IP INTERFACE IP
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-300">
                      {activeIssuesToShow[0].roomIp ? <GlowingIP ip={activeIssuesToShow[0].roomIp} /> : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Problem Details Block */}
              <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-red-400 font-extrabold uppercase tracking-wider text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  Incident Logged Details
                </div>
                <p className="text-xs sm:text-sm font-medium text-red-200 leading-relaxed italic bg-black/20 p-3 rounded-xl border border-red-500/10">
                  {`"${activeIssuesToShow[0].technicalIssueDescription || 'Conductor did not specify the physical diagnostic description.'}"`}
                </p>
              </div>

              {/* All Meeting Details Specification Section */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block mb-1">
                  Full Meeting Specification Detail
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/40 p-3.5 rounded-2xl border border-white/5 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-slate-400 uppercase tracking-wider font-bold text-[8px] leading-none mb-0.5">Date & Time</p>
                    <p className="font-bold text-slate-200">{new Date(activeIssuesToShow[0].startTime).toLocaleString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 uppercase tracking-wider font-bold text-[8px] leading-none mb-0.5">Current Status</p>
                    <p className="font-bold text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {activeIssuesToShow[0].status}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 uppercase tracking-wider font-bold text-[8px] leading-none mb-0.5">Conductor</p>
                    <p className="font-bold text-slate-200">
                      {(() => {
                        const cond = users.find(u => u.id === activeIssuesToShow[0].conductorId);
                        return cond ? `${cond.name} (${cond.phoneNumber})` : 'Unassigned';
                      })()}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 uppercase tracking-wider font-bold text-[8px] leading-none mb-0.5">Manager Assigned</p>
                    <p className="font-bold text-slate-200">
                      {(() => {
                        const mgr = users.find(u => u.id === activeIssuesToShow[0].managerId);
                        return mgr ? `${mgr.name} (${mgr.phoneNumber})` : 'System';
                      })()}
                    </p>
                  </div>
                  {activeIssuesToShow[0].link && (
                    <div className="sm:col-span-2 space-y-0.5 overflow-hidden">
                      <p className="text-slate-400 uppercase tracking-wider font-bold text-[8px] leading-none mb-0.5">Meeting URL Link</p>
                      <a href={activeIssuesToShow[0].link} target="_blank" rel="noreferrer" className="text-sky-400 break-all hover:underline font-semibold flex items-center gap-1">
                        {activeIssuesToShow[0].link} ↗
                      </a>
                    </div>
                  )}
                  {activeIssuesToShow[0].pptLink && (
                    <div className="sm:col-span-2 space-y-0.5 overflow-hidden">
                      <p className="text-slate-400 uppercase tracking-wider font-bold text-[8px] leading-none mb-0.5">Presentation slides link</p>
                      <a href={activeIssuesToShow[0].pptLink} target="_blank" rel="noreferrer" className="text-purple-400 break-all hover:underline font-semibold flex items-center gap-1">
                        {activeIssuesToShow[0].pptLink} ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Pager Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">
                  Alert {closedIssueIds.length + 1} of {closedIssueIds.length + activeIssuesToShow.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setClosedIssueIds(prev => [...prev, activeIssuesToShow[0].id]);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] text-center flex items-center justify-center gap-1.5"
                >
                  Acknowledge Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingAuthorityDashboard;
