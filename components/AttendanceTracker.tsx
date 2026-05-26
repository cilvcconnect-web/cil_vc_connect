import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus, Attendance } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import RequestAttendanceChangeModal from './RequestAttendanceChangeModal';
import { 
  MapPin, 
  Compass, 
  Satellite, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  RefreshCw,
  Locate,
  History,
  Info
} from 'lucide-react';

interface AttendanceTrackerProps {
  conductorId: string;
}

// Coal India Limited HQ, Kolkata Core Geolocation Details
const CIL_HQ_COORDS = {
  latitude: 22.57925,
  longitude: 88.45992,
  name: "CIL HQ, Kolkata (Newtown)",
  address: "Premise No-04 MAR, Plot No-AF-III, Action Area-1A, Newtown, Rajarhat, Kolkata, West Bengal 700156"
};

// Help calculate real distance in meters using Haversine algorithm
const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface AutoLog {
  id: string;
  time: string;
  event: 'Checked In' | 'Checked Out' | 'Leave Mode' | 'Autopilot Toggle';
  details: string;
  distance: number | null;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ conductorId }) => {
  const { attendance, markInTime, markOutTime, markOnLeave } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);

  // Auto Attendance Geofence states
  const [isAutoAttendanceEnabled, setIsAutoAttendanceEnabled] = useState<boolean>(() => {
    return localStorage.getItem(`cil_auto_attendance_enabled_${conductorId}`) === 'true';
  });

  const [simulatedLocation, setSimulatedLocation] = useState<'hq' | 'parking' | 'outside' | 'away' | 'gps'>(() => {
    return (localStorage.getItem(`cil_auto_attendance_sim_${conductorId}`) as any) || 'hq';
  });

  const [customCoords, setCustomCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [autoLogs, setAutoLogs] = useState<AutoLog[]>(() => {
    const stored = localStorage.getItem(`cil_auto_attendance_logs_${conductorId}`);
    return stored ? JSON.parse(stored) : [];
  });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    localStorage.setItem(`cil_auto_attendance_enabled_${conductorId}`, String(isAutoAttendanceEnabled));
  }, [isAutoAttendanceEnabled, conductorId]);

  useEffect(() => {
    localStorage.setItem(`cil_auto_attendance_sim_${conductorId}`, simulatedLocation);
  }, [simulatedLocation, conductorId]);

  useEffect(() => {
    localStorage.setItem(`cil_auto_attendance_logs_${conductorId}`, JSON.stringify(autoLogs));
  }, [autoLogs, conductorId]);

  // Geolocation watch / trigger hook
  useEffect(() => {
    if (simulatedLocation !== 'gps' || !isAutoAttendanceEnabled) {
      setCustomCoords(null);
      setIsLocating(false);
      return;
    }

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setGpsError(null);
    setIsLocating(true);
    let watchId: number;

    const successHandler = (position: GeolocationPosition) => {
      setCustomCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setIsLocating(false);
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let msg = "Error getting location";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = "Location permission denied. Ensure applet coordinates access.";
          break;
        case error.POSITION_UNAVAILABLE:
          msg = "GPS signal is currently unavailable.";
          break;
        case error.TIMEOUT:
          msg = "GPS signal request timed out.";
          break;
      }
      setGpsError(msg);
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 8000
    });

    watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [simulatedLocation, isAutoAttendanceEnabled]);

  // Derive coordinates
  const activeCoords = useMemo(() => {
    if (simulatedLocation === 'gps') {
      return customCoords;
    }
    const sims = {
      hq: { latitude: 22.57925, longitude: 88.45992 },
      parking: { latitude: 22.57860, longitude: 88.45851 }, // ~161m away
      outside: { latitude: 22.58150, longitude: 88.46180 }, // ~312m away
      away: { latitude: 22.61000, longitude: 88.50000 },    // ~5.4km away
    };
    return sims[simulatedLocation] || null;
  }, [simulatedLocation, customCoords]);

  // Derive distance in meters
  const activeDistance = useMemo(() => {
    if (!activeCoords) return null;
    return getDistanceInMeters(
      activeCoords.latitude,
      activeCoords.longitude,
      CIL_HQ_COORDS.latitude,
      CIL_HQ_COORDS.longitude
    );
  }, [activeCoords]);

  const todaysAttendance = useMemo(() => {
    return attendance.find(a => a.conductorId === conductorId && a.date === todayStr);
  }, [attendance, conductorId, todayStr]);

  const conductorAttendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendance
      .filter(a => a.conductorId === conductorId)
      .forEach(a => {
        map.set(a.date, a);
      });
    return map;
  }, [attendance, conductorId]);

  // Auto Geofence Trigger Effect
  useEffect(() => {
    if (!isAutoAttendanceEnabled || activeDistance === null) return;

    const rec = attendance.find(a => a.conductorId === conductorId && a.date === todayStr);

    if (activeDistance <= 300) {
      // Auto Present when user enters radius of 300m
      if (!rec) {
        // Not marked yet today! Let's auto check in
        markInTime(conductorId);
        
        const logMsg: AutoLog = {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          event: "Checked In",
          details: `Entered geofence. Auto check-in verified.`,
          distance: activeDistance
        };
        setAutoLogs(prev => [logMsg, ...prev]);
      }
    } else {
      // Outside 300m - auto check out if they were checked-in and not checked-out
      if (rec && rec.status === AttendanceStatus.Present && rec.inTime && !rec.outTime) {
        markOutTime(conductorId);
        
        const logMsg: AutoLog = {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          event: "Checked Out",
          details: `Left geofence (Radius exceeded 300m). Auto out-of-office marked.`,
          distance: activeDistance
        };
        setAutoLogs(prev => [logMsg, ...prev]);
      }
    }
  }, [activeDistance, isAutoAttendanceEnabled, attendance, conductorId, todayStr, markInTime, markOutTime]);

  const addAutopilotToggleLog = (enabled: boolean) => {
    const logMsg: AutoLog = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      event: "Autopilot Toggle",
      details: enabled ? `Geofencing Autopilot activated for CIL HQ.` : `Geofencing Autopilot deactivated.`,
      distance: activeDistance
    };
    setAutoLogs(prev => [logMsg, ...prev]);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.Present:
        return 'text-green-400';
      case AttendanceStatus.OnLeave:
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };
  
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const clearAutoLogs = () => {
    setAutoLogs([]);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-cyan-400" />
          <h4 className="font-bold text-lg text-white">Duty Log Calendar</h4>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={goToPreviousMonth} variant="secondary" className="px-3 py-1 text-xs font-bold !rounded-lg hover:bg-slate-600 transition-colors">&lt;</Button>
                <h5 className="font-bold text-base text-cyan-100 uppercase tracking-widest">{monthName} {year}</h5>
                <Button onClick={goToNextMonth} variant="secondary" className="px-3 py-1 text-xs font-bold !rounded-lg hover:bg-slate-600 transition-colors">&gt;</Button>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => <div key={`${day}-${i}`}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5 mt-2">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const record = conductorAttendanceMap.get(dateStr);
                    const isToday = isCurrentMonth && day === today.getDate();

                    let dayClasses = "h-11 w-11 mx-auto flex flex-col items-center justify-center rounded-xl text-xs font-black transition-all relative";
                    if (isToday) dayClasses += " ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-800 bg-cyan-950/20 text-cyan-100";
                    
                    if (record) {
                        dayClasses += " cursor-pointer hover:scale-110";
                    }

                    if (record?.status === AttendanceStatus.Present) {
                        dayClasses += " bg-green-500/20 text-green-300 border border-green-500/30";
                    } else if (record?.status === AttendanceStatus.OnLeave) {
                        dayClasses += " bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
                    } else {
                        dayClasses += " text-slate-400 hover:bg-slate-700/40"
                    }

                    return (
                        <button 
                          key={day} 
                          className={dayClasses} 
                          title={record ? `${record.status} (${record.inTime ? 'Marked' : 'N/A'})` : "No Record"} 
                          onClick={() => record && setSelectedRecord(record)}
                          disabled={!record}
                        >
                            <span>{day}</span>
                            {record?.status === AttendanceStatus.Present && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-0.5" />
                            )}
                            {record?.status === AttendanceStatus.OnLeave && (
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-0.5" />
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="flex justify-center items-center gap-6 mt-6 pt-3 border-t border-slate-700/60 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-lg bg-green-500/30 border border-green-500/40"></span>
                    <span className="text-slate-300">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-lg bg-yellow-500/30 border border-yellow-500/40"></span>
                    <span className="text-slate-300">On Leave</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-lg border border-cyan-500/80"></span>
                    <span className="text-slate-300">Today</span>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="!p-6 bg-slate-900 border border-white/5 relative overflow-hidden rounded-[2rem] shadow-xl">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Duty Attendance Engine</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              Real-time Geofenced Duty logs
            </p>
          </div>
          <Button variant="secondary" onClick={() => setIsChangeRequestModalOpen(true)} className="!rounded-xl border-dashed !text-xs font-bold uppercase tracking-wider">
              Request Time Correction
          </Button>
        </div>

        {/* 🚀 NEW GEOFENCED AUTO-ATTENDANCE CONTROL PANEL */}
        <div className="mb-6 p-5 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[1.5rem] border border-cyan-500/20 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-3 border-b border-white/10">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
                <Satellite className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-black text-white tracking-tight uppercase text-sm">CIL HQ Kolkata Autopilot</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Automatic Location-based Attendance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-300 tracking-widest uppercase mr-1">
                {isAutoAttendanceEnabled ? 'Autopilot Active' : 'Autopilot Inactive'}
              </label>
              <button
                onClick={() => {
                  const nextState = !isAutoAttendanceEnabled;
                  setIsAutoAttendanceEnabled(nextState);
                  addAutopilotToggleLog(nextState);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  isAutoAttendanceEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
                title="Toggle Geofenced Auto-Attendance"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    isAutoAttendanceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {isAutoAttendanceEnabled ? (
            <div className="space-y-4">
              {/* Geofence specs and real-time computation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
                    <MapPin className="w-4 h-4" />
                    Target Coordinates
                  </div>
                  <div className="text-slate-200">
                    <p className="text-xs font-bold font-mono">Lat: 22.57925° N | Lon: 88.45992° E</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-semibold leading-relaxed">
                      Coal India HQ Premises, Newtown Action Area-1A, Rajarhat, Kolkata
                    </p>
                    <p className="text-[9px] text-orange-400 font-bold mt-1 uppercase">
                      Required Proximity Radius: ≤ 300 meters
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Compass className="w-4 h-4 animate-pulse" />
                        Live Computing Profile
                      </span>
                      {isLocating && <span className="text-[8px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">GPS Sync...</span>}
                    </div>
                    {gpsError ? (
                      <p className="text-xs text-red-400 mt-2 font-semibold">{gpsError}</p>
                    ) : activeCoords ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-bold text-white font-mono">
                          Curr: {activeCoords.latitude.toFixed(5)}° N, {activeCoords.longitude.toFixed(5)}° E
                        </p>
                        <p className="text-xs font-semibold text-slate-300">
                          Range: <span className="text-cyan-400 font-bold">{activeDistance !== null ? `${Math.round(activeDistance)} meters` : 'Calculating...'}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">Awaiting location coordinate...</p>
                    )}
                  </div>

                  {activeDistance !== null && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${activeDistance <= 300 ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {activeDistance <= 300 
                          ? 'Inside Geofence Zone (Presence Active)' 
                          : 'Outside Geofence Zone (Out-of-office Active)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* INTERACTIVE GEOLOCATION TESTING SIMULATOR */}
              <div className="bg-slate-900/40 p-3.5 rounded-xl border border-dashed border-cyan-500/20">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    Geofencing Sandbox Simulator (Review Tool)
                  </span>
                  <span className="text-[8px] border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">IFrame Tested</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                  Trigger geofence transitions instantly without leaving the office. Click a preset, or toggle "Act GPS" to get actual machine satellite coordinates.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => { setSimulatedLocation('hq'); setGpsError(null); }}
                    className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all ${
                      simulatedLocation === 'hq' 
                        ? 'bg-green-500 text-white shadow-md shadow-green-500/20 border border-green-600' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                    }`}
                  >
                    🏢 HQ Core (0m)
                  </button>
                  <button
                    onClick={() => { setSimulatedLocation('parking'); setGpsError(null); }}
                    className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all ${
                      simulatedLocation === 'parking' 
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20 border border-green-700' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                    }`}
                  >
                    🚗 Parking (161m)
                  </button>
                  <button
                    onClick={() => { setSimulatedLocation('outside'); setGpsError(null); }}
                    className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all ${
                      simulatedLocation === 'outside' 
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 border border-orange-600' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                    }`}
                  >
                    🛂 Border (312m)
                  </button>
                  <button
                    onClick={() => { setSimulatedLocation('away'); setGpsError(null); }}
                    className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all ${
                      simulatedLocation === 'away' 
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/20 border border-red-600' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                    }`}
                  >
                    🏠 Away (5.4km)
                  </button>
                  <button
                    onClick={() => { setSimulatedLocation('gps'); setGpsError(null); }}
                    className={`col-span-2 sm:col-span-1 py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                      simulatedLocation === 'gps' 
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 border border-cyan-600' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                    }`}
                  >
                    <Locate className="w-3 h-3 animate-pulse" />
                    Act GPS
                  </button>
                </div>
              </div>

              {/* AUTOPILOT ACTIVITY LOGS */}
              {autoLogs.length > 0 && (
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Autopilot Activity Console</span>
                    <button onClick={clearAutoLogs} className="text-[9px] text-red-400 hover:text-red-300 font-extrabold uppercase tracking-widest transition-colors">
                      Clear Console
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {autoLogs.map(log => (
                      <div key={log.id} className="flex justify-between items-start gap-3 bg-slate-950/40 p-2 rounded-lg text-[10px] border border-white/5">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-black uppercase tracking-wide ${
                            log.event === 'Checked In' ? 'text-green-400' : log.event === 'Checked Out' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {log.event === 'Checked In' ? '✔ ' : log.event === 'Checked Out' ? '⚡ ' : 'ℹ '}
                            {log.event}
                          </span>
                          <span className="text-slate-400 leading-normal">{log.details}</span>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0 select-none">
                          <span className="text-[9px] font-bold text-slate-500 font-mono">{log.time}</span>
                          {log.distance !== null && (
                            <span className="text-[8px] text-cyan-500 bg-cyan-950/30 px-1 rounded-full mt-0.5">{Math.round(log.distance)}m away</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-4 p-2">
              <div className="p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-400">
                <Info className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-300 uppercase">Interactive Manual Mode Engaged</h5>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Autopilot location scanning is off. Position triggers and geofencing check-ins are disabled. Use the manual marking tools below to file your duty record. Turn Autopilot on to automate this completely!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 📋 CURRENT ATTENDANCE LOGICAL BADGE CARD */}
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-white/5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1 mb-1">Service Stamp Date</p>
              <h4 className="font-bold text-lg text-white">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h4>
            </div>

            {todaysAttendance ? (
              <div className="flex items-center gap-3 bg-slate-950/40 py-2.5 px-4 rounded-xl border border-white/5">
                <div className={`h-2.5 w-2.5 rounded-full animate-ping ${
                  todaysAttendance.status === AttendanceStatus.Present ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                <div className="text-slate-300">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Marked Status</p>
                  <p className={`font-black text-sm uppercase tracking-wider ${getStatusColor(todaysAttendance.status)}`}>
                    {todaysAttendance.status}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-slate-950/40 py-2.5 px-4 rounded-xl border border-white/5">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Marked Status</p>
                  <p className="font-bold text-sm text-slate-400 uppercase tracking-wider">Unmarked</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/60">
            {todaysAttendance ? (
              <div className="space-y-3">
                {todaysAttendance.status === AttendanceStatus.Present && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">In-Office Arrival stamp</p>
                      <p className="font-black text-white text-base font-mono">
                        {todaysAttendance.inTime ? formatTime(todaysAttendance.inTime) : 'N/A'}
                      </p>
                      {isAutoAttendanceEnabled && (
                        <span className="text-[8px] text-green-400 uppercase font-black tracking-widest mt-1 block">Verified by Autopilot</span>
                      )}
                    </div>
                    
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Out-of-Office Departure stamp</p>
                        <p className="font-black text-white text-base font-mono">
                          {todaysAttendance.outTime ? formatTime(todaysAttendance.outTime) : 'Ongoing Duty'}
                        </p>
                      </div>
                      
                      {!todaysAttendance.outTime && !isAutoAttendanceEnabled && (
                        <Button onClick={() => markOutTime(conductorId)} className="mt-2 w-full !py-1 text-xs font-bold uppercase tracking-wider">
                          Manual Out Time
                        </Button>
                      )}

                      {!todaysAttendance.outTime && isAutoAttendanceEnabled && (
                        <p className="text-[8px] text-yellow-400 uppercase font-bold tracking-widest mt-2 leading-tight">
                          Autopilot will mark Out-Time if you exit CIL HQ radius (&gt;300m)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {todaysAttendance.status === AttendanceStatus.OnLeave && (
                  <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                    <p className="text-[10px] text-yellow-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      Day Off Marked
                    </p>
                    <p className="text-xs text-yellow-100 font-semibold leading-relaxed">
                      You are marked as "On Leave" for today. Automatic location triggers and manual clockings are closed. Please request an Attendance correction if you need to reverse this.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-4 leading-relaxed">
                  No active attendance is filed for today. You can toggle Autopilot on and enter the simulated CIL HQ to register automatically, or file manual timestamps below.
                </p>
                <div className="flex gap-3">
                  <Button variant="success" onClick={() => markInTime(conductorId)} className="flex-1 !py-2.5 font-bold uppercase text-xs tracking-widest">
                    Manual In Time
                  </Button>
                  <Button variant="secondary" onClick={() => markOnLeave(conductorId)} className="flex-1 !py-2.5 font-bold uppercase text-xs tracking-widest">
                    Mark On Leave
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CALENDAR HISTORY */}
        {renderCalendar()}
      </div>

      {/* DETAILED LOG RECORD MODAL */}
      {selectedRecord && (
        <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Historical Log Sheet">
            <div className="space-y-4">
                <div className="bg-slate-900 border border-white/5 p-4 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Calendar Service Date</p>
                    <p className="font-bold text-lg text-white">
                      {new Date(selectedRecord.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duty Status</p>
                      <span className={`font-black text-sm uppercase tracking-wider ${getStatusColor(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                  </div>

                  {selectedRecord.status === AttendanceStatus.Present && (
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arrival Time</p>
                        <p className="font-black text-white text-base font-mono">{formatTime(selectedRecord.inTime)}</p>
                    </div>
                  )}
                </div>

                {selectedRecord.status === AttendanceStatus.Present && (
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Departure Time</p>
                        <p className="font-black text-white text-base font-mono">
                          {selectedRecord.outTime ? formatTime(selectedRecord.outTime) : 'Not Checked Out / Ongoing'}
                        </p>
                    </div>
                )}
            </div>
            <div className="flex justify-end mt-8">
                <Button variant="secondary" onClick={() => setSelectedRecord(null)} className="!rounded-xl font-bold uppercase text-xs tracking-widest">Close Record</Button>
            </div>
        </Modal>
      )}

      {/* TIME CORRECTION REQUEST MODAL */}
      <RequestAttendanceChangeModal
        isOpen={isChangeRequestModalOpen}
        onClose={() => setIsChangeRequestModalOpen(false)}
        conductorId={conductorId}
       />
    </Card>
  );
};

export default AttendanceTracker;
