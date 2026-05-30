
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';
import { User, VC, UserRole, VCStatus, NewVCData, EmergencyVCData, Attendance, AttendanceStatus, AttendanceChangeRequest, AttendanceChangeRequestStatus, UserStatus, SalaryVoucher, SalaryStatus, Message, MessageAttachment, Roster, RosterRequestStatus } from '../types';
import { USERS, INITIAL_VCS, INITIAL_ATTENDANCE, INITIAL_ATTENDANCE_CHANGE_REQUESTS, INITIAL_MESSAGES, GLOBAL_CHAT_ID, INITIAL_ROSTERS } from '../constants';
import { playVcReminderTune } from '../utils/audio';

import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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
  // Initialize state from LocalStorage to persist data across reloads (only essential UI setups)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getLocalStorage('app_currentUser', null));
  const [users, setUsers] = useState<User[]>([]);
  const [vcs, setVcs] = useState<VC[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [attendanceChangeRequests, setAttendanceChangeRequests] = useState<AttendanceChangeRequest[]>([]);
  const [salaryVouchers, setSalaryVouchers] = useState<SalaryVoucher[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [isAutopilotEnabled, setAutopilotEnabled] = useState<boolean>(() => getLocalStorage('app_isAutopilotEnabled', false));
  
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const markedMessagesRef = useRef<Set<string>>(new Set());
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  // =========================================================================
  // --- REAL-TIME FIRESTORE SUBSCRIPTIONS ---
  // =========================================================================

  // Users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (snapshot.empty) {
        USERS.forEach(async (u) => {
          try {
            await setDoc(doc(db, 'users', u.id), u);
          } catch (e) {
            console.error('Failed seeding user', e);
          }
        });
      } else {
        const fetched: User[] = [];
        snapshot.forEach((d) => {
          fetched.push(d.data() as User);
        });
        setUsers(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });
    return unsubscribe;
  }, []);

  // VCs
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vcs'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_VCS.forEach(async (vc) => {
          try {
            await setDoc(doc(db, 'vcs', vc.id), vc);
          } catch (e) {
            console.error('Failed seeding VC', e);
          }
        });
      } else {
        const fetched: VC[] = [];
        snapshot.forEach((d) => {
          fetched.push(d.data() as VC);
        });
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setVcs(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vcs');
    });
    return unsubscribe;
  }, []);

  // Attendance
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_ATTENDANCE.forEach(async (att) => {
          try {
            const compositeId = `${att.conductorId}-${att.date}`;
            await setDoc(doc(db, 'attendance', compositeId), att);
          } catch (e) {
            console.error('Failed seeding attendance', e);
          }
        });
      } else {
        const fetched: Attendance[] = [];
        snapshot.forEach((d) => {
          fetched.push(d.data() as Attendance);
        });
        setAttendance(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'attendance');
    });
    return unsubscribe;
  }, []);

  // Attendance Change Requests
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'attendanceChangeRequests'), (snapshot) => {
      const fetched: AttendanceChangeRequest[] = [];
      snapshot.forEach((d) => {
        fetched.push(d.data() as AttendanceChangeRequest);
      });
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAttendanceChangeRequests(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'attendanceChangeRequests');
    });
    return unsubscribe;
  }, []);

  // Salary Vouchers
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'salaryVouchers'), (snapshot) => {
      const fetched: SalaryVoucher[] = [];
      snapshot.forEach((d) => {
        fetched.push(d.data() as SalaryVoucher);
      });
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSalaryVouchers(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'salaryVouchers');
    });
    return unsubscribe;
  }, []);

  // Messages
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'messages'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_MESSAGES.forEach(async (msg) => {
          try {
            await setDoc(doc(db, 'messages', msg.id), msg);
          } catch (e) {
            console.error('Failed seeding message', e);
          }
        });
      } else {
        const fetched: Message[] = [];
        snapshot.forEach((d) => {
          fetched.push(d.data() as Message);
        });
        fetched.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
    });
    return unsubscribe;
  }, []);

  // Rosters
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'rosters'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_ROSTERS.forEach(async (r) => {
          try {
            await setDoc(doc(db, 'rosters', r.id), r);
          } catch (e) {
            console.error('Failed seeding roster', e);
          }
        });
      } else {
        const fetched: Roster[] = [];
        snapshot.forEach((d) => {
          fetched.push(d.data() as Roster);
        });
        setRosters(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'rosters');
    });
    return unsubscribe;
  }, []);

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('app_currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('app_isAutopilotEnabled', JSON.stringify(isAutopilotEnabled)); }, [isAutopilotEnabled]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Mock Online Status logic: When users populate, pick random users to be "online"
  useEffect(() => {
    if (users.length > 0 && onlineUsers.length === 0) {
      const randomOnlineUsers = users.filter(() => Math.random() > 0.4).map(u => u.id);
      setOnlineUsers(randomOnlineUsers);
    }
  }, [users, onlineUsers]);

  // Update online status when logging in/out
  useEffect(() => {
    if (currentUser) {
        setOnlineUsers(prev => prev.includes(currentUser.id) ? prev : [...prev, currentUser.id]);
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser) {
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

  const signUp = useCallback(async (name: string, phoneNumber: string, role: UserRole, password?: string) => {
    if (role === UserRole.ReportingAuthority) {
        // Enforce single Reporting Authority rule
        const existingRA = users.find(u => u.role === UserRole.ReportingAuthority && u.status !== UserStatus.Rejected);
        if (existingRA) {
            alert("Only one Reporting Authority user is allowed. An account already exists.");
            return;
        }
    }

    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name,
      phoneNumber,
      role,
      password,
      remindersEnabled: true,
      reminderMinutes: 30,
      status: UserStatus.Pending, // New users are Pending by default
    };
    try {
      await setDoc(doc(db, 'users', userId), newUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}`);
    }
  }, [users]);

  const approveUser = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: UserStatus.Approved });
      alert("User has been approved and can now log in.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  }, []);

  const rejectUser = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: UserStatus.Rejected });
      alert("User registration has been rejected.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}`);
    }
  }, []);

  const requestDeletion = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { deletionRequested: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  }, []);

  const cancelDeletionRequest = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { deletionRequested: false });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  }, []);

  const updateUserProfile = useCallback(async (userId: string, data: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      setCurrentUser(current => {
        if (current && current.id === userId) {
          return { ...current, ...data };
        }
        return current;
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  }, []);

  const getUsersByRole = useCallback((role: UserRole) => {
    // Only return Approved users so Pending users cannot be assigned to VCs
    return users.filter(user => user.role === role && user.status === UserStatus.Approved);
  }, [users]);

  const getUserById = useCallback((userId: string) => {
    return users.find(user => user.id === userId);
  }, [users]);

  const scheduleVC = useCallback(async (vcData: Omit<NewVCData, 'managerId' | 'conductorId'> & { managerId: string, conductorId?: string }) => {
    const vcId = `vc-${Date.now()}`;
    const newVC: VC = {
      ...vcData,
      id: vcId,
      status: VCStatus.Scheduled,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'vcs', vcId), newVC);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `vcs/${vcId}`);
    }
  }, []);

  const scheduleEmergencyVC = useCallback(async (vcData: Partial<EmergencyVCData>) => {
    const vcId = `vc-emergency-${Date.now()}`;
    const newVC: VC = {
      ...vcData,
      id: vcId,
      status: VCStatus.Scheduled,
      createdAt: new Date().toISOString(),
      subject: `[EMERGENCY] ${vcData.subject || 'Emergency Meeting'}`,
      locations: vcData.locations && vcData.locations.length > 0 ? vcData.locations : ['TBD'],
      roomIp: vcData.roomIp || '',
      startTime: vcData.startTime || new Date().toISOString(),
      managerId: vcData.managerId || '',
      reportingAuthorityId: vcData.reportingAuthorityId || '',
      conductorId: vcData.conductorId || undefined,
      link: vcData.link || '',
      pptLink: vcData.pptLink || '',
    };
    try {
      await setDoc(doc(db, 'vcs', vcId), newVC);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `vcs/${vcId}`);
    }
  }, []);

  const updateVCStatus = useCallback(async (vcId: string, status: VCStatus, remarks?: string, newStartTime?: string) => {
    const updates: Partial<VC> = { status };
    if (status === VCStatus.InProgress) {
      updates.actualStartTime = new Date().toISOString();
    }
    if (status === VCStatus.Completed) {
      updates.actualEndTime = new Date().toISOString();
      if (remarks) {
        updates.remarks = remarks;
      }
    }
    if (status === VCStatus.Postponed && newStartTime) {
      updates.startTime = newStartTime;
      if (remarks) {
        updates.remarks = remarks;
      }
    }
    try {
      await updateDoc(doc(db, 'vcs', vcId), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `vcs/${vcId}`);
    }
  }, []);
  
  const updateVCConductor = useCallback(async (vcId: string, conductorId: string) => {
    try {
      await updateDoc(doc(db, 'vcs', vcId), { conductorId });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `vcs/${vcId}`);
    }
  }, []);

  const updateVCLocations = useCallback(async (vcId: string, locations: string[]) => {
    try {
      await updateDoc(doc(db, 'vcs', vcId), { locations });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `vcs/${vcId}`);
    }
  }, []);

  const updateVCDetails = useCallback(async (vcId: string, updates: Partial<VC>) => {
    try {
      await updateDoc(doc(db, 'vcs', vcId), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `vcs/${vcId}`);
    }
  }, []);

  const reportTechnicalIssue = useCallback(async (vcId: string, description: string | null) => {
    try {
      await updateDoc(doc(db, 'vcs', vcId), {
        technicalIssue: !!description,
        technicalIssueDescription: description || undefined
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `vcs/${vcId}`);
    }
  }, []);

  const updateUserReminderSettings = useCallback(async (userId: string, settings: { remindersEnabled: boolean; reminderMinutes: number; vcReminderTune?: string; technicalIssueTune?: string }) => {
    try {
      await updateDoc(doc(db, 'users', userId), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  }, []);

  const cancelVC = useCallback(async (vcId: string) => {
    try {
      await updateDoc(doc(db, 'vcs', vcId), { status: VCStatus.Cancelled });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `vcs/${vcId}`);
    }
  }, []);
  
  const markInTime = useCallback(async (conductorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const alreadyMarked = attendance.some(a => a.conductorId === conductorId && a.date === today);

    if (alreadyMarked) {
      alert("Attendance has already been marked for today.");
      return;
    }

    const compositeId = `${conductorId}-${today}`;
    const newRecord: Attendance = {
      conductorId,
      date: today,
      status: AttendanceStatus.Present,
      inTime: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'attendance', compositeId), newRecord);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `attendance/${compositeId}`);
    }
  }, [attendance]);

  const markOutTime = useCallback(async (conductorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const record = attendance.find(a => a.conductorId === conductorId && a.date === today && a.status === AttendanceStatus.Present);
    if (!record) return;

    if (record.outTime) {
      alert("Out time has already been marked.");
      return;
    }

    const compositeId = `${conductorId}-${today}`;
    try {
      await updateDoc(doc(db, 'attendance', compositeId), { outTime: new Date().toISOString() });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `attendance/${compositeId}`);
    }
  }, [attendance]);

  const markOnLeave = useCallback(async (conductorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const alreadyMarked = attendance.some(a => a.conductorId === conductorId && a.date === today);

    if (alreadyMarked) {
      alert("Attendance has already been marked for today.");
      return;
    }

    const compositeId = `${conductorId}-${today}`;
    const newRecord: Attendance = {
      conductorId,
      date: today,
      status: AttendanceStatus.OnLeave,
    };
    try {
      await setDoc(doc(db, 'attendance', compositeId), newRecord);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `attendance/${compositeId}`);
    }
  }, [attendance]);

  const requestAttendanceChange = useCallback(async (data: Omit<AttendanceChangeRequest, 'id' | 'status' | 'createdAt'>) => {
    const requestId = `att-req-${Date.now()}`;
    const newRequest: AttendanceChangeRequest = {
      ...data,
      id: requestId,
      status: AttendanceChangeRequestStatus.Pending,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'attendanceChangeRequests', requestId), newRequest);
      alert('Your attendance change request has been submitted.');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `attendanceChangeRequests/${requestId}`);
    }
  }, []);

  const approveAttendanceChange = useCallback(async (requestId: string) => {
    const request = attendanceChangeRequests.find(r => r.id === requestId);
    if (!request) return;

    const compositeId = `${request.conductorId}-${request.date}`;
    const newRecord: Attendance = {
      conductorId: request.conductorId,
      date: request.date,
      status: AttendanceStatus.Present,
      inTime: request.requestedInTime,
      outTime: request.requestedOutTime || undefined,
    };

    try {
      await setDoc(doc(db, 'attendance', compositeId), newRecord);
      await updateDoc(doc(db, 'attendanceChangeRequests', requestId), { status: AttendanceChangeRequestStatus.Approved });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `attendanceChangeRequests/${requestId}`);
    }
  }, [attendanceChangeRequests]);

  const rejectAttendanceChange = useCallback(async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'attendanceChangeRequests', requestId), { status: AttendanceChangeRequestStatus.Rejected });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `attendanceChangeRequests/${requestId}`);
    }
  }, []);

  const updateAttendanceRecord = useCallback(async (conductorId: string, date: string, inTime: string | undefined, outTime: string | undefined) => {
    const compositeId = `${conductorId}-${date}`;
    
    if (!inTime) {
      alert("Cannot create a record without an In-Time.");
      return;
    }

    const newRecord: Attendance = {
      conductorId,
      date,
      status: AttendanceStatus.Present,
      inTime,
      outTime: outTime || undefined,
    };

    try {
      await setDoc(doc(db, 'attendance', compositeId), newRecord);
      alert('Attendance record updated.');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `attendance/${compositeId}`);
    }
  }, []);

  // --- Salary Logic ---
  
  const submitSalaryVoucher = useCallback(async (data: Omit<SalaryVoucher, 'id' | 'status' | 'createdAt'>) => {
    let initialStatus = SalaryStatus.PendingManager;
    // If creator is Conductor or RailTel, needs RA approval first
    if (currentUser?.role === UserRole.Conductor || currentUser?.role === UserRole.RailTel) {
        initialStatus = SalaryStatus.PendingRA;
    }
    // If creator is Manager, auto approve? Or keep as draft? Let's auto approve for self.
    if (currentUser?.role === UserRole.Manager) {
        initialStatus = SalaryStatus.Approved;
    }

    const voucherId = `voucher-${Date.now()}`;
    const newVoucher: SalaryVoucher = {
      ...data,
      id: voucherId,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      ...(initialStatus === SalaryStatus.Approved && currentUser ? { 
          passedByManagerId: currentUser.id, 
          passedDate: new Date().toISOString() 
      } : {})
    };

    try {
      await setDoc(doc(db, 'salaryVouchers', voucherId), newVoucher);
      alert('Voucher submitted successfully.');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `salaryVouchers/${voucherId}`);
    }
  }, [currentUser]);

  const approveSalaryVoucher = useCallback(async (voucherId: string) => {
    if (!currentUser) return;
    const voucher = salaryVouchers.find(v => v.id === voucherId);
    if (!voucher) return;

    const updates: Partial<SalaryVoucher> = {};
    if (currentUser.role === UserRole.ReportingAuthority && voucher.status === SalaryStatus.PendingRA) {
      updates.status = SalaryStatus.PendingManager;
      updates.checkedByRaId = currentUser.id;
      updates.checkedDate = new Date().toISOString();
    } else if (currentUser.role === UserRole.Manager && voucher.status === SalaryStatus.PendingManager) {
      updates.status = SalaryStatus.Approved;
      updates.passedByManagerId = currentUser.id;
      updates.passedDate = new Date().toISOString();
    } else {
      return;
    }

    try {
      await updateDoc(doc(db, 'salaryVouchers', voucherId), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `salaryVouchers/${voucherId}`);
    }
  }, [currentUser, salaryVouchers]);

  const rejectSalaryVoucher = useCallback(async (voucherId: string) => {
    try {
      await updateDoc(doc(db, 'salaryVouchers', voucherId), { status: SalaryStatus.Rejected });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `salaryVouchers/${voucherId}`);
    }
  }, []);

  // --- Roster Logic ---
  const createRoster = useCallback(async (conductorId: string, date: string, startTime: string, endTime: string) => {
    const rosterId = `roster-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newRoster: Roster = {
      id: rosterId,
      conductorId,
      date,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'rosters', rosterId), newRoster);
      alert('Roster created/updated successfully.');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `rosters/${rosterId}`);
    }
  }, []);

  const requestRosterChange = useCallback(async (rosterId: string, requestedDate: string, requestedStartTime: string, requestedEndTime: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'rosters', rosterId), {
        changeRequested: true,
        requestedDate,
        requestedStartTime,
        requestedEndTime,
        changeReason: reason,
        changeRequestStatus: RosterRequestStatus.Pending
      });
      alert('Roster change request submitted to Reporting Authority.');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rosters/${rosterId}`);
    }
  }, []);

  const approveRosterChange = useCallback(async (rosterId: string) => {
    const roster = rosters.find(r => r.id === rosterId);
    if (!roster) return;

    try {
      await updateDoc(doc(db, 'rosters', rosterId), {
        date: roster.requestedDate || roster.date,
        startTime: roster.requestedStartTime || roster.startTime,
        endTime: roster.requestedEndTime || roster.endTime,
        changeRequested: false,
        changeRequestStatus: RosterRequestStatus.Approved,
      });
      alert('Roster change request approved.');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rosters/${rosterId}`);
    }
  }, [rosters]);

  const rejectRosterChange = useCallback(async (rosterId: string) => {
    try {
      await updateDoc(doc(db, 'rosters', rosterId), {
        changeRequested: false,
        changeRequestStatus: RosterRequestStatus.Rejected
      });
      alert('Roster change request declined.');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rosters/${rosterId}`);
    }
  }, []);

  // --- Messaging Logic ---

  const sendMessage = useCallback(async (receiverId: string, content: string, attachment?: MessageAttachment) => {
    if (!currentUser) return;

    let processedContent = content;
    
    if (receiverId !== GLOBAL_CHAT_ID && content) {
        try {
            processedContent = `ENC::${btoa(unescape(encodeURIComponent(content)))}`;
        } catch (e) {
            console.error("Encryption failed", e);
        }
    }
    
    const isReceiverOnline = onlineUsers.includes(receiverId);
    const initialDeliveredTo = isReceiverOnline ? [receiverId] : [];

    const msgId = `msg-${Date.now()}`;
    const newMessage: Message = {
        id: msgId,
        senderId: currentUser.id,
        receiverId,
        content: processedContent,
        timestamp: new Date().toISOString(),
        readBy: [currentUser.id],
        deliveredTo: initialDeliveredTo,
        attachment: attachment
    };

    try {
      await setDoc(doc(db, 'messages', msgId), newMessage);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `messages/${msgId}`);
    }
    
    // Clear typing status when message is sent
    setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[currentUser.id];
        return newState;
    });

  }, [currentUser, onlineUsers]);

  const markAsRead = useCallback(async (chatId: string) => {
    if (!currentUser) return;
    
    messages.forEach(async (msg) => {
      const isGlobalMsg = chatId === GLOBAL_CHAT_ID && msg.receiverId === GLOBAL_CHAT_ID;
      const isDmFromContact = msg.senderId === chatId && msg.receiverId === currentUser.id;
      
      if ((isGlobalMsg || isDmFromContact) && !msg.readBy.includes(currentUser.id)) {
        const cacheKey = `${msg.id}-${currentUser.id}`;
        if (markedMessagesRef.current.has(cacheKey)) {
          return;
        }
        markedMessagesRef.current.add(cacheKey);

        const newReadBy = [...msg.readBy, currentUser.id];
        const newDeliveredTo = msg.deliveredTo.includes(currentUser.id) 
            ? msg.deliveredTo 
            : [...msg.deliveredTo, currentUser.id];

        try {
          await updateDoc(doc(db, 'messages', msg.id), {
            readBy: newReadBy,
            deliveredTo: newDeliveredTo
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `messages/${msg.id}`);
          markedMessagesRef.current.delete(cacheKey);
        }
      }
    });
  }, [currentUser, messages]);

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
