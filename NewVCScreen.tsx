
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, VCStatus } from '../types';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';

const NewVCScreen: React.FC = () => {
  const { currentUser, getUsersByRole, scheduleVC, vcs } = useAppContext();
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [locations, setLocations] = useState(['']);
  const [startTime, setStartTime] = useState('');
  const [link, setLink] = useState('');
  const [pptLink, setPptLink] = useState('');
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredLocations = locations.filter(loc => loc.trim() !== '');
    // conductorId is now optional
    if (!currentUser || !subject || filteredLocations.length === 0 || !startTime || !reportingAuthorityId) {
      alert('Please fill all required fields, including at least one location.');
      return;
    }

    scheduleVC({
      subject,
      locations: filteredLocations,
      startTime: new Date(startTime).toISOString(),
      link,
      pptLink,
      managerId: currentUser.id,
      reportingAuthorityId,
      conductorId: conductorId || undefined, // Pass undefined if empty string
    });

    alert('VC scheduled successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Schedule a New VC</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input
                id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} required
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location(s)</label>
              {locations.map((location, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Location #${index + 1}`}
                    value={location}
                    onChange={(e) => handleLocationChange(index, e.target.value)}
                    className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
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
            
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
              <input
                id="startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-2">Meeting Link (Optional)</label>
                <input
                  id="link" type="url" value={link} onChange={e => setLink(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
               <div>
                <label htmlFor="pptLink" className="block text-sm font-medium text-gray-300 mb-2">Presentation Link (Optional)</label>
                <input
                  id="pptLink" type="url" value={pptLink} onChange={e => setPptLink(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reportingAuthority" className="block text-sm font-medium text-gray-300 mb-2">Reporting Authority</label>
                <select
                  id="reportingAuthority" value={reportingAuthorityId} onChange={e => setReportingAuthorityId(e.target.value)} required
                  className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" disabled>-- Select Authority --</option>
                  {reportingAuthorities.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="conductor" className="block text-sm font-medium text-gray-300 mb-2">Conductor (Optional)</label>
                <select
                  id="conductor" value={conductorId} onChange={e => setConductorId(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
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
    </div>
  );
};

export default NewVCScreen;
