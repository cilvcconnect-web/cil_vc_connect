
// Define data structures used throughout the application.
export enum UserRole {
  Manager = 'Manager',
  ReportingAuthority = 'Reporting Authority',
  Conductor = 'Conductor',
  RailTel = 'RailTel',
}

export enum UserStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phoneNumber: string;
  password?: string;
  profilePhoto?: string;
  remindersEnabled?: boolean;
  reminderMinutes?: number;
  vcReminderTune?: string;
  technicalIssueTune?: string;
  status: UserStatus;
  deletionRequested?: boolean;
}

export enum VCStatus {
  Scheduled = 'Scheduled',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Postponed = 'Postponed',
}

export interface VC {
  id: string;
  subject: string;
  locations: string[];
  roomIp?: string;
  roomName?: string;
  buildingType?: 'Office Block' | 'Corporate Block';
  startTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  link?: string;
  pptLink?: string;
  managerId: string;
  reportingAuthorityId: string;
  conductorId?: string;
  status: VCStatus;
  remarks?: string;
  createdAt: string;
  technicalIssue?: boolean;
  technicalIssueDescription?: string;
  // Webex specific fields
  isWebexMeeting?: boolean;
  webexId?: string;
  webexInviteRaw?: string;
}

export enum AttendanceStatus {
  Present = 'Present',
  OnLeave = 'On Leave',
}

export interface Attendance {
  conductorId: string;
  date: string;
  status: AttendanceStatus;
  inTime?: string;
  outTime?: string;
}

export enum AttendanceChangeRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface AttendanceChangeRequest {
  id: string;
  conductorId: string;
  date: string;
  requestedInTime: string;
  requestedOutTime: string | null;
  reason: string;
  status: AttendanceChangeRequestStatus;
  createdAt: string;
}

export enum SalaryStatus {
  Draft = 'Draft',
  PendingRA = 'Pending RA Approval',
  PendingManager = 'Pending Manager Approval',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface SalaryVoucher {
  id: string;
  userId: string;
  date: string;
  voucherType: 'CASH' | 'BANK';
  paidTo: string;
  accountCode: string;
  accountNo: string;
  bankName: string;
  ifscCode: string;
  project: string;
  advance: string;
  amount: number;
  amountInWords: string;
  description: string;
  status: SalaryStatus;
  checkedByRaId?: string;
  checkedDate?: string;
  passedByManagerId?: string;
  passedDate?: string;
  createdAt: string;
}

export interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  name?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  deliveredTo: string[];
  readBy: string[];
  attachment?: MessageAttachment;
}

export type NewVCData = Omit<VC, 'id' | 'status' | 'createdAt'>;
export type EmergencyVCData = Omit<VC, 'id' | 'status' | 'createdAt'>;
