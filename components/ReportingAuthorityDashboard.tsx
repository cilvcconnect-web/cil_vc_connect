
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { VC, VCStatus, UserStatus } from '../types';
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
  const { currentUser, vcs, users, approveUser, rejectUser, requestDeletion, cancelVC } = useAppContext();
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
  const [activeView, setActiveView] = useState<'vcs' | 'attendance' | 'users' | 'reports'>('vcs');
  const [vcViewMode, setVcViewMode] = useState<'list' | 'calendar'>('list');

  // Use all VCs (Common view for all Reporting Authorities)
  const authorityVCs = useMemo(() => {
    if (!currentUser) return [];
    return [...vcs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, vcs]);
  
  const activeAuthorityVCs = useMemo(() => {
      return authorityVCs.filter(vc => vc.status !== VCStatus.Completed && vc.status !== VCStatus.Cancelled);
  }, [authorityVCs]);
  
  const pendingUsersCount = useMemo(() => {
    return users.filter(u => u.status === UserStatus.Pending).length;
  }, [users]);
  
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
                <div className="space-y-4">
                {activeAuthorityVCs.length > 0 ? activeAuthorityVCs.map(vc => (
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
                            {vc.conductorId ? (
                                <ContactSticker label="Conductor" userId={vc.conductorId} />
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300">
                                  Conductor: Unassigned
                                </span>
                            )}
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
                                    {vc.conductorId ? 'Change Conductor' : 'Assign Conductor'}
                                </Button>
                                <Button variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setVcToPostpone(vc)}>Postpone</Button>
                                <Button variant="danger" onClick={() => handleCancelVC(vc.id)}>Cancel</Button>
                            </>
                        )}
                    </div>
                    </div>
                )) : <p className="text-gray-500 dark:text-gray-400">No scheduled or active VCs found.</p>}
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
            <ConductorAttendanceReport />
        </div>
      )}

      {activeView === 'users' && renderUsersList()}

      {activeView === 'reports' && renderReportsPanel()}


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
    </div>
  );
};

export default ReportingAuthorityDashboard;
