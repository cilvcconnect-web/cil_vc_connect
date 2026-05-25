
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, VCStatus } from '../types';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';
import { PREDEFINED_ROOMS } from '../constants';
import WebexImportModal from './WebexImportModal';
import { WebexParsedDetails } from '../services/webexService';

const WebexIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
);

const NewVCScreen: React.FC = () => {
  const { currentUser, getUsersByRole, scheduleVC, vcs } = useAppContext();
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [locations, setLocations] = useState(['']);
  const [roomIp, setRoomIp] = useState('');
  const [roomName, setRoomName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [link, setLink] = useState('');
  const [pptLink, setPptLink] = useState('');
  const [webexId, setWebexId] = useState('');
  const [isWebexMeeting, setIsWebexMeeting] = useState(false);
  const [isWebexModalOpen, setIsWebexModalOpen] = useState(false);
  
  // Pre-select current user as Reporting Authority if applicable
  const [reportingAuthorityId, setReportingAuthorityId] = useState(
    currentUser?.role === UserRole.ReportingAuthority ? currentUser.id : ''
  );
  const [conductorId, setConductorId] = useState('');

  const reportingAuthorities = getUsersByRole(UserRole.ReportingAuthority);
  
  const busyConductorIds = useMemo(() =>
    new Set(
      vcs
        .filter(vc => vc.status === VCStatus.InProgress)
        .map(vc => vc.conductorId)
    ),
  [vcs]);

  const allConductors = useMemo(() => getUsersByRole(UserRole.Conductor), [getUsersByRole]);

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const addLocation = () => {
    setLocations([...locations, '']);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
    }
  };

  const handlePredefinedRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedIp = e.target.value;
      const room = PREDEFINED_ROOMS.find(r => r.ip === selectedIp);
      if (room) {
          setRoomIp(room.ip);
          setRoomName(room.name);
      }
  };

  const handleWebexImport = (details: WebexParsedDetails) => {
      setSubject(details.subject);
      setLink(details.link);
      setWebexId(details.webexId);
      setIsWebexMeeting(true);
      
      // Attempt to set start time for input[type="datetime-local"]
      if (details.startTime) {
          try {
              const dt = new Date(details.startTime);
              const formatted = dt.toISOString().slice(0, 16);
              setStartTime(formatted);
          } catch(e) {}
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredLocations = locations.filter(loc => loc.trim() !== '');
    if (!currentUser || !subject || filteredLocations.length === 0 || !startTime || !reportingAuthorityId) {
      alert('Please fill all required fields, including at least one location.');
      return;
    }

    scheduleVC({
      subject,
      locations: filteredLocations,
      roomIp: roomIp || undefined,
      roomName: roomName || undefined,
      startTime: new Date(startTime).toISOString(),
      link,
      pptLink,
      managerId: currentUser.id,
      reportingAuthorityId,
      conductorId: conductorId || undefined,
      isWebexMeeting,
      webexId: webexId || undefined,
    });

    alert('VC scheduled successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule a New VC</h2>
              <Button 
                onClick={() => setIsWebexModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3"
              >
                  <WebexIcon />
                  Quick Import Webex
              </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <input
                id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} required
                className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location(s)</label>
              {locations.map((location, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Location #${index + 1}`}
                    value={location}
                    onChange={(e) => handleLocationChange(index, e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  {locations.length > 1 && (
                    <button type="button" onClick={() => removeLocation(index)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-lg flex-shrink-0">
                      &#x2715;
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addLocation} className="text-sm">
                + Add Another Location
              </Button>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">Connection Details</p>
                
                <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quick Select Room</label>
                    <select 
                        onChange={handlePredefinedRoomChange}
                        className="w-full p-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                        defaultValue=""
                    >
                        <option value="" disabled>-- Select a Predefined Room --</option>
                        {PREDEFINED_ROOMS.map(room => (
                            <option key={room.ip} value={room.ip}>{room.name} ({room.ip})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Name</label>
                        <input
                            id="roomName" type="text" value={roomName} onChange={e => setRoomName(e.target.value)}
                            placeholder="e.g., Board Room"
                            className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="roomIp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room IP</label>
                        <input
                            id="roomIp" type="text" value={roomIp} onChange={e => setRoomIp(e.target.value)}
                            placeholder="e.g., 192.168.1.10"
                            className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
              <input
                id="startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required
                className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="relative">
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meeting Link (Optional)</label>
                <input
                  id="link" type="url" value={link} onChange={e => setLink(e.target.value)}
                  className={`w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 ${isWebexMeeting ? 'ring-2 ring-blue-500' : ''}`}
                />
                {isWebexMeeting && (
                    <span className="absolute right-2 top-9 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Webex Linked</span>
                )}
              </div>
               <div>
                <label htmlFor="pptLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Presentation Link (Optional)</label>
                <input
                  id="pptLink" type="url" value={pptLink} onChange={e => setPptLink(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reportingAuthority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reporting Authority</label>
                <select
                  id="reportingAuthority" value={reportingAuthorityId} onChange={e => setReportingAuthorityId(e.target.value)} required
                  className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" disabled>-- Select Authority --</option>
                  {reportingAuthorities.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="conductor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conductor (Optional)</label>
                <select
                  id="conductor" value={conductorId} onChange={e => setConductorId(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- Select Conductor (Optional) --</option>
                  {allConductors.map(c => {
                    const isBusy = busyConductorIds.has(c.id);
                    const style = isBusy ? { color: '#F87171' } : {}; // Red-400
                    return (
                        <option key={c.id} value={c.id} disabled={isBusy} style={style}>
                            {c.name} {isBusy ? '(In a meeting)' : ''}
                        </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit">Schedule VC</Button>
            </div>
          </form>
        </Card>
      </main>

      <WebexImportModal 
        isOpen={isWebexModalOpen} 
        onClose={() => setIsWebexModalOpen(false)} 
        onImport={handleWebexImport}
      />
    </div>
  );
};

export default NewVCScreen;
