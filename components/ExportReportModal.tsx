import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { VC, User } from '../types';
import { exportVCsToCSV } from '../utils/export';
import { 
  googleSignIn, 
  getAccessToken, 
  createGoogleSheet, 
  appendToGoogleSheet,
  initAuth
} from '../services/firebase';
import { FileSpreadsheet, Link2, Loader2, CheckCircle2 } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vcs: VC[];
  users: User[];
  managerName: string;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose, vcs, users, managerName }) => {
  const getISODateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(getISODateString(firstDayOfMonth));
  const [endDate, setEndDate] = useState(getISODateString(today));
  
  // Google Integration states
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (error: any) {
      console.error('Failed to log in with Google Workspace:', error);
      let msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('popup-closed-by-user') || msg.includes('popup') || msg.includes('blocked')) {
        msg = 'The Google Sign-In popup was blocked or closed. When running inside the AI Studio preview window, browsers enforce sandboxing and block popups. Open this application in a new tab to connect successfully!';
      }
      setAuthError(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const getFilteredVCs = () => {
    if (!startDate || !endDate) {
      return null;
    }
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (end < start) {
      return null;
    }

    const filtered = vcs.filter(vc => {
      const vcStartTime = new Date(vc.startTime);
      return vcStartTime >= start && vcStartTime <= end;
    });

    return filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const handleExport = () => {
    const sortedVCs = getFilteredVCs();
    if (!sortedVCs) {
      alert('Please select a valid date range.');
      return;
    }

    if (sortedVCs.length === 0) {
      alert('No VCs found in the selected date range.');
      return;
    }

    const filename = `CIL_VC_Report_${managerName.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;
    exportVCsToCSV(sortedVCs, users, filename);
    onClose();
  };

  const handleExportToGoogleSheets = async () => {
    const token = googleToken || await getAccessToken();
    if (!token) {
      alert('Google connection has expired. Please sign in to Google to export.');
      return;
    }

    const sortedVCs = getFilteredVCs();
    if (!sortedVCs) {
      alert('Please select a valid date range.');
      return;
    }

    if (sortedVCs.length === 0) {
      alert('No VCs found in the selected date range.');
      return;
    }

    setIsExportingSheet(true);
    setSheetUrl(null);

    try {
      const title = `CIL_VC_Report_${managerName.replace(/\s+/g, '_')}_${startDate}_to_${endDate}`;
      const sheet = await createGoogleSheet(token, title);
      
      const getUserName = (userId: string): string => {
        return users.find(u => u.id === userId)?.name || 'N/A';
      };

      const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
      };

      // Define standard columns
      const headers = [
        'VC ID',
        'Subject',
        'Location(s)',
        'Status',
        'Scheduled Start',
        'Actual Start',
        'Actual End',
        'Manager',
        'Reporting Authority',
        'Conductor',
        'Meeting Link',
        'Presentation Link',
        'Remarks',
        'Created At'
      ];

      const rows = sortedVCs.map(vc => [
        vc.id,
        vc.subject,
        vc.locations.join('; '),
        vc.status,
        formatDate(vc.startTime),
        formatDate(vc.actualStartTime),
        formatDate(vc.actualEndTime),
        getUserName(vc.managerId),
        getUserName(vc.reportingAuthorityId),
        getUserName(vc.conductorId || ''),
        vc.link || 'N/A',
        vc.pptLink || 'N/A',
        vc.remarks || 'N/A',
        formatDate(vc.createdAt)
      ]);

      const sheetData = [headers, ...rows];
      await appendToGoogleSheet(token, sheet.spreadsheetId, 'Sheet1!A1', sheetData);
      
      setSheetUrl(sheet.spreadsheetUrl);
    } catch (error) {
      console.error('Failed to export report to Google Sheets:', error);
      alert('An error occurred during Google Sheets export. Please try again.');
    } finally {
      setIsExportingSheet(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export VC Report">
      <div className="space-y-6">
        <p className="text-gray-300 text-sm">Select a date range to export the Video Conference logs report.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-xs"
              />
            </div>
        </div>

        {/* Google Workspace Integration Frame */}
        <div className="bg-slate-800/60 border border-white/5 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#34A853]" />
                Google Sheets Export Interface
              </h4>
              <p className="text-[10px] text-gray-400 mt-1 uppercase">
                Save reports directly to your Google Sheets Cloud.
              </p>
            </div>
            
            {!googleUser ? (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-3 py-1.5 bg-white text-slate-800 font-bold rounded-lg text-[10px] hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                {isSigningIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                )}
                Connect Google Account
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-800/30 px-2 py-1 rounded">
                  🟢 Linked: {googleUser.email || 'Workspace'}
                </span>
              </div>
            )}
          </div>

          {!googleUser && authError && (
            <div className="p-3.5 rounded-lg bg-amber-950/45 border border-amber-800/40 text-amber-200 text-xs leading-relaxed space-y-2.5">
              <p className="font-extrabold flex items-center gap-1.5 text-amber-400 uppercase tracking-widest text-[9px]">
                ⚠️ iframe Sandbox constraint
              </p>
              <p>{authError}</p>
              <button
                type="button"
                onClick={() => {
                  window.open(window.location.origin, '_blank');
                }}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase text-[9px] tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                Open Application in New Tab ↗
              </button>
            </div>
          )}

          {googleUser && (
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <Button
                type="button"
                onClick={handleExportToGoogleSheets}
                disabled={isExportingSheet || !startDate || !endDate}
                className="!py-2 !px-4 !rounded-xl !text-xs !bg-[#34A853] hover:!bg-[#2e934a] flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isExportingSheet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing Sheet values...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Publish to Google Sheets</span>
                  </>
                )}
              </Button>

              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 font-bold underline hover:text-green-300 flex items-center gap-1 uppercase"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Open Live Document ↗
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-white/5">
        <Button variant="secondary" onClick={onClose} className="!rounded-xl text-xs uppercase font-bold">Cancel</Button>
        <Button onClick={handleExport} className="!rounded-xl text-xs uppercase font-bold">
          Local CSV Export
        </Button>
      </div>
    </Modal>
  );
};

export default ExportReportModal;