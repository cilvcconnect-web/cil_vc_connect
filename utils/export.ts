
import { VC, User, Attendance } from '../types';

// The xlsx library is loaded from a script tag in index.html, so we declare it here to inform TypeScript.
declare const XLSX: any;

/**
 * Exports an array of VC objects to a CSV file.
 * @param vcs - The array of VCs to export.
 * @param users - The array of all users, used to map IDs to names.
 * @param filename - The desired name for the downloaded file.
 */
export const exportVCsToCSV = (vcs: VC[], users: User[], filename: string) => {
  if (!vcs || vcs.length === 0) {
    alert('No data available to export.');
    return;
  }

  const getUserName = (userId: string): string => {
    return users.find(u => u.id === userId)?.name || 'N/A';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    // Use toLocaleString for a more universally readable date format.
    return new Date(dateString).toLocaleString();
  };

  // Map VC data to a more human-readable format for the CSV.
  const dataToExport = vcs.map(vc => ({
    'VC ID': vc.id,
    'Subject': vc.subject,
    'Location(s)': vc.locations.join('; '),
    'Status': vc.status,
    'Scheduled Start Time': formatDate(vc.startTime),
    'Actual Start Time': formatDate(vc.actualStartTime),
    'Actual End Time': formatDate(vc.actualEndTime),
    'Manager': getUserName(vc.managerId),
    'Reporting Authority': getUserName(vc.reportingAuthorityId),
    'Conductor': getUserName(vc.conductorId),
    'Meeting Link': vc.link || 'N/A',
    'Presentation Link': vc.pptLink || 'N/A',
    'Remarks': vc.remarks || 'N/A',
    'Created At': formatDate(vc.createdAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'VC Data');

  // Ensure the filename has a .csv extension.
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  // Trigger the file download.
  XLSX.writeFile(workbook, finalFilename, { bookType: 'csv' });
};

/**
 * Exports an array of Attendance objects to a CSV file.
 * @param attendance - The array of Attendance records to export.
 * @param users - The array of all users.
 * @param filename - The desired name for the downloaded file.
 */
export const exportAttendanceToCSV = (attendance: Attendance[], users: User[], filename: string) => {
  if (!attendance || attendance.length === 0) {
    alert('No data available to export.');
    return;
  }

  const getUserName = (userId: string): string => {
    return users.find(u => u.id === userId)?.name || 'N/A';
  };

  const formatTime = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const dataToExport = attendance.map(record => ({
    'Date': record.date,
    'Conductor Name': getUserName(record.conductorId),
    'Status': record.status,
    'In Time': formatTime(record.inTime),
    'Out Time': formatTime(record.outTime)
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Data');

  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  XLSX.writeFile(workbook, finalFilename, { bookType: 'csv' });
};

/**
 * Exports the list of Users to a CSV file.
 * @param users - The array of users to export.
 * @param filename - The desired name for the downloaded file.
 */
export const exportUsersToCSV = (users: User[], filename: string) => {
    if (!users || users.length === 0) {
      alert('No user data available to export.');
      return;
    }
  
    const dataToExport = users.map(user => ({
      'User ID': user.id,
      'Full Name': user.name,
      'Role': user.role,
      'Phone Number': user.phoneNumber,
      'Status': user.status,
      'Reminders Enabled': user.remindersEnabled ? 'Yes' : 'No',
      'Deletion Requested': user.deletionRequested ? 'Yes' : 'No'
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User List');
  
    const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    XLSX.writeFile(workbook, finalFilename, { bookType: 'csv' });
  };
