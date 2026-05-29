
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, VC, UserRole, VCStatus, NewVCData, EmergencyVCData, Attendance, AttendanceStatus, AttendanceChangeRequest, AttendanceChangeRequestStatus, UserStatus, SalaryVoucher, SalaryStatus, Message, MessageAttachment, Roster, RosterRequestStatus } from '../types';
import { USERS, INITIAL_VCS, INITIAL_ATTENDANCE, INITIAL_ATTENDANCE_CHANGE_REQUESTS, INITIAL_MESSAGES, GLOBAL_CHAT_ID, INITIAL_ROSTERS } from '../constants';
import { playVcReminderTune } from '../utils/audio';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  vcs: VC[];
  attendance: Attendance[];
  attendanceChangeRequests: AttendanceChangeRequest[];
  salaryVouchers: SalaryVoucher[];
  messages: Message[];
  typingUsers: Record<string, string>; // Map<SenderId, ReceiverId> - Tracks who is typing to whom
  onlineUsers: string[]; // List of online user IDs
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (userId: string, password?: string) => boolean;
  logout: () => void;
  signUp: (name: string, phoneNumber: string, role: UserRole, password?: string) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  requestDeletion: (userId: string) => void;
  cancelDeletionRequest: (userId: string) => void;
  updateUserProfile: (userId: string, data: Partial<User>) => void; // New method
  getUsersByRole: (role: UserRole) => User[];
  getUserById: (userId: string) => User | undefined;
  scheduleVC: (vcData: Omit<NewVCData, 'managerId' | 'conductorId'> & { managerId: string, conductorId?: string }) => void;
  scheduleEmergencyVC: (vcData: Partial<EmergencyVCData>) => void;
  updateVCStatus: (vcId: string, status: VCStatus, remarks?: string, newStartTime?: string) => void;
  updateVCConductor: (vcId: string, conductorId: string) => void;
  updateVCLocations: (vcId: string, locations: string[]) => void;
  updateVCDetails: (vcId: string, updates: Partial<VC>) => void;
  reportTechnicalIssue: (vcId: string, description: string | null) => void; // New method
  updateUserReminderSettings: (userId: string, settings: { remindersEnabled: boolean; reminderMinutes: number; vcReminderTune?: string; technicalIssueTune?: string }) => void;
  cancelVC: (vcId: string) => void;
  markInTime: (conductorId: string) => void;
  markOutTime: (conductorId: string) => void;
  markOnLeave: (conductorId: string) => void;
  requestAttendanceChange: (data: Omit<AttendanceChangeRequest, 'id' | 'status' | 'createdAt'>) => void;
  approveAttendanceChange: (requestId: string) => void;
  rejectAttendanceChange: (requestId: string) => void;
  updateAttendanceRecord: (conductorId: string, date: string, inTime: string | undefined, outTime: string | undefined) => void;
  isAutopilotEnabled: boolean;
  setAutopilotEnabled: (enabled: boolean) => void;
  
  // Roster Methods
  rosters: Roster[];
  createRoster: (conductorId: string, date: string, startTime: string, endTime: string) => void;
  requestRosterChange: (rosterId: string, requestedDate: string, requestedStartTime: string, requestedEndTime: string, reason: string) => void;
  approveRosterChange: (rosterId: string) => void;
  rejectRosterChange: (rosterId: string) => void;
  
  // Salary Methods
  submitSalaryVoucher: (voucher: Omit<SalaryVoucher, 'id' | 'status' | 'createdAt'>) => void;
  approveSalaryVoucher: (voucherId: string) => void;
  rejectSalaryVoucher: (voucherId: string) => void;

  // Messaging Methods
  sendMessage: (receiverId: string, content: string, attachment?: MessageAttachment) => void;
  markAsRead: (chatId: string) => void;
  sendTypingSignal: (receiverId: string, isTyping: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get data from localStorage with fallback
const getLocalStorage = <T,>(key: string, initialValue: T): T => {
  if (typeof window === 'undefined') return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return initialValue;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage to persist data across reloads
  const [currentUser, setCurrentUser] = useState<User | null>(() => getLocalStorage('app_currentUser', null));
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = getLocalStorage('app_users', USERS);
    const seen = new Set<string>();
    return loaded.filter((u: User) => {
      if (u && u.id) {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      }
      return false;
    });
  });
  const [vcs, setVcs] = useState<VC[]>(() => {
    const loaded = getLocalStorage('app_vcs', INITIAL_VCS);
    const seen = new Set<string>();
    return loaded.filter((vc: VC) => {
      if (vc && vc.id) {
        if (seen.has(vc.id)) return false;
        seen.add(vc.id);
        return true;
      }
      return false;
    });
  });
  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const loaded = getLocalStorage('app_attendance', INITIAL_ATTENDANCE);
    const seen = new Set<string>();
    return loaded.filter((att: Attendance) => {
      if (att && att.conductorId && att.date) {
        const key = `${att.conductorId}-${att.date}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }
      return false;
    });
  });
  const [attendanceChangeRequests, setAttendanceChangeRequests] = useState<AttendanceChangeRequest[]>(() => {
    const loaded = getLocalStorage('app_attendanceRequests', INITIAL_ATTENDANCE_CHANGE_REQUESTS);
    const seen = new Set<string>();
    return loaded.filter((req: AttendanceChangeRequest) => {
      if (req && req.id) {
        if (seen.has(req.id)) return false;
        seen.add(req.id);
        return true;
      }
      return false;
    });
  });
  const [salaryVouchers, setSalaryVouchers] = useState<SalaryVoucher[]>(() => {
    const loaded = getLocalStorage('app_salaryVouchers', []);
    const seen = new Set<string>();
    return loaded.filter((v: SalaryVoucher) => {
      if (v && v.id) {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      }
      return false;
    });
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const loaded = getLocalStorage('app_messages', INITIAL_MESSAGES);
    const seen = new Set<string>();
    return loaded.filter((m: Message) => {
      if (m && m.id) {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      }
      return false;
    });
  });
  const [rosters, setRosters] = useState<Roster[]>(() => {
    const loaded = getLocalStorage('app_rosters', INITIAL_ROSTERS);
    const seen = new Set<string>();
    return loaded.filter((r: Roster) => {
      if (r && r.id) {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      }
      return false;
    });
  });
  const [isAutopilotEnabled, setAutopilotEnabled] = useState<boolean>(() => getLocalStorage('app_isAutopilotEnabled', false));
  
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('app_currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('app_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('app_vcs', JSON.stringify(vcs)); }, [vcs]);
  useEffect(() => { localStorage.setItem('app_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('app_attendanceRequests', JSON.stringify(attendanceChangeRequests)); }, [attendanceChangeRequests]);
  useEffect(() => { localStorage.setItem('app_salaryVouchers', JSON.stringify(salaryVouchers)); }, [salaryVouchers]);
  useEffect(() => { localStorage.setItem('app_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('app_rosters', JSON.stringify(rosters)); }, [rosters]);
  useEffect(() => { localStorage.setItem('app_isAutopilotEnabled', JSON.stringify(isAutopilotEnabled)); }, [isAutopilotEnabled]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Mock Online Status logic: When app loads, pick random users to be "online"
  useEffect(() => {
    const randomOnlineUsers = users.filter(() => Math.random() > 0.4).map(u => u.id);
    setOnlineUsers(randomOnlineUsers);
  }, []);

  // Update online status when logging in/out
  useEffect(() => {
    if (currentUser) {
        setOnlineUsers(prev => prev.includes(currentUser.id) ? prev : [...prev, currentUser.id]);
        // Update currentUser state reference if underlying user object changes (e.g. deletionRequested)
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser) {
           const fields: (keyof User) = 'name'; // We will map over exact keys
           const keysToCompare: (keyof User)[] = [
             'name', 'phoneNumber', 'role', 'status', 'deletionRequested', 
             'profilePhoto', 'remindersEnabled', 'reminderMinutes', 
             'vcReminderTune', 'technicalIssueTune', 'bankAccountNo', 
             'bankName', 'bankIfscCode', 'pfNumber', 'esicNumber'
           ];
           const hasChanges = keysToCompare.some(key => updatedUser[key] !== currentUser[key]);
           if (hasChanges) {
             setCurrentUser(updatedUser);
           }
        }
    }
  }, [currentUser, users]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const login = useCallback((userId: string, password?: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.password && user.password !== password) {
        alert("Incorrect password. Please try again.");
        return false;
      }

      if (user.status === UserStatus.Approved) {
        setCurrentUser(user);
        return true;
      } else if (user.status === UserStatus.Pending) {
        alert("Your account is currently awaiting verification by a Reporting Authority. Please try again later.");
        return false;
      } else if (user.status === UserStatus.Rejected) {
        alert("Your account registration has been rejected.");
        return false;
      }
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const signUp = useCallback((name: string, phoneNumber: string, role: UserRole, password?: string) => {
    if (role === UserRole.ReportingAuthority) {
        // Enforce single Reporting Authority rule
        const existingRA = users.find(u => u.role === UserRole.ReportingAuthority && u.status !== UserStatus.Rejected);
        if (existingRA) {
            alert("Only one Reporting Authority user is allowed. An account already exists.");
            return;
        }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      phoneNumber,
      role,
      password,
      remindersEnabled: true,
      reminderMinutes: 30,
      status: UserStatus.Pending, // New users are Pending by default
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
  }, [users]);

  const approveUser = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: UserStatus.Approved } : u));
    alert("User has been approved and can now log in.");
  }, []);

  const rejectUser = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: UserStatus.Rejected } : u));
    alert("User registration has been rejected.");
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  }, []);

  const requestDeletion = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, deletionRequested: true } : u));
  }, []);

  const cancelDeletionRequest = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, deletionRequested: false } : u));
  }, []);

  const updateUserProfile = useCallback((userId: string, data: Partial<User>) => {
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === userId) {
        const updatedUser = { ...u, ...data };
        return updatedUser;
      }
      return u;
    }));
    setCurrentUser(current => {
      if (current && current.id === userId) {
        return { ...current, ...data };
      }
      return current;
    });
  }, []);

  const getUsersByRole = useCallback((role: UserRole) => {
    // Only return Approved users so Pending users cannot be assigned to VCs
    return users.filter(user => user.role === role && user.status === UserStatus.Approved);
  }, [users]);

  const getUserById = useCallback((userId: string) => {
    return users.find(user => user.id === userId);
  }, [users]);

  const scheduleVC = useCallback((vcData: Omit<NewVCData, 'managerId' | 'conductorId'> & { managerId: string, conductorId?: string }) => {
    const newVC: VC = {
      ...vcData,
      id: `vc-${Date.now()}`,
      status: VCStatus.Scheduled,
      createdAt: new Date().toISOString(),
    };
    setVcs(prevVcs => [...prevVcs, newVC].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const scheduleEmergencyVC = useCallback((vcData: Partial<EmergencyVCData>) => {
    const newVC: VC = {
      id: `vc-emergency-${Date.now()}`,
      status: VCStatus.Scheduled,
      createdAt: new Date().toISOString(),
      subject: `[EMERGENCY] ${vcData.subject || 'Emergency Meeting'}`,
      locations: vcData.locations && vcData.locations.length > 0 ? vcData.locations : ['TBD'],
      roomIp: vcData.roomIp,
      startTime: vcData.startTime || new Date().toISOString(),
      managerId: vcData.managerId || '',
      reportingAuthorityId: vcData.reportingAuthorityId || '',
      conductorId: vcData.conductorId || undefined,
      link: vcData.link,
      pptLink: vcData.pptLink,
    };
    setVcs(prevVcs => [...prevVcs, newVC].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const updateVCStatus = useCallback((vcId: string, status: VCStatus, remarks?: string, newStartTime?: string) => {
    setVcs(prevVcs => prevVcs.map(vc => {
      if (vc.id === vcId) {
        const updatedVC = { ...vc, status };
        if (status === VCStatus.InProgress) {
          updatedVC.actualStartTime = new Date().toISOString();
        }
        if (status === VCStatus.Completed) {
          updatedVC.actualEndTime = new Date().toISOString();
          if (remarks) {
            updatedVC.remarks = remarks;
          }
        }
        if (status === VCStatus.Postponed && newStartTime) {
            updatedVC.startTime = newStartTime;
            if (remarks) {
                updatedVC.remarks = remarks;
            }
        }
        return updatedVC;
      }
      return vc;
    }));
  }, []);
  
  const updateVCConductor = useCallback((vcId: string, conductorId: string) => {
    setVcs(prevVcs => prevVcs.map(vc => vc.id === vcId ? { ...vc, conductorId } : vc));
  }, []);

  const updateVCLocations = useCallback((vcId: string, locations: string[]) => {
    setVcs(prevVcs => prevVcs.map(vc => vc.id === vcId ? { ...vc, locations } : vc));
  }, []);

  const updateVCDetails = useCallback((vcId: string, updates: Partial<VC>) => {
    setVcs(prevVcs => prevVcs.map(vc => vc.id === vcId ? { ...vc, ...updates } : vc));
  }, []);

  const reportTechnicalIssue = useCallback((vcId: string, description: string | null) => {
    setVcs(prevVcs => prevVcs.map(vc => {
        if (vc.id === vcId) {
            return {
                ...vc,
                technicalIssue: !!description,
                technicalIssueDescription: description || undefined
            };
        }
        return vc;
    }));
  }, []);

  const updateUserReminderSettings = useCallback((userId: string, settings: { remindersEnabled: boolean; reminderMinutes: number; vcReminderTune?: string; technicalIssueTune?: string }) => {
    const updateUser = (user: User | null) => {
      if (!user) return null;
      return { ...user, ...settings };
    }

    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updateUser(u)! : u));
  }, []);

  const cancelVC = useCallback((vcId: string) => {
     setVcs(prevVcs => prevVcs.map(vc => vc.id === vcId ? { ...vc, status: VCStatus.Cancelled } : vc));
  }, []);
  
  const markInTime = useCallback((conductorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const alreadyMarked = attendance.some(a => a.conductorId === conductorId && a.date === today);

    if (alreadyMarked) {
      alert("Attendance has already been marked for today.");
      return;
    }

    const newRecord: Attendance = {
      conductorId,
      date: today,
      status: AttendanceStatus.Present,
      inTime: new Date().toISOString(),
    };
    setAttendance(prev => [...prev, newRecord]);
  }, [attendance]);

  const markOutTime = useCallback((conductorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendance(prev => prev.map(a => {
        if (a.conductorId === conductorId && a.date === today && a.status === AttendanceStatus.Present) {
            if (a.outTime) {
                alert("Out time has already been marked.");
                return a;
            }
            return { ...a, outTime: new Date().toISOString() };
        }
        return a;
    }));
  }, []);

  const markOnLeave = useCallback((conductorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const alreadyMarked = attendance.some(a => a.conductorId === conductorId && a.date === today);

    if (alreadyMarked) {
      alert("Attendance has already been marked for today.");
      return;
    }

    const newRecord: Attendance = {
      conductorId,
      date: today,
      status: AttendanceStatus.OnLeave,
    };
    setAttendance(prev => [...prev, newRecord]);
  }, [attendance]);

  const requestAttendanceChange = useCallback((data: Omit<AttendanceChangeRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: AttendanceChangeRequest = {
      ...data,
      id: `att-req-${Date.now()}`,
      status: AttendanceChangeRequestStatus.Pending,
      createdAt: new Date().toISOString(),
    };
    setAttendanceChangeRequests(prev => [...prev, newRequest].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    alert('Your attendance change request has been submitted.');
  }, []);

  const approveAttendanceChange = useCallback((requestId: string) => {
    const request = attendanceChangeRequests.find(r => r.id === requestId);
    if (!request) return;

    setAttendance(prev => {
      const existingRecordIndex = prev.findIndex(a => a.conductorId === request.conductorId && a.date === request.date);
      if (existingRecordIndex > -1) {
        return prev.map((att, index) => index === existingRecordIndex ? { ...att, status: AttendanceStatus.Present, inTime: request.requestedInTime, outTime: request.requestedOutTime || undefined } : att);
      } else {
        const newRecord: Attendance = {
          conductorId: request.conductorId,
          date: request.date,
          status: AttendanceStatus.Present,
          inTime: request.requestedInTime,
          outTime: request.requestedOutTime || undefined,
        };
        return [...prev, newRecord];
      }
    });

    setAttendanceChangeRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: AttendanceChangeRequestStatus.Approved } : r));
  }, [attendanceChangeRequests]);

  const rejectAttendanceChange = useCallback((requestId: string) => {
    setAttendanceChangeRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: AttendanceChangeRequestStatus.Rejected } : r));
  }, []);

  const updateAttendanceRecord = useCallback((conductorId: string, date: string, inTime: string | undefined, outTime: string | undefined) => {
    setAttendance(prev => {
      const existingRecordIndex = prev.findIndex(a => a.conductorId === conductorId && a.date === date);
      
      if (existingRecordIndex === -1 && !inTime) {
          alert("Cannot create a record without an In-Time.");
          return prev;
      }

      if (existingRecordIndex > -1) {
        return prev.map((att, index) => index === existingRecordIndex ? { ...att, status: AttendanceStatus.Present, inTime, outTime } : att);
      } else {
        const newRecord: Attendance = {
          conductorId,
          date,
          status: AttendanceStatus.Present,
          inTime,
          outTime,
        };
        return [...prev, newRecord];
      }
    });
    alert('Attendance record updated.');
  }, []);

  // --- Salary Logic ---
  
  const submitSalaryVoucher = useCallback((data: Omit<SalaryVoucher, 'id' | 'status' | 'createdAt'>) => {
    let initialStatus = SalaryStatus.PendingManager;
    // If creator is Conductor or RailTel, needs RA approval first
    if (currentUser?.role === UserRole.Conductor || currentUser?.role === UserRole.RailTel) {
        initialStatus = SalaryStatus.PendingRA;
    }
    // If creator is Manager, auto approve? Or keep as draft? Let's auto approve for self.
    if (currentUser?.role === UserRole.Manager) {
        initialStatus = SalaryStatus.Approved;
    }

    const newVoucher: SalaryVoucher = {
      ...data,
      id: `voucher-${Date.now()}`,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      ...(initialStatus === SalaryStatus.Approved && currentUser ? { 
          passedByManagerId: currentUser.id, 
          passedDate: new Date().toISOString() 
      } : {})
    };

    setSalaryVouchers(prev => [newVoucher, ...prev]);
    alert('Voucher submitted successfully.');
  }, [currentUser]);

  const approveSalaryVoucher = useCallback((voucherId: string) => {
    if (!currentUser) return;

    setSalaryVouchers(prev => prev.map(voucher => {
        if (voucher.id === voucherId) {
            if (currentUser.role === UserRole.ReportingAuthority && voucher.status === SalaryStatus.PendingRA) {
                return { 
                    ...voucher, 
                    status: SalaryStatus.PendingManager, 
                    checkedByRaId: currentUser.id,
                    checkedDate: new Date().toISOString()
                };
            }
            if (currentUser.role === UserRole.Manager && voucher.status === SalaryStatus.PendingManager) {
                return { 
                    ...voucher, 
                    status: SalaryStatus.Approved,
                    passedByManagerId: currentUser.id,
                    passedDate: new Date().toISOString()
                };
            }
        }
        return voucher;
    }));
  }, [currentUser]);

  const rejectSalaryVoucher = useCallback((voucherId: string) => {
    setSalaryVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, status: SalaryStatus.Rejected } : v));
  }, []);

  // --- Roster Logic ---
  const createRoster = useCallback((conductorId: string, date: string, startTime: string, endTime: string) => {
    const newRoster: Roster = {
      id: `roster-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conductorId,
      date,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
    };
    setRosters(prev => {
      const filtered = prev.filter(r => !(r.conductorId === conductorId && r.date === date));
      return [...filtered, newRoster];
    });
    alert('Roster created/updated successfully.');
  }, []);

  const requestRosterChange = useCallback((rosterId: string, requestedDate: string, requestedStartTime: string, requestedEndTime: string, reason: string) => {
    setRosters(prev => prev.map(r => {
      if (r.id === rosterId) {
        return {
          ...r,
          changeRequested: true,
          requestedDate,
          requestedStartTime,
          requestedEndTime,
          changeReason: reason,
          changeRequestStatus: RosterRequestStatus.Pending
        };
      }
      return r;
    }));
    alert('Roster change request submitted to Reporting Authority.');
  }, []);

  const approveRosterChange = useCallback((rosterId: string) => {
    setRosters(prev => prev.map(r => {
      if (r.id === rosterId && r.changeRequested) {
        return {
          ...r,
          date: r.requestedDate || r.date,
          startTime: r.requestedStartTime || r.startTime,
          endTime: r.requestedEndTime || r.endTime,
          changeRequested: false,
          changeRequestStatus: RosterRequestStatus.Approved,
        };
      }
      return r;
    }));
    alert('Roster change request approved.');
  }, []);

  const rejectRosterChange = useCallback((rosterId: string) => {
    setRosters(prev => prev.map(r => {
      if (r.id === rosterId) {
        return {
          ...r,
          changeRequested: false,
          changeRequestStatus: RosterRequestStatus.Rejected
        };
      }
      return r;
    }));
    alert('Roster change request declined.');
  }, []);

  // --- Messaging Logic ---

  const sendMessage = useCallback((receiverId: string, content: string, attachment?: MessageAttachment) => {
    if (!currentUser) return;

    // Simulate End-to-End Encryption for Direct Messages (Text Content Only)
    // We use a base64 encoding with proper unicode support to simulate encrypted storage.
    let processedContent = content;
    
    if (receiverId !== GLOBAL_CHAT_ID && content) {
        // Simple mock encryption for text
        try {
            processedContent = `ENC::${btoa(unescape(encodeURIComponent(content)))}`;
        } catch (e) {
            console.error("Encryption failed", e);
        }
    }
    
    // Check if recipient is online for "Delivered" status (Simulated)
    // In Global Chat, we just assume delivered to server.
    // In DM, if user is in onlineUsers, it's delivered.
    const isReceiverOnline = onlineUsers.includes(receiverId);
    const initialDeliveredTo = isReceiverOnline ? [receiverId] : [];

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        receiverId,
        content: processedContent,
        timestamp: new Date().toISOString(),
        readBy: [currentUser.id],
        deliveredTo: initialDeliveredTo,
        attachment: attachment
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Clear typing status when message is sent
    setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[currentUser.id];
        return newState;
    });

  }, [currentUser, onlineUsers, users]);

  const markAsRead = useCallback((chatId: string) => {
    if (!currentUser) return;
    
    setMessages(prev => prev.map(msg => {
      // For Global Chat: If message is in GLOBAL chat and I haven't read it
      const isGlobalMsg = chatId === GLOBAL_CHAT_ID && msg.receiverId === GLOBAL_CHAT_ID;
      
      // For DM: If message is FROM contact (chatId) TO me and I haven't read it
      const isDmFromContact = msg.senderId === chatId && msg.receiverId === currentUser.id;
      
      if ((isGlobalMsg || isDmFromContact) && !msg.readBy.includes(currentUser.id)) {
        // Logic: If I read it, it implies it was delivered to me too.
        const newReadBy = [...msg.readBy, currentUser.id];
        const newDeliveredTo = msg.deliveredTo.includes(currentUser.id) 
            ? msg.deliveredTo 
            : [...msg.deliveredTo, currentUser.id];

        return { ...msg, readBy: newReadBy, deliveredTo: newDeliveredTo };
      }
      return msg;
    }));
  }, [currentUser]);

  const sendTypingSignal = useCallback((receiverId: string, isTyping: boolean) => {
    if (!currentUser) return;

    setTypingUsers(prev => {
        if (isTyping) {
            return { ...prev, [currentUser.id]: receiverId };
        } else {
            const newState = { ...prev };
            delete newState[currentUser.id];
            return newState;
        }
    });
  }, [currentUser]);

  useEffect(() => {
    const timerIds: number[] = [];
    if (!currentUser || !currentUser.remindersEnabled || typeof currentUser.reminderMinutes !== 'number') {
      return;
    }

    const now = new Date().getTime();
    const applicableVCs = vcs.filter(vc => vc.status === VCStatus.Scheduled);

    const scheduleReminder = (vc: VC) => {
        const vcStartTime = new Date(vc.startTime).getTime();
        const reminderTime = vcStartTime - ((currentUser.reminderMinutes || 30) * 60 * 1000);
        const delay = reminderTime - now;

        if (delay > 0) {
            const timerId = window.setTimeout(() => {
                playVcReminderTune(currentUser?.vcReminderTune ?? 'crystal');
                alert(`Reminder: Your VC "${vc.subject}" is starting in ${currentUser.reminderMinutes} minutes.`);
            }, delay);
            timerIds.push(timerId);
        }
    };

    if (currentUser.role === UserRole.Manager) {
        applicableVCs.filter(vc => vc.managerId === currentUser.id).forEach(scheduleReminder);
    } else if (currentUser.role === UserRole.ReportingAuthority) {
        applicableVCs.filter(vc => vc.reportingAuthorityId === currentUser.id).forEach(scheduleReminder);
    } else if (currentUser.role === UserRole.Conductor) {
        applicableVCs.filter(vc => vc.conductorId === currentUser.id).forEach(scheduleReminder);
    } else if (currentUser.role === UserRole.RailTel) {
        // RailTel monitors all VCs for technical readiness.
        applicableVCs.forEach(scheduleReminder);
    }
    
    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [currentUser, vcs]);

  const value = useMemo(() => ({
    currentUser,
    users,
    vcs,
    attendance,
    theme,
    salaryVouchers,
    messages,
    typingUsers,
    onlineUsers,
    toggleTheme,
    login,
    logout,
    signUp,
    approveUser,
    rejectUser,
    deleteUser,
    requestDeletion,
    cancelDeletionRequest,
    updateUserProfile,
    getUsersByRole,
    getUserById,
    scheduleVC,
    scheduleEmergencyVC,
    updateVCStatus,
    updateVCConductor,
    updateVCLocations,
    updateVCDetails,
    reportTechnicalIssue,
    updateUserReminderSettings,
    cancelVC,
    markInTime,
    markOutTime,
    markOnLeave,
    attendanceChangeRequests,
    requestAttendanceChange,
    approveAttendanceChange,
    rejectAttendanceChange,
    updateAttendanceRecord,
    isAutopilotEnabled,
    setAutopilotEnabled,
    submitSalaryVoucher,
    approveSalaryVoucher,
    rejectSalaryVoucher,
    sendMessage,
    markAsRead,
    sendTypingSignal,
    rosters,
    createRoster,
    requestRosterChange,
    approveRosterChange,
    rejectRosterChange
  }), [currentUser, users, vcs, attendance, theme, salaryVouchers, messages, typingUsers, onlineUsers, toggleTheme, login, logout, signUp, approveUser, rejectUser, deleteUser, requestDeletion, cancelDeletionRequest, updateUserProfile, getUsersByRole, getUserById, scheduleVC, scheduleEmergencyVC, updateVCStatus, updateVCConductor, updateVCLocations, updateVCDetails, reportTechnicalIssue, updateUserReminderSettings, cancelVC, markInTime, markOutTime, markOnLeave, attendanceChangeRequests, requestAttendanceChange, approveAttendanceChange, rejectAttendanceChange, updateAttendanceRecord, isAutopilotEnabled, setAutopilotEnabled, submitSalaryVoucher, approveSalaryVoucher, rejectSalaryVoucher, sendMessage, markAsRead, sendTypingSignal, rosters, createRoster, requestRosterChange, approveRosterChange, rejectRosterChange]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
