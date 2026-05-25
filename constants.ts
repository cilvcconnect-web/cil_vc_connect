
import { User, VC, UserRole, VCStatus, Attendance, AttendanceStatus, AttendanceChangeRequest, UserStatus, Message } from './types';

export const USERS: User[] = [
  { id: 'manager-1', name: 'Mr. Sharma', role: UserRole.Manager, phoneNumber: '123-456-7890', password: '123456', remindersEnabled: true, reminderMinutes: 30, status: UserStatus.Approved },
  { id: 'manager-2', name: 'Ms. Gupta', role: UserRole.Manager, phoneNumber: '123-456-7891', password: '123456', remindersEnabled: true, reminderMinutes: 30, status: UserStatus.Approved },
  { id: 'ra-1', name: 'Dr. Verma', role: UserRole.ReportingAuthority, phoneNumber: '234-567-8901', password: '123456', remindersEnabled: false, reminderMinutes: 15, status: UserStatus.Approved },
  { id: 'conductor-1', name: 'Anil Kumar', role: UserRole.Conductor, phoneNumber: '345-678-9012', password: '123456', remindersEnabled: true, reminderMinutes: 40, status: UserStatus.Approved },
  { id: 'conductor-2', name: 'Sunita Devi', role: UserRole.Conductor, phoneNumber: '345-678-9013', password: '123456', remindersEnabled: true, reminderMinutes: 40, status: UserStatus.Approved },
  { id: 'conductor-3', name: 'Rajesh Patel', role: UserRole.Conductor, phoneNumber: '345-678-9014', password: '123456', remindersEnabled: true, reminderMinutes: 40, status: UserStatus.Approved },
  { id: 'railtel-1', name: 'RailTel Tech Support', role: UserRole.RailTel, phoneNumber: '999-888-7777', password: '123456', remindersEnabled: true, reminderMinutes: 15, status: UserStatus.Approved },
];

const now = new Date();
const getFutureDate = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
const getPastDate = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const getPastDateISO = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};
const getPastDateTimeISO = (days: number, hours: number, minutes: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
}


export const INITIAL_VCS: VC[] = [
  {
    id: 'vc-1',
    subject: 'Q2 Performance Review',
    locations: ['Conference Room A'],
    startTime: getFutureDate(2),
    link: 'https://bhartavc.gov.in/meeting/1',
    pptLink: 'https://example.com/presentations/q2-review.pptx',
    managerId: 'manager-1',
    reportingAuthorityId: 'ra-1',
    conductorId: 'conductor-1',
    status: VCStatus.Scheduled,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vc-2',
    subject: 'Project Alpha Kick-off',
    locations: ['Board Room'],
    startTime: getFutureDate(24),
    link: 'https://webex.com/meeting/2',
    managerId: 'manager-1',
    reportingAuthorityId: 'ra-1',
    conductorId: 'conductor-2',
    status: VCStatus.Scheduled,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vc-3',
    subject: 'Daily Operations Sync',
    locations: ['VC Room 3'],
    startTime: getPastDate(1),
    actualStartTime: getPastDate(1),
    actualEndTime: getPastDate(0.5),
    link: 'https://bhartavc.gov.in/meeting/3',
    managerId: 'manager-2',
    reportingAuthorityId: 'ra-1',
    conductorId: 'conductor-1',
    status: VCStatus.Completed,
    remarks: 'Audio issues in the first 5 minutes.',
    createdAt: getPastDate(2)
  },
];

export const INITIAL_ATTENDANCE: Attendance[] = [
    { conductorId: 'conductor-1', date: getPastDateISO(1), status: AttendanceStatus.Present, inTime: getPastDateTimeISO(1, 9, 5), outTime: getPastDateTimeISO(1, 17, 32) },
    { conductorId: 'conductor-1', date: getPastDateISO(2), status: AttendanceStatus.Present, inTime: getPastDateTimeISO(2, 8, 59) },
    { conductorId: 'conductor-1', date: getPastDateISO(3), status: AttendanceStatus.OnLeave },
    { conductorId: 'conductor-1', date: getPastDateISO(4), status: AttendanceStatus.Present, inTime: getPastDateTimeISO(4, 9, 15), outTime: getPastDateTimeISO(4, 18, 2) },
    { conductorId: 'conductor-2', date: getPastDateISO(1), status: AttendanceStatus.Present, inTime: getPastDateTimeISO(1, 9, 3), outTime: getPastDateTimeISO(1, 17, 45) },
    { conductorId: 'conductor-2', date: getPastDateISO(2), status: AttendanceStatus.OnLeave },
];

export const INITIAL_ATTENDANCE_CHANGE_REQUESTS: AttendanceChangeRequest[] = [];

export const GLOBAL_CHAT_ID = 'GLOBAL';

// Mocking 'readBy' with multiple users to simulate historical reads
const ALL_USER_IDS = USERS.map(u => u.id);

export const INITIAL_MESSAGES: Message[] = [
    { id: 'm1', senderId: 'manager-1', receiverId: GLOBAL_CHAT_ID, content: 'Welcome to the CIL VC Connect Global Chat!', timestamp: getPastDateTimeISO(0, 8, 0), deliveredTo: ALL_USER_IDS, readBy: ALL_USER_IDS },
    { id: 'm2', senderId: 'conductor-1', receiverId: GLOBAL_CHAT_ID, content: 'Hello everyone! Ready for the day.', timestamp: getPastDateTimeISO(0, 8, 15), deliveredTo: ALL_USER_IDS, readBy: ALL_USER_IDS },
    { id: 'm3', senderId: 'ra-1', receiverId: GLOBAL_CHAT_ID, content: 'Please ensure all VC equipment is tested by 9 AM.', timestamp: getPastDateTimeISO(0, 8, 30), deliveredTo: ALL_USER_IDS, readBy: ALL_USER_IDS },
];

export const PREDEFINED_ROOMS = [
    { name: 'DM Chamber', ip: '112.133.201.83' },
    { name: 'CVO Chamber', ip: '112.133.201.84' },
    { name: '6th Floor Conference Hall', ip: '112.133.201.85' },
    { name: '5th Floor Chairman Chamber', ip: '112.133.201.86' },
    { name: '5th Floor Meeting Room CB', ip: '112.133.201.87' },
    { name: 'Board Room', ip: '112.133.201.88' },
    { name: 'DP Chamber', ip: '112.133.201.89' },
    { name: 'DT Chamber', ip: '112.133.201.90' },
    { name: 'DBD Chamber', ip: '112.133.201.91' },
    { name: '1st Floor OB Meeting Room', ip: '112.133.201.92' },
    { name: '3rd Floor OB Meeting Room', ip: '112.133.201.93' },
    { name: 'DF Chamber', ip: '112.133.201.94' },
];
